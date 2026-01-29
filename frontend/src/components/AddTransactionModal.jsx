import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { transactionsAPI, categoriesAPI, accountsAPI } from '../utils/api';
import { parseCOPInput, formatDateInput, formatNumber } from '../utils/formatters';
import BottomSheet from './BottomSheet';

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  // Manual form state
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(formatDateInput(new Date()));

  // Shared state
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDisplayAmount('');
    setDescription('');
    setCategoryId('');
    setAccountId('');
    setDate(formatDateInput(new Date()));
    setError('');
  };

  const loadData = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        categoriesAPI.getAll(),
        accountsAPI.getAll()
      ]);
      setCategories(catRes.data || []);
      const accountsList = accRes.data || [];
      setAccounts(accountsList);
      if (accountsList.length > 0) {
        setAccountId(accountsList[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleAmountChange = (e) => {
    const input = e.target.value;

    if (/[a-zA-Z]/.test(input)) {
      setAmount(input);
      setDisplayAmount(input);
      return;
    }

    const cleaned = input.replace(/[^\d]/g, '');

    if (cleaned === '') {
      setAmount('');
      setDisplayAmount('');
      return;
    }

    const numValue = parseInt(cleaned, 10);
    setAmount(cleaned);
    setDisplayAmount(formatNumber(numValue));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseCOPInput(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    if (!date) {
      setError('Selecciona una fecha');
      return;
    }

    setLoading(true);
    try {
      await transactionsAPI.create({
        type,
        amount: parsedAmount,
        description: description || null,
        category_id: categoryId || null,
        account_id: accountId || null,
        date
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva transacción"
      maxHeight="85vh"
    >
      {/* Content */}
      <div className="p-4">
        {/* Manual Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          {/* Type selector - Inline compact */}
          <div className="flex gap-2 p-0.5 bg-gray-50 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all duration-75 touch-feedback ${
                type === 'expense'
                  ? 'bg-expense text-white'
                  : 'text-muted'
              }`}
            >
              <TrendingDown size={14} />
              <span>Gasto</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all duration-75 touch-feedback ${
                type === 'income'
                  ? 'bg-income text-white'
                  : 'text-muted'
              }`}
            >
              <TrendingUp size={14} />
              <span>Ingreso</span>
            </button>
          </div>

          {/* Amount - Compact */}
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg">$</span>
              <input
                type="text"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-8 pr-3 py-3 text-2xl font-bold border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary tabular-nums tracking-tight transition-all"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
              <Sparkles size={10} />
              Escribe "45 mil" o "1.5M"
            </p>
          </div>

          {/* Description - Compact */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full px-3 py-2.5 text-sm border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />

          {/* Category, Date, Account - Compact row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <p className="text-xs font-medium text-muted mb-1.5">Categoría</p>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-2 py-2.5 text-sm border border-gray-200/60 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">Elegir...</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <p className="text-xs font-medium text-muted mb-1.5">Fecha</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-2.5 text-sm border border-gray-200/60 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="col-span-1">
              <p className="text-xs font-medium text-muted mb-1.5">Cuenta</p>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-2 py-2.5 text-sm border border-gray-200/60 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.icon} {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-expense bg-expense/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit - Compact */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all btn-scale touch-feedback ${
              type === 'expense'
                ? 'bg-expense'
                : 'bg-income'
            } disabled:opacity-50`}
          >
            {loading ? 'Guardando...' : `Guardar ${type === 'expense' ? 'gasto' : 'ingreso'}`}
          </button>
        </form>
      </div>
    </BottomSheet>
  );
};

export default AddTransactionModal;
