
import React from 'react';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ChartPieIcon, 
  BanknotesIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { CurrencyCode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currency, setCurrency }) => {
  
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: HomeIcon },
    { id: 'transactions', label: 'Movimientos', icon: DocumentTextIcon },
    { id: 'add', label: 'Registrar', icon: PlusCircleIcon, highlight: true },
    { id: 'investments', label: 'Inversiones', icon: ChartPieIcon },
    { id: 'goals', label: 'Metas', icon: BanknotesIcon },
    { id: 'chat', label: 'Asistente', icon: ChatBubbleLeftRightIcon },
  ];

  const currencies: {code: CurrencyCode, label: string}[] = [
    { code: 'ARS', label: 'ARS ($)' },
    { code: 'USD', label: 'USD (US$)' },
    { code: 'EUR', label: 'EUR (€)' },
    { code: 'USDT', label: 'USDT (₮)' },
  ];

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-950 border-r border-slate-800 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
            FinanzaPro
          </h1>
          <p className="text-xs text-slate-500 mt-1">Gestión Inteligente</p>
        </div>
        
        {/* Currency Selector Desktop */}
        <div className="px-6 py-4">
           <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 block">Moneda Principal</label>
           <select 
             value={currency}
             onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
             className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
           >
             {currencies.map(c => (
               <option key={c.code} value={c.code}>{c.label}</option>
             ))}
           </select>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${item.highlight ? 'text-blue-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Juan Doe</p>
              <p className="text-xs text-slate-500">Plan Premium</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-900">
        <header className="md:hidden h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-100">FinanzaPro</h1>
          <div className="flex items-center gap-3">
             <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-600">
                JD
              </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 px-2 py-2 flex justify-around items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-lg transition-colors ${
                activeTab === item.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.highlight ? (
                <div className={`p-2 rounded-full mb-1 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-blue-900/30 text-blue-400'}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              ) : (
                <>
                  <item.icon className={`w-6 h-6 mb-1 ${activeTab === item.id ? 'stroke-2' : ''}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default Layout;
