
import React, { useState, useRef } from 'react';
import { Transaction, TransactionType, PaymentMethod, Category, TransactionItem } from '../types';
import { CameraIcon, DocumentTextIcon, CheckCircleIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { parseReceiptDocument } from '../services/geminiService';

interface TransactionFormProps {
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  onClose?: () => void;
  currency: string;
}

// Utility to resize and compress image to speed up API transfer
// NOTE: Only for images, not PDFs
const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // 1024px is enough for OCR and much faster to upload
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG at 0.7 quality
        // This reduces 5MB files to ~100-200KB
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Utility to read file as base64 without resizing (for PDFs)
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, categories, onClose, currency }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [autoFilled, setAutoFilled] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.DEBIT_CARD);
  const [items, setItems] = useState<TransactionItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    onAddTransaction({
      type,
      amount: parseFloat(amount),
      categoryId,
      date,
      note,
      merchant,
      paymentMethod,
      items: items.length > 0 ? items : undefined
    });
    
    // Reset Form
    setAmount('');
    setNote('');
    setMerchant('');
    setItems([]);
    setCategoryId(categories[0]?.id || '');
    setAutoFilled(false);
    
    // Show Success Toast
    setShowSuccessToast(true);
    setTimeout(() => {
        setShowSuccessToast(false);
    }, 3000);

    if (onClose) onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadingStatus("Leyendo archivo...");
    setAutoFilled(false);

    try {
      let base64String = "";
      let mimeType = file.type;

      if (file.type === 'application/pdf') {
        // Handle PDF
        setLoadingStatus("Procesando PDF...");
        const dataUrl = await readFileAsBase64(file);
        // dataUrl format is "data:application/pdf;base64,....."
        base64String = dataUrl.split(',')[1];
      } else if (file.type.startsWith('image/')) {
        // Handle Image with Optimization
        setLoadingStatus("Optimizando imagen...");
        const dataUrl = await processImage(file);
        base64String = dataUrl.split(',')[1];
        mimeType = 'image/jpeg'; // processImage output is always jpeg
      } else {
        throw new Error("Formato no soportado. Usa PDF, JPG o PNG.");
      }
      
      // 2. Send to Gemini with Categories context
      setLoadingStatus("Analizando documento...");
      
      // We pass the categories so Gemini can match the receipt to an existing one
      const data = await parseReceiptDocument(base64String, mimeType, categories);
      
      // 3. Auto-fill form
      setAmount(data.amount?.toString() || '');
      setMerchant(data.merchant || '');
      
      if (data.date) setDate(data.date);
      
      if (data.items && data.items.length > 0) {
        setItems(data.items);
      } else {
        setItems([]);
      }
      
      // Auto-set Type (Income vs Expense)
      if (data.type === 'income') {
        setType(TransactionType.INCOME);
      } else {
        setType(TransactionType.EXPENSE);
      }
      
      // Attempt to match category based on AI suggestion
      if (data.categoryName) {
        // Try exact match first
        let match = categories.find(c => c.name.toLowerCase() === data.categoryName.toLowerCase());
        
        // If no exact match, try fuzzy inclusion
        if (!match) {
          match = categories.find(c => c.name.toLowerCase().includes(data.categoryName.toLowerCase()));
        }

        if (match) {
           setCategoryId(match.id);
        }
      }
      
      setAutoFilled(true);
      setActiveTab('manual'); // Switch to manual view to review/edit
    } catch (error) {
      console.error("OCR Failed", error);
      alert("No se pudo procesar el documento. Asegúrate de que el PDF o Imagen sea legible.");
    } finally {
      setLoading(false);
      setLoadingStatus("");
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleItemChange = (index: number, field: keyof TransactionItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'amount') {
      newItems[index].amount = parseFloat(value as string) || 0;
    } else {
      newItems[index].description = value as string;
    }
    setItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const updateTotalFromItems = () => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    setAmount(total.toFixed(2));
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden max-w-lg mx-auto relative">
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === 'manual' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-700'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
            activeTab === 'scan' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-700'
          }`}
        >
          Escanear / Subir PDF
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'scan' ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/50 hover:bg-slate-800 transition-colors relative">
             {loading ? (
               <div className="text-center p-4">
                 <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                 <p className="text-sm font-semibold text-slate-200">{loadingStatus}</p>
                 <p className="text-xs text-slate-400 mt-1">Detectando tipo, monto y categoría...</p>
               </div>
             ) : (
               <>
                 <div className="flex gap-2 mb-2">
                    <CameraIcon className="w-10 h-10 text-slate-500" />
                    <DocumentTextIcon className="w-10 h-10 text-slate-500" />
                 </div>
                 <p className="text-sm font-medium text-slate-300">Sube foto (JPG/PNG) o PDF</p>
                 <p className="text-xs text-slate-500 mt-1">Auto-detecta Ingresos vs Gastos</p>
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
               </>
             )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {autoFilled && (
                <div className="bg-emerald-900/30 text-emerald-400 px-4 py-2 rounded-lg text-xs flex items-center gap-2 mb-2 border border-emerald-800 animate-pulse">
                    <CheckCircleIcon className="w-4 h-4" />
                    Datos extraídos automáticamente. Por favor confirma.
                </div>
            )}

            <div>
               <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Transacción</label>
               <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                 <button
                   type="button"
                   onClick={() => setType(TransactionType.EXPENSE)}
                   className={`flex-1 py-1.5 text-sm rounded-md transition-all ${type === TransactionType.EXPENSE ? 'bg-slate-800 text-rose-400 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Gasto
                 </button>
                 <button
                   type="button"
                   onClick={() => setType(TransactionType.INCOME)}
                   className={`flex-1 py-1.5 text-sm rounded-md transition-all ${type === TransactionType.INCOME ? 'bg-slate-800 text-emerald-400 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Ingreso
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Monto</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">{currency}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-bold text-slate-200 placeholder-slate-600"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Comercio / Entidad</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
                placeholder="Ej. Walmart, Empresa S.A."
              />
            </div>

            {/* --- LINE ITEMS SECTION --- */}
            <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">Items del Recibo ({items.length})</label>
                {items.length > 0 && (
                  <button 
                    type="button" 
                    onClick={updateTotalFromItems} 
                    className="text-[10px] text-blue-400 font-medium hover:underline"
                  >
                    Actualizar Total
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="flex-1 text-xs px-2 py-1.5 bg-slate-800 border border-slate-700 rounded focus:border-blue-500 outline-none text-slate-200 placeholder-slate-600"
                      placeholder="Descripción"
                    />
                    <div className="relative w-20">
                      <span className="absolute left-1.5 top-1.5 text-slate-500 text-xs">{currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        className="w-full text-xs pl-5 pr-1 py-1.5 bg-slate-800 border border-slate-700 rounded focus:border-blue-500 outline-none text-right text-slate-200"
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteItem(index)}
                      className="text-slate-600 hover:text-red-400"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                type="button"
                onClick={handleAddItem}
                className="mt-2 w-full py-1.5 border border-dashed border-slate-700 rounded text-xs text-slate-500 hover:text-blue-400 hover:border-blue-400 flex items-center justify-center gap-1 transition-colors"
              >
                <PlusIcon className="w-3 h-3" /> Agregar Item
              </button>
            </div>
            {/* ------------------------- */}

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-slate-200"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Método</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-slate-200"
                  >
                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Notas</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none text-slate-200 placeholder-slate-600"
                placeholder="Detalles adicionales..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-2"
            >
              Confirmar y Guardar
            </button>
          </form>
        )}
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-slate-900 border border-slate-700 text-white px-5 py-3 rounded-xl shadow-2xl z-50 animate-bounce-in">
            <div className="bg-emerald-500 rounded-full p-1">
                <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="font-semibold text-sm">Transacción Guardada</p>
                <p className="text-xs text-slate-400">Se registró correctamente en tu historial.</p>
            </div>
            <button 
                onClick={() => setShowSuccessToast(false)}
                className="ml-2 text-slate-500 hover:text-white"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
      )}
    </div>
  );
};

export default TransactionForm;
