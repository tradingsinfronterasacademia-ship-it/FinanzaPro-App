import React, { useState, useEffect } from 'react';
import { Investment } from '../types';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface InvestmentFormProps {
  initialData?: Investment; // If provided, we are editing
  onSubmit: (data: Omit<Investment, 'id'>) => void;
  onCancel: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [assetName, setAssetName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Investment['type']>('Stock');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnRate, setExpectedReturnRate] = useState('');

  // Pre-fill form if editing
  useEffect(() => {
    if (initialData) {
      setAssetName(initialData.assetName);
      setAmount(initialData.amount.toString());
      setType(initialData.type);
      setDate(initialData.date);
      setExpectedReturnRate(initialData.expectedReturnRate.toString());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !amount) return;

    onSubmit({
      assetName,
      amount: parseFloat(amount),
      type,
      date,
      expectedReturnRate: parseFloat(expectedReturnRate) || 0,
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-100">
          {initialData ? 'Editar Inversión' : 'Nueva Inversión'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Nombre del Activo</label>
          <input
            type="text"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
            placeholder="Ej. Apple Inc, Bitcoin, Fondo Mutuo"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monto Invertido</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-200 placeholder-slate-600"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Investment['type'])}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
            >
              <option value="Stock">Acciones (Stock)</option>
              <option value="Crypto">Criptomonedas</option>
              <option value="RealEstate">Bienes Raíces</option>
              <option value="Cash">Efectivo / Depósito</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Inversión</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Retorno Esperado (%)</label>
            <input
              type="number"
              step="0.1"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
              placeholder="Ej. 8.5"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-600 text-slate-400 rounded-xl hover:bg-slate-700 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 transition-colors"
          >
            <CheckIcon className="w-5 h-5" />
            {initialData ? 'Guardar Cambios' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvestmentForm;