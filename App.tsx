import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import InvestmentForm from './components/InvestmentForm';
import GoalForm from './components/GoalForm'; 
import ChatAssistant from './components/ChatAssistant';
import { Transaction, Category, Goal, Investment, TransactionType, PaymentMethod, CurrencyCode } from './types';
import { TrashIcon, PencilSquareIcon, PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// --- MOCK DATA INITIALIZATION ---

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Alimentación', type: 'variable', budget: 500, color: '#ef4444' },
  { id: 'c2', name: 'Vivienda', type: 'fixed', budget: 1200, color: '#3b82f6' },
  { id: 'c3', name: 'Transporte', type: 'variable', budget: 200, color: '#f59e0b' },
  { id: 'c4', name: 'Entretenimiento', type: 'variable', budget: 150, color: '#8b5cf6' },
  { id: 'c5', name: 'Salud', type: 'variable', budget: 100, color: '#10b981' },
  { id: 'c_trading', name: 'Ingresos Trading', type: 'variable', budget: 0, color: '#14b8a6' }, // New
  { id: 'c_business', name: 'Gastos de Empresa', type: 'variable', budget: 2000, color: '#6366f1' }, // New
  { id: 'c6', name: 'Ingresos Laborales', type: 'fixed', budget: 0, color: '#10b981' }, 
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: TransactionType.EXPENSE, amount: 45.50, categoryId: 'c1', date: '2023-10-25', note: 'Compra semanal', merchant: 'Supermercado X', paymentMethod: PaymentMethod.DEBIT_CARD },
  { id: 't2', type: TransactionType.EXPENSE, amount: 1200, categoryId: 'c2', date: '2023-10-01', note: 'Alquiler Octubre', merchant: 'Landlord', paymentMethod: PaymentMethod.TRANSFER_PESOS },
  { id: 't3', type: TransactionType.INCOME, amount: 4500, categoryId: 'c6', date: '2023-10-01', note: 'Salario', merchant: 'Empresa Tech', paymentMethod: PaymentMethod.TRANSFER_PESOS },
  { id: 't4', type: TransactionType.EXPENSE, amount: 15.00, categoryId: 'c4', date: '2023-10-20', note: 'Cine', merchant: 'Cinemas', paymentMethod: PaymentMethod.CREDIT_CARD },
];

const INITIAL_GOALS: Goal[] = [
  { id: 'g1', title: 'Vacaciones Europa', targetAmount: 3000, currentAmount: 1200, deadline: '2024-06-01', monthlyContribution: 200 },
  { id: 'g2', title: 'Fondo Emergencia', targetAmount: 10000, currentAmount: 4500, deadline: '2024-12-01', monthlyContribution: 500 },
];

const INITIAL_INVESTMENTS: Investment[] = [
  { id: 'i1', assetName: 'S&P 500 ETF', amount: 5000, type: 'Stock', date: '2023-01-15', expectedReturnRate: 8 },
  { id: 'i2', assetName: 'Bitcoin', amount: 1200, type: 'Crypto', date: '2023-05-10', expectedReturnRate: 15 },
];

const simpleId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State
  const [currency, setCurrency] = useState<CurrencyCode>('ARS');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);

  // UI State for Investments
  const [isInvestmentFormOpen, setIsInvestmentFormOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>(undefined);
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(null);

  // UI State for Goals
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  // Persistence (mock)
  useEffect(() => {
    const savedT = localStorage.getItem('transactions');
    if (savedT) setTransactions(JSON.parse(savedT));
    
    const savedI = localStorage.getItem('investments');
    if (savedI) setInvestments(JSON.parse(savedI));

    const savedG = localStorage.getItem('goals');
    if (savedG) setGoals(JSON.parse(savedG));

    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) setCurrency(savedCurrency as CurrencyCode);
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // --- Transactions Logic ---
  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: simpleId() };
    setTransactions([newT, ...transactions]);
    setActiveTab('dashboard');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // --- Investments Logic ---
  const handleSaveInvestment = (data: Omit<Investment, 'id'>) => {
    if (editingInvestment) {
      setInvestments(prev => prev.map(inv => 
        inv.id === editingInvestment.id ? { ...data, id: inv.id } : inv
      ));
    } else {
      setInvestments(prev => [...prev, { ...data, id: simpleId() }]);
    }
    setIsInvestmentFormOpen(false);
    setEditingInvestment(undefined);
  };

  const handleEditInvestment = (inv: Investment) => {
    setEditingInvestment(inv);
    setIsInvestmentFormOpen(true);
  };

  const confirmDeleteInvestment = () => {
    if (investmentToDelete) {
      setInvestments(prev => prev.filter(i => i.id !== investmentToDelete));
      setInvestmentToDelete(null);
    }
  };

  // --- Goals Logic ---
  const handleSaveGoal = (data: Omit<Goal, 'id'>) => {
    if (editingGoal) {
      setGoals(prev => prev.map(g => 
        g.id === editingGoal.id ? { ...data, id: g.id } : g
      ));
    } else {
      setGoals(prev => [...prev, { ...data, id: simpleId() }]);
    }
    setIsGoalFormOpen(false);
    setEditingGoal(undefined);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalFormOpen(true);
  };

  const confirmDeleteGoal = () => {
    if (goalToDelete) {
      setGoals(prev => prev.filter(g => g.id !== goalToDelete));
      setGoalToDelete(null);
    }
  };

  // Helper to get currency symbol
  const getSymbol = (code: CurrencyCode) => {
    switch(code) {
      case 'USD': return 'US$';
      case 'EUR': return '€';
      case 'USDT': return '₮';
      default: return '$';
    }
  };

  const currencySymbol = getSymbol(currency);

  // --- Views ---

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} categories={categories} goals={goals} currency={currencySymbol} />;
      
      case 'add':
        return (
          <div className="max-w-xl mx-auto mt-6">
             <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Registrar Nuevo Movimiento</h2>
             <TransactionForm 
                onAddTransaction={addTransaction} 
                categories={categories}
                currency={currencySymbol} 
             />
          </div>
        );

      case 'chat':
        return (
          <div className="max-w-3xl mx-auto mt-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 text-center">Asistente Financiero</h2>
            <ChatAssistant contextData={{ transactions, categories, goals, investments }} />
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">Historial de Transacciones</h2>
            <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-900 text-slate-400 font-medium border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Comercio</th>
                      <th className="px-6 py-4">Categoría</th>
                      <th className="px-6 py-4 text-right">Monto</th>
                      <th className="px-6 py-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {transactions.map(t => {
                      const cat = categories.find(c => c.id === t.categoryId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 text-slate-400">{t.date}</td>
                          <td className="px-6 py-4 font-medium text-slate-200">{t.merchant || '-'}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">
                              {cat?.name || 'Otro'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {t.type === TransactionType.INCOME ? '+' : '-'}{currencySymbol} {t.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => deleteTransaction(t.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No hay transacciones registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'investments':
        return (
           <div className="space-y-6 max-w-4xl mx-auto relative">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-slate-100">Portafolio de Inversiones</h2>
               {!isInvestmentFormOpen && (
                 <button 
                   onClick={() => { setEditingInvestment(undefined); setIsInvestmentFormOpen(true); }}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/30"
                 >
                   <PlusIcon className="w-4 h-4" /> Nueva Inversión
                 </button>
               )}
             </div>

             {isInvestmentFormOpen ? (
               <InvestmentForm 
                  initialData={editingInvestment}
                  onSubmit={handleSaveInvestment}
                  onCancel={() => { setIsInvestmentFormOpen(false); setEditingInvestment(undefined); }}
               />
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {investments.map(inv => (
                   <div key={inv.id} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 group">
                      <div className="flex justify-between items-start">
                         <div>
                           <h4 className="font-bold text-lg text-slate-100">{inv.assetName}</h4>
                           <p className="text-sm text-slate-400 font-medium">{inv.type}</p>
                         </div>
                         <div className="flex flex-col items-end gap-2">
                           <div className="bg-emerald-900/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-800">
                             + {inv.expectedReturnRate}% est.
                           </div>
                           <div className="flex gap-1">
                              <button 
                                onClick={() => handleEditInvestment(inv)}
                                className="p-1 text-slate-500 hover:text-blue-400 hover:bg-slate-700 rounded"
                                title="Editar"
                              >
                                <PencilSquareIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setInvestmentToDelete(inv.id)}
                                className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                           </div>
                         </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-end">
                        <div>
                           <p className="text-xs text-slate-500 mb-1">Monto Invertido</p>
                           <p className="text-2xl font-bold text-slate-200">{currencySymbol} {inv.amount.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-slate-500">Desde: {inv.date}</p>
                      </div>
                   </div>
                 ))}
                 
                 {investments.length === 0 && (
                   <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700 rounded-2xl">
                     <p className="text-slate-500">No tienes inversiones registradas.</p>
                     <button 
                       onClick={() => setIsInvestmentFormOpen(true)}
                       className="text-blue-400 font-medium text-sm mt-2 hover:underline"
                     >
                       Registrar mi primera inversión
                     </button>
                   </div>
                 )}
               </div>
             )}

             {/* Delete Investment Modal */}
             {investmentToDelete && (
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 border border-slate-700">
                    <div className="flex flex-col items-center text-center mb-6">
                       <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                          <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                       </div>
                       <h3 className="text-lg font-bold text-slate-100">Eliminar Inversión</h3>
                       <p className="text-sm text-slate-400 mt-2">¿Estás seguro de que quieres eliminar esta inversión? Esta acción no se puede deshacer.</p>
                    </div>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => setInvestmentToDelete(null)}
                         className="flex-1 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors"
                       >
                         Cancelar
                       </button>
                       <button 
                         onClick={confirmDeleteInvestment}
                         className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                       >
                         Eliminar
                       </button>
                    </div>
                 </div>
               </div>
             )}
           </div>
        );

      case 'goals':
        return (
          <div className="space-y-6 max-w-4xl mx-auto relative">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-slate-100">Metas Financieras</h2>
               {!isGoalFormOpen && (
                 <button 
                   onClick={() => { setEditingGoal(undefined); setIsGoalFormOpen(true); }}
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/30"
                 >
                   <PlusIcon className="w-4 h-4" /> Nueva Meta
                 </button>
               )}
             </div>

             {isGoalFormOpen && (
               <GoalForm 
                 initialData={editingGoal}
                 onSubmit={handleSaveGoal}
                 onCancel={() => { setIsGoalFormOpen(false); setEditingGoal(undefined); }}
               />
             )}

             {!isGoalFormOpen && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(goal => (
                   <div key={goal.id} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 relative group">
                      <div className="flex justify-between mb-4 relative z-10">
                         <div>
                            <h3 className="font-bold text-slate-200">{goal.title}</h3>
                            <span className="text-sm font-medium text-slate-400">{new Date(goal.deadline).toLocaleDateString()}</span>
                         </div>
                         <div className="flex gap-1">
                              <button 
                                onClick={() => handleEditGoal(goal)}
                                className="p-1 text-slate-500 hover:text-blue-400 hover:bg-slate-700 rounded"
                                title="Editar"
                              >
                                <PencilSquareIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => setGoalToDelete(goal.id)}
                                className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                           </div>
                      </div>
                      <div className="flex items-end gap-2 mb-2 relative z-10">
                         <span className="text-3xl font-bold text-blue-400">{currencySymbol} {goal.currentAmount.toLocaleString()}</span>
                         <span className="text-sm text-slate-500 mb-1">/ {currencySymbol} {goal.targetAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3 relative z-10">
                         <div 
                           className="bg-gradient-to-r from-blue-500 to-teal-400 h-3 rounded-full shadow-lg shadow-blue-500/20" 
                           style={{ width: `${Math.min(100, (goal.currentAmount/goal.targetAmount)*100)}%` }}
                         ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 relative z-10">Aporte mensual sugerido: <span className="font-semibold text-slate-300">{currencySymbol} {goal.monthlyContribution}</span></p>
                   </div>
                ))}
                
                {goals.length === 0 && (
                   <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700 rounded-2xl">
                     <p className="text-slate-500">No tienes metas registradas.</p>
                     <button 
                       onClick={() => setIsGoalFormOpen(true)}
                       className="text-blue-400 font-medium text-sm mt-2 hover:underline"
                     >
                       Crear mi primera meta
                     </button>
                   </div>
                 )}
              </div>
             )}

            {/* Delete Goal Modal */}
            {goalToDelete && (
               <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                 <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100 border border-slate-700">
                    <div className="flex flex-col items-center text-center mb-6">
                       <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                          <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                       </div>
                       <h3 className="text-lg font-bold text-slate-100">Eliminar Meta</h3>
                       <p className="text-sm text-slate-400 mt-2">¿Estás seguro? Se perderá el progreso registrado de esta meta.</p>
                    </div>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => setGoalToDelete(null)}
                         className="flex-1 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-600 transition-colors"
                       >
                         Cancelar
                       </button>
                       <button 
                         onClick={confirmDeleteGoal}
                         className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                       >
                         Eliminar
                       </button>
                    </div>
                 </div>
               </div>
             )}
          </div>
        );

      default:
        return <div>Página no encontrada</div>;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      currency={currency}
      setCurrency={setCurrency}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;