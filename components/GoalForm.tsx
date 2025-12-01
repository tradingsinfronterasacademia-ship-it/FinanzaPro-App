import React, { useState, useEffect } from 'react';
import { Goal } from '../types';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface GoalFormProps {
  initialData?: Goal; // If provided, we are editing
  onSubmit: (data: Omit<Goal, 'id'>) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');

  // Pre-fill form if editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTargetAmount(initialData.targetAmount.toString());
      setCurrentAmount(initialData.currentAmount.toString());
      setDeadline(initialData.deadline);
      setMonthlyContribution(initialData.monthlyContribution.toString());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;

    onSubmit({
      title,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      deadline,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 animate-fade-in mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-100">
          {initialData ? 'Editar Meta' : 'Nueva Meta'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de la Meta</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
            placeholder="Ej. Vacaciones, Auto Nuevo"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monto Objetivo</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-7 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-200 placeholder-slate-600"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Ahorro Actual</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full pl-7 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Límite</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Aporte Mensual Sugerido</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">$</span>
              <input
                type="number"
                step="0.01"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full pl-7 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-200 placeholder-slate-600"
                placeholder="0.00"
              />
            </div>
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
            {initialData ? 'Guardar Cambios' : 'Crear Meta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoalForm;