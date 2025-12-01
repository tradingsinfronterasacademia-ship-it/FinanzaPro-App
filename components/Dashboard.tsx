import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Transaction, Category, Goal, TransactionType } from '../types';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  currency: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, categories, goals, currency }) => {

  // Calculate Totals
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amount = t.amount;
      if (t.type === TransactionType.INCOME) {
        acc.totalIncome += amount;
        acc.balance += amount;
      } else {
        acc.totalExpense += amount;
        acc.balance -= amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0 });
  }, [transactions]);

  // Data for Pie Chart (Expenses by Category)
  const expenseData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        const catName = categories.find(c => c.id === t.categoryId)?.name || 'Otros';
        map.set(catName, (map.get(catName) || 0) + t.amount);
      });
    
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions, categories]);

  // Data for Bar Chart (Last 6 months simplified)
  const barData = useMemo(() => {
    // Mocking last few periods for visualization based on existing data
    return [
      { name: 'Ene', Ingresos: 4000, Gastos: 2400 },
      { name: 'Feb', Ingresos: 3000, Gastos: 1398 },
      { name: 'Mar', Ingresos: 2000, Gastos: 9800 },
      { name: 'Abr', Ingresos: 2780, Gastos: 3908 },
      { name: 'May', Ingresos: 1890, Gastos: 4800 },
      { name: 'Jun', Ingresos: 2390, Gastos: 3800 },
    ];
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold text-slate-100">Panel Principal</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Saldo Actual</p>
            <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-slate-100' : 'text-red-400'}`}>
              {currency} {balance.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Ingresos (Mes)</p>
            <p className="text-3xl font-bold mt-1 text-emerald-400">
              + {currency} {totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-400">
            <ArrowTrendingUpIcon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Gastos (Mes)</p>
            <p className="text-3xl font-bold mt-1 text-rose-400">
              - {currency} {totalExpense.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-rose-900/30 rounded-full flex items-center justify-center text-rose-400">
            <ArrowTrendingDownIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 lg:col-span-1 min-h-[350px]">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Gastos por Categoría</h3>
          <div className="h-64 w-full">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `${currency} ${value}`}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Sin datos de gastos
              </div>
            )}
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 lg:col-span-2 min-h-[350px]">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Flujo de Caja (Últimos 6 Meses)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#f8fafc' }}
                  cursor={{fill: '#334155', opacity: 0.4}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Goals Widget */}
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Metas Activas</h3>
          <button className="text-sm text-blue-400 font-medium hover:underline">Ver todas</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div key={goal.id} className="border border-slate-700 rounded-xl p-4 bg-slate-900/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-200">{goal.title}</span>
                  <span className="text-xs font-medium text-slate-400">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 mb-2">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{currency} {goal.currentAmount.toLocaleString()}</span>
                  <span>Meta: {currency} {goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <p className="text-slate-500 text-sm">No hay metas activas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;