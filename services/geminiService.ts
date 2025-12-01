import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category, Goal, Investment, TransactionType, TransactionItem } from "../types";

// Initialize Gemini Client
// IMPORTANT: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini Vision/Multimodal to extract data from a receipt image or PDF.
 * Now accepts the list of existing categories to perform intelligent mapping.
 */
export const parseReceiptDocument = async (
  base64Data: string, 
  mimeType: string = 'image/jpeg',
  availableCategories: Category[] = []
): Promise<{
  merchant: string;
  amount: number;
  date: string;
  categoryName: string; // The exact name of the matched category
  type: 'income' | 'expense';
  items: TransactionItem[];
}> => {
  try {
    // Create a list of category names for the AI to choose from
    const categoryNames = availableCategories.length > 0 
      ? availableCategories.map(c => c.name).join(", ")
      : "Alimentación, Transporte, Vivienda, Entretenimiento, Salud, Servicios, Otros";
    
    const promptText = `
      Actúa como un asistente contable experto. Analiza este documento financiero (imagen o PDF).
      
      TAREA 1: CLASIFICAR TIPO DE TRANSACCIÓN (CRÍTICO)
      - Determina si es un GASTO (Expense) o un INGRESO (Income).
      - Pistas para INGRESO: Palabras como "Liquidación de Sueldo", "Nómina", "Honorarios", "Abono", "Transferencia Recibida", "Devolución", "Pago de Factura (emitida)".
      - Pistas para GASTO: "Ticket", "Boleta Fiscal", "Factura de Compra", "Total a Pagar", "Consumo", "Venta", tickets de supermercado, restaurantes, tiendas.
      
      TAREA 2: EXTRAER DATOS
      - Comerciante/Pagador: Nombre de la tienda, empresa o persona.
      - Monto: El total final del documento.
      - Fecha: Formato YYYY-MM-DD. Si no hay año, asume el actual.
      - Items: Extrae la lista detallada de productos o servicios comprados, con su precio individual si es legible. Si no hay items individuales claros, usa una descripción general.
      
      TAREA 3: CATEGORIZAR
      - Clasifica la transacción en EXACTAMENTE UNA de estas categorías: [${categoryNames}].
      - Si es un Ingreso, busca una categoría relacionada con ingresos si existe (ej. "Salario", "Ventas"), si no, usa "Ingresos" o "Otros".
      - Si es Gasto, elige la categoría más lógica.
      
      Devuelve SOLO JSON válido.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING, description: "Nombre del comercio o pagador" },
            amount: { type: Type.NUMBER, description: "Monto total numérico" },
            date: { type: Type.STRING, description: "Fecha ISO YYYY-MM-DD" },
            categoryName: { type: Type.STRING, description: "Categoría seleccionada de la lista" },
            type: { type: Type.STRING, enum: ["income", "expense"], description: "Tipo determinado de la transacción" },
            items: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER }
                },
                required: ["description", "amount"]
              },
              description: "Lista detallada de items y sus precios"
            },
          },
          required: ["amount", "merchant", "type", "categoryName", "items"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No se obtuvo respuesta de la IA.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing receipt:", error);
    throw error;
  }
};

/**
 * Chats with the AI Assistant using the current financial context.
 */
export const chatWithFinancialAssistant = async (
  history: { role: string; parts: { text: string }[] }[],
  currentMessage: string,
  contextData: {
    transactions: Transaction[];
    categories: Category[];
    goals: Goal[];
    investments: Investment[];
  }
): Promise<string> => {
  try {
    // Create a summarized context string to keep tokens efficient
    const contextString = `
      CONTEXTO FINANCIERO ACTUAL DEL USUARIO:
      - Transacciones recientes (${contextData.transactions.length}): ${JSON.stringify(contextData.transactions.slice(0, 50))}
      - Categorías y Presupuestos: ${JSON.stringify(contextData.categories)}
      - Metas de Ahorro: ${JSON.stringify(contextData.goals)}
      - Inversiones: ${JSON.stringify(contextData.investments)}
      
      INSTRUCCIONES:
      Eres "FinanzaBot", un asistente financiero experto, amable y motivador.
      Responde a las preguntas del usuario basándote ESTRICTAMENTE en los datos proporcionados arriba.
      Si te preguntan por gastos, calcula las sumas basándote en el JSON.
      Si sugieres ahorrar, mira sus metas.
      Sé conciso y directo. Usa formato Markdown para listas o negritas.
    `;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: contextString,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
    });

    const result = await chat.sendMessage({
      message: currentMessage
    });

    return result.text || "Lo siento, no pude procesar tu respuesta.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Tuve un problema conectando con el servicio de IA. Por favor intenta de nuevo.";
  }
};