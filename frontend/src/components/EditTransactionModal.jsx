import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { transactionsAPI, categoriesAPI, accountsAPI } from '../utils/api';
import { parseCOPInput, formatDateInput, formatNumber } from '../utils/formatters';
import BottomSheet from './BottomSheet';

const EditTransactionModal = ({ isOpen, onClose, onSuccess, transaction }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [displayAmount, setDisplayAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Pre-fill form when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      setType(transaction.type || 'expense');
      setAmount(String(transaction.amount || ''));
      setDisplayAmount(formatNumber(transaction.amount || 0));
      setDescription(transaction.description || '');
      setCategoryId(transaction.category_id || '');
      setAccountId(transaction.account_id || '');
      setDate(formatDateInput(new Date(transaction.date)));
      setError('');
    }
  }, [transaction, isOpen]);

  const loadData = async () => {
    try {
      const [catRes, accRes] = await Promise.all([
        categoriesAPI.getAll(),
        accountsAPI.getAll()
      ]);
      setCategories(catRes.data || []);
      setAccounts(accRes.data || []);
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

  const handleSubmit = async (e) => {
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
      await transactionsAPI.update(transaction.id, {
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
      setError(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Editar transacción"
      maxHeight="85vh"
    >
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Type selector */}
          <div className="flex gap-2 p-0.5 bg-accent-emerald-50/50 rounded-lg">
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

          {/* Amount */}
          <div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-lg">$</span>
              <input
                type="text"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-8 pr-3 py-3 text-2xl font-bold border border-accent-emerald-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary tabular-nums tracking-tight transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="w-full px-3 py-2.5 text-sm border border-accent-emerald-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />

          {/* Category, Date, Account - Compact row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <p className="text-xs font-medium text-muted mb-1.5">Categoría</p>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-2 py-2.5 text-sm border border-accent-emerald-100/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                className="w-full px-2 py-2.5 text-sm border border-accent-emerald-100/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="col-span-1">
              <p className="text-xs font-medium text-muted mb-1.5">Cuenta</p>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-2 py-2.5 text-sm border border-accent-emerald-100/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-all btn-scale touch-feedback bg-primary disabled:opacity-50`}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </BottomSheet>
  );
};

export default EditTransactionModal;
