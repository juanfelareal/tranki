import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, X, Save, ArrowRightLeft,
  Wallet, CreditCard, PiggyBank, Building2, Banknote, CircleDollarSign, Crown
} from 'lucide-react';
import { accountsAPI } from '../utils/api';
import { formatCOP, formatNumber, parseCOPInput } from '../utils/formatters';
import { useSubscription } from '../hooks/useSubscription';

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Efectivo', icon: Banknote },
  { value: 'bank', label: 'Cuenta Bancaria', icon: Building2 },
  { value: 'savings', label: 'Ahorros', icon: PiggyBank },
  { value: 'credit_card', label: 'Tarjeta de Crédito', icon: CreditCard },
  { value: 'investment', label: 'Inversiones', icon: CircleDollarSign },
  { value: 'other', label: 'Otro', icon: Wallet },
];

const ICONS = ['💵', '💳', '🏦', '💰', '🐷', '📈', '💎', '🪙', '💸', '🏧', '💴', '💶'];

const COLORS = [
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
  '#F43F5E', '#EF4444', '#F97316', '#F59E0B', '#71717A'
];

const Accounts = () => {
  const { isPro, upgrade } = useSubscription();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    icon: '🏦',
    color: '#3B82F6',
    initial_balance: ''
  });
  const [transferData, setTransferData] = useState({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    description: ''
  });
  const [displayAmount, setDisplayAmount] = useState('');
  const [transferDisplayAmount, setTransferDisplayAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await accountsAPI.getAll();
      setAccounts(res.data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        type: account.type,
        icon: account.icon || '💰',
        color: account.color || '#6366F1',
        initial_balance: ''
      });
      setDisplayAmount('');
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        type: 'bank',
        icon: '🏦',
        color: '#3B82F6',
        initial_balance: ''
      });
      setDisplayAmount('');
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setError('');
  };

  const handleAmountChange = (value, setAmount, setDisplay) => {
    if (/[a-zA-Z]/.test(value)) {
      setAmount(value);
      setDisplay(value);
      return;
    }
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned === '') {
      setAmount('');
      setDisplay('');
      return;
    }
    const numValue = parseInt(cleaned, 10);
    setAmount(cleaned);
    setDisplay(formatNumber(numValue));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Ingresa un nombre');
      return;
    }

    setSaving(true);
    try {
      if (editingAccount) {
        await accountsAPI.update(editingAccount.id, formData);
      } else {
        await accountsAPI.create({
          ...formData,
          initial_balance: parseCOPInput(formData.initial_balance) || 0
        });
      }
      closeModal();
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta cuenta?')) return;

    try {
      await accountsAPI.delete(id);
      loadAccounts();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const openTransferModal = () => {
    setTransferData({
      from_account_id: accounts[0]?.id || '',
      to_account_id: accounts[1]?.id || '',
      amount: '',
      description: ''
    });
    setTransferDisplayAmount('');
    setError('');
    setShowTransferModal(true);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const amount = parseCOPInput(transferData.amount);
    if (!amount || amount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    if (transferData.from_account_id === transferData.to_account_id) {
      setError('Selecciona cuentas diferentes');
      return;
    }

    setSaving(true);
    try {
      await accountsAPI.transfer({
        ...transferData,
        amount
      });
      setShowTransferModal(false);
      loadAccounts();
    } catch (err) {
      setError(err.response?.data?.error || 'Error en la transferencia');
    } finally {
      setSaving(false);
    }
  };

  const getAccountTypeInfo = (type) => {
    return ACCOUNT_TYPES.find(t => t.value === type) || ACCOUNT_TYPES[5];
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.calculated_balance || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-48 shimmer rounded-xl" />
          <div className="h-5 w-32 shimmer rounded-lg" />
        </div>
        <div className="h-36 shimmer rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Cuentas</h1>
          <p className="text-muted mt-1">{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          {accounts.length >= 2 && (
            <button
              onClick={openTransferModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-full font-medium text-secondary hover:text-primary hover:border-primary transition-all duration-75"
            >
              <ArrowRightLeft size={18} />
              <span className="hidden sm:inline">Transferir</span>
            </button>
          )}
          {!isPro && accounts.length >= 1 ? (
            <button
              onClick={upgrade}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium btn-scale shadow-md"
            >
              <Crown size={18} />
              Desbloquear más
            </button>
          ) : (
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium btn-scale shadow-md"
            >
              <Plus size={18} />
              Nueva
            </button>
          )}
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="relative overflow-hidden bg-gradient-balance text-white rounded-2xl p-7 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <Wallet size={22} className="opacity-80" />
            <span className="text-sm font-medium opacity-80">Balance total</span>
          </div>
          <p className="text-5xl font-bold tabular-nums tracking-tight">
            {formatCOP(totalBalance)}
          </p>
          <p className="text-sm opacity-60 mt-3">
            Suma de todas tus cuentas
          </p>
        </div>
      </div>

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <div className="space-y-3">
          {accounts.map((account, index) => {
            const typeInfo = getAccountTypeInfo(account.type);
            const TypeIcon = typeInfo.icon;
            const balance = account.calculated_balance || 0;

            return (
              <div
                key={account.id}
                className="glass-card-premium border border-gray-200/60 rounded-2xl p-5 card-hover animate-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                    style={{ backgroundColor: `${account.color || '#6366F1'}15` }}
                  >
                    {account.icon || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-lg text-primary truncate">{account.name}</p>
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-muted rounded-full">
                        {typeInfo.label}
                      </span>
                    </div>
                    <p className={`text-3xl font-bold tabular-nums tracking-tight ${
                      balance >= 0 ? 'text-primary' : 'text-expense'
                    }`}>
                      {formatCOP(balance)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(account)}
                      className="p-2.5 text-muted hover:text-primary rounded-xl hover:bg-gray-50 transition-all duration-75"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2.5 text-muted hover:text-expense rounded-xl hover:bg-expense/10 transition-all duration-75"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl py-16 text-center">
          <div className="text-5xl mb-4">🏦</div>
          <p className="text-lg font-medium text-primary">No hay cuentas</p>
          <p className="text-sm text-muted mt-1">Crea tu primera cuenta para empezar</p>
        </div>
      )}

      {/* Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-fadeIn shadow-elevated">
            <div className="flex items-center justify-between p-5 border-b border-gray-200/60">
              <h2 className="text-lg font-semibold tracking-tight">
                {editingAccount ? 'Editar cuenta' : 'Nueva cuenta'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-muted hover:text-primary rounded-xl hover:bg-gray-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Cuenta de ahorros Bancolombia"
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  autoFocus
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Tipo de cuenta</label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCOUNT_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-75 ${
                          formData.type === type.value
                            ? 'border-primary bg-gray-50 shadow-sm'
                            : 'border-transparent bg-gray-50 hover:bg-black/[0.04]'
                        }`}
                      >
                        <Icon size={20} className={formData.type === type.value ? 'text-primary' : 'text-muted'} />
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Ícono</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-11 h-11 flex items-center justify-center text-xl rounded-xl transition-all duration-75 ${
                        formData.icon === icon
                          ? 'bg-primary text-white shadow-sm scale-105'
                          : 'bg-gray-50 hover:bg-black/[0.05]'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg transition-all duration-75 ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Initial Balance (only for new accounts) */}
              {!editingAccount && (
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">
                    Saldo inicial (opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="text"
                      value={displayAmount}
                      onChange={(e) => handleAmountChange(
                        e.target.value,
                        (v) => setFormData(prev => ({ ...prev, initial_balance: v })),
                        setDisplayAmount
                      )}
                      placeholder="0"
                      className="w-full pl-9 pr-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary tabular-nums transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: `${formData.color}15` }}
                >
                  {formData.icon}
                </div>
                <div>
                  <p className="font-semibold text-primary">{formData.name || 'Nombre de cuenta'}</p>
                  <p className="text-sm text-muted">
                    {getAccountTypeInfo(formData.type).label}
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-expense bg-expense/10 px-4 py-2.5 rounded-xl">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-gray-200/60 rounded-xl font-medium text-secondary hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-medium btn-scale disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Guardando...' : (
                    <>
                      <Save size={18} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-fadeIn shadow-elevated">
            <div className="flex items-center justify-between p-5 border-b border-gray-200/60">
              <h2 className="text-lg font-semibold tracking-tight">Transferir entre cuentas</h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 text-muted hover:text-primary rounded-xl hover:bg-gray-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTransfer} className="p-5 space-y-5">
              {/* From Account */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Desde</label>
                <select
                  value={transferData.from_account_id}
                  onChange={(e) => setTransferData(prev => ({ ...prev, from_account_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.name} ({formatCOP(acc.calculated_balance || 0)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="p-3 bg-gray-50 rounded-full">
                  <ArrowRightLeft size={20} className="text-muted rotate-90" />
                </div>
              </div>

              {/* To Account */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Hacia</label>
                <select
                  value={transferData.to_account_id}
                  onChange={(e) => setTransferData(prev => ({ ...prev, to_account_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.icon} {acc.name} ({formatCOP(acc.calculated_balance || 0)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input
                    type="text"
                    value={transferDisplayAmount}
                    onChange={(e) => handleAmountChange(
                      e.target.value,
                      (v) => setTransferData(prev => ({ ...prev, amount: v })),
                      setTransferDisplayAmount
                    )}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-3 text-xl font-semibold border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary tabular-nums transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={transferData.description}
                  onChange={(e) => setTransferData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Ahorro del mes"
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-expense bg-expense/10 px-4 py-2.5 rounded-xl">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-3 border border-gray-200/60 rounded-xl font-medium text-secondary hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-medium btn-scale disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Transfiriendo...' : (
                    <>
                      <ArrowRightLeft size={18} />
                      Transferir
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
