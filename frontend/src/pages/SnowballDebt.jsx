import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, X, Save, Check, ArrowRight,
  Landmark, CreditCard, Calendar, Percent, DollarSign, Target,
  Info, ChevronDown, ChevronUp, Snowflake
} from 'lucide-react';
import { snowballDebtsAPI } from '../utils/api';
import { formatCOP, formatNumber, formatCompact, parseCOPInput } from '../utils/formatters';
import { useSubscription } from '../hooks/useSubscription';
import UpgradePrompt from '../components/UpgradePrompt';

const SnowballDebt = () => {
  const { isPro, loading: subLoading, upgrade } = useSubscription();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState(() => {
    const saved = localStorage.getItem('tranki-snowball-info-shown');
    return saved === null ? true : saved === 'true';
  });
  const [editingDebt, setEditingDebt] = useState(null);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    creditor: '',
    original_amount: '',
    current_balance: '',
    interest_rate: '',
    minimum_payment: '',
    due_day: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });
  const [displayAmounts, setDisplayAmounts] = useState({
    original: '',
    current: '',
    minimum: '',
    payment: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const toggleInfoCard = () => {
    const newValue = !showInfoCard;
    setShowInfoCard(newValue);
    localStorage.setItem('tranki-snowball-info-shown', newValue.toString());
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [debtsRes, summaryRes] = await Promise.all([
        snowballDebtsAPI.getAll(),
        snowballDebtsAPI.getSummary()
      ]);
      setDebts(debtsRes.data || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value, formField, displayField) => {
    if (/[a-zA-Z]/.test(value)) {
      setFormData(prev => ({ ...prev, [formField]: value }));
      setDisplayAmounts(prev => ({ ...prev, [displayField]: value }));
      return;
    }
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned === '') {
      setFormData(prev => ({ ...prev, [formField]: '' }));
      setDisplayAmounts(prev => ({ ...prev, [displayField]: '' }));
      return;
    }
    const numValue = parseInt(cleaned, 10);
    setFormData(prev => ({ ...prev, [formField]: cleaned }));
    setDisplayAmounts(prev => ({ ...prev, [displayField]: formatNumber(numValue) }));
  };

  const handlePaymentAmountChange = (value) => {
    if (/[a-zA-Z]/.test(value)) {
      setPaymentData(prev => ({ ...prev, amount: value }));
      setDisplayAmounts(prev => ({ ...prev, payment: value }));
      return;
    }
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned === '') {
      setPaymentData(prev => ({ ...prev, amount: '' }));
      setDisplayAmounts(prev => ({ ...prev, payment: '' }));
      return;
    }
    const numValue = parseInt(cleaned, 10);
    setPaymentData(prev => ({ ...prev, amount: cleaned }));
    setDisplayAmounts(prev => ({ ...prev, payment: formatNumber(numValue) }));
  };

  const openDebtModal = (debt = null) => {
    if (debt) {
      setEditingDebt(debt);
      setFormData({
        name: debt.name,
        creditor: debt.creditor || '',
        original_amount: debt.original_amount.toString(),
        current_balance: debt.current_balance.toString(),
        interest_rate: debt.interest_rate?.toString() || '',
        minimum_payment: debt.minimum_payment?.toString() || '',
        due_day: debt.due_day?.toString() || ''
      });
      setDisplayAmounts({
        original: formatNumber(debt.original_amount),
        current: formatNumber(debt.current_balance),
        minimum: debt.minimum_payment ? formatNumber(debt.minimum_payment) : '',
        payment: ''
      });
    } else {
      setEditingDebt(null);
      setFormData({
        name: '',
        creditor: '',
        original_amount: '',
        current_balance: '',
        interest_rate: '',
        minimum_payment: '',
        due_day: ''
      });
      setDisplayAmounts({ original: '', current: '', minimum: '', payment: '' });
    }
    setError('');
    setShowDebtModal(true);
  };

  const openPaymentModal = (debt) => {
    setSelectedDebt(debt);
    setPaymentData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    });
    setDisplayAmounts(prev => ({ ...prev, payment: '' }));
    setError('');
    setShowPaymentModal(true);
  };

  const handleSubmitDebt = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Ingresa un nombre para la deuda');
      return;
    }
    const originalAmount = parseCOPInput(formData.original_amount);
    if (!originalAmount || originalAmount <= 0) {
      setError('Ingresa el monto original de la deuda');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name.trim(),
        creditor: formData.creditor.trim() || null,
        original_amount: originalAmount,
        current_balance: parseCOPInput(formData.current_balance) || originalAmount,
        interest_rate: parseFloat(formData.interest_rate) || 0,
        minimum_payment: parseCOPInput(formData.minimum_payment) || 0,
        due_day: parseInt(formData.due_day) || null
      };

      if (editingDebt) {
        await snowballDebtsAPI.update(editingDebt.id, data);
      } else {
        await snowballDebtsAPI.create(data);
      }
      setShowDebtModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const amount = parseCOPInput(paymentData.amount);
    if (!amount || amount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setSaving(true);
    try {
      await snowballDebtsAPI.recordPayment(selectedDebt.id, {
        amount,
        date: paymentData.date,
        note: paymentData.note.trim() || null
      });
      setShowPaymentModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta deuda y todo su historial de pagos?')) return;

    try {
      await snowballDebtsAPI.delete(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const getProgressPercentage = (debt) => {
    if (!debt.original_amount) return 0;
    const paid = debt.original_amount - debt.current_balance;
    return Math.round((paid / debt.original_amount) * 100);
  };

  const formatPayoffDate = (dateStr) => {
    if (!dateStr) return 'Sin datos';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  };

  // Find the first active debt (the one being paid in snowball method)
  const activeDebtId = debts.find(d => d.status === 'active')?.id;

  if (!subLoading && !isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Deudas</h1>
          <p className="text-muted mt-1">Método bola de nieve</p>
        </div>
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl">
          <UpgradePrompt feature="Gestión de deudas" onUpgrade={upgrade} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-48 shimmer rounded-xl" />
          <div className="h-5 w-64 shimmer rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-28 shimmer rounded-2xl" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Deudas</h1>
          <p className="text-muted mt-1">Método bola de nieve</p>
        </div>
        <button
          onClick={() => openDebtModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium btn-scale shadow-md"
        >
          <Plus size={18} />
          Nueva Deuda
        </button>
      </div>

      {/* Info Card - Collapsible */}
      <div className="glass-card-premium border border-blue-200/50 bg-blue-50/30 rounded-2xl overflow-hidden">
        <button
          onClick={toggleInfoCard}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Snowflake size={18} className="text-blue-600" />
            </div>
            <span className="font-medium text-primary">¿Cómo funciona el método Bola de Nieve?</span>
          </div>
          {showInfoCard ? <ChevronUp size={20} className="text-muted" /> : <ChevronDown size={20} className="text-muted" />}
        </button>

        {showInfoCard && (
          <div className="px-5 pb-5 pt-0 space-y-3 animate-fadeIn">
            <div className="h-px bg-blue-200/50" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-primary text-sm">Ordena tus deudas</p>
                  <p className="text-xs text-muted">De menor a mayor balance, sin importar la tasa de interés.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-primary text-sm">Paga el mínimo en todas</p>
                  <p className="text-xs text-muted">Excepto en la más pequeña: ahí paga todo lo extra que puedas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-primary text-sm">Efecto bola de nieve</p>
                  <p className="text-xs text-muted">Al pagar una deuda, suma ese pago a la siguiente. ¡Ganas momentum!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Debt */}
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Landmark size={18} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-muted">Deuda Total</span>
          </div>
          <p className="text-3xl font-bold text-primary tabular-nums tracking-tight">
            {formatCOP(summary?.total_current || 0)}
          </p>
          <p className="text-sm text-muted mt-1">
            {summary?.debts_active || 0} deuda{summary?.debts_active !== 1 ? 's' : ''} activa{summary?.debts_active !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Total Paid */}
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-income/10 rounded-xl">
              <Check size={18} className="text-income" />
            </div>
            <span className="text-sm font-medium text-muted">Pagado</span>
          </div>
          <p className="text-3xl font-bold text-income tabular-nums tracking-tight">
            {formatCOP(summary?.total_paid || 0)}
          </p>
          <p className="text-sm text-muted mt-1">
            {summary?.progress_percentage || 0}% del total
          </p>
        </div>

        {/* Estimated Payoff */}
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl p-6 card-hover">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-accent-yellow/20 rounded-xl">
              <Target size={18} className="text-amber-600" />
            </div>
            <span className="text-sm font-medium text-muted">Libre en</span>
          </div>
          <p className="text-2xl font-bold text-primary tracking-tight capitalize">
            {formatPayoffDate(summary?.estimated_payoff_date)}
          </p>
          <p className="text-sm text-muted mt-1">
            ~{summary?.estimated_months || 0} meses restantes
          </p>
        </div>
      </div>

      {/* Progress Bar Global */}
      {summary?.total_original > 0 && (
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-secondary">Progreso total</span>
            <span className="text-sm font-semibold text-primary">{summary?.progress_percentage || 0}%</span>
          </div>
          <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-income rounded-full transition-all duration-500"
              style={{ width: `${summary?.progress_percentage || 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted">
            <span>{formatCompact(summary?.total_paid || 0)} pagado</span>
            <span>{formatCompact(summary?.total_original || 0)} total</span>
          </div>
        </div>
      )}

      {/* Debts List */}
      {debts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider px-1">
            Orden de pago (menor → mayor)
          </h3>
          {debts.map((debt, index) => {
            const progress = getProgressPercentage(debt);
            const isPaidOff = debt.status === 'paid_off';
            const isActive = debt.id === activeDebtId;

            return (
              <div
                key={debt.id}
                className={`glass-card-premium border rounded-2xl p-5 animate-fadeIn ${
                  isPaidOff
                    ? 'border-income/30 bg-income/5'
                    : isActive
                    ? 'border-primary/50 bg-gray-50'
                    : 'border-gray-200/60'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPaidOff
                      ? 'bg-income text-white'
                      : isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 text-muted'
                  }`}>
                    {isPaidOff ? (
                      <Check size={16} />
                    ) : isActive ? (
                      <ArrowRight size={16} />
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-lg ${isPaidOff ? 'text-income' : 'text-primary'}`}>
                            {debt.name}
                          </p>
                          {isPaidOff && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-income/20 text-income rounded-full">
                              PAGADA
                            </span>
                          )}
                        </div>
                        {debt.creditor && (
                          <p className="text-sm text-muted">{debt.creditor}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold tabular-nums ${isPaidOff ? 'text-income' : 'text-primary'}`}>
                          {formatCOP(debt.current_balance)}
                        </p>
                        <p className="text-sm text-muted">
                          de {formatCompact(debt.original_amount)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPaidOff ? 'bg-income' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted mt-1">{progress}% pagado</p>
                    </div>

                    {/* Details */}
                    {!isPaidOff && (
                      <div className="flex flex-wrap gap-4 text-sm text-muted">
                        {debt.minimum_payment > 0 && (
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            Mín: {formatCompact(debt.minimum_payment)}
                          </span>
                        )}
                        {debt.due_day && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            Vence: día {debt.due_day}
                          </span>
                        )}
                        {debt.interest_rate > 0 && (
                          <span className="flex items-center gap-1">
                            <Percent size={14} />
                            {debt.interest_rate}% mes
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isPaidOff && (
                      <button
                        onClick={() => openPaymentModal(debt)}
                        className="px-4 py-2 bg-income text-white rounded-xl font-medium text-sm btn-scale flex items-center gap-1.5"
                      >
                        <Plus size={16} />
                        Pagar
                      </button>
                    )}
                    <button
                      onClick={() => openDebtModal(debt)}
                      className="p-2.5 text-muted hover:text-primary rounded-xl hover:bg-gray-50 transition-all duration-75"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(debt.id)}
                      className="p-2.5 text-muted hover:text-expense rounded-xl hover:bg-expense/10 transition-all duration-75"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl py-16 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-lg font-medium text-primary">No hay deudas registradas</p>
          <p className="text-sm text-muted mt-1">Agrega tus deudas para comenzar el método bola de nieve</p>
        </div>
      )}

      {/* Debt Modal */}
      {showDebtModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-fadeIn shadow-elevated max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200/60 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold tracking-tight">
                {editingDebt ? 'Editar deuda' : 'Nueva deuda'}
              </h2>
              <button
                onClick={() => setShowDebtModal(false)}
                className="p-2 text-muted hover:text-primary rounded-xl hover:bg-gray-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitDebt} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Nombre de la deuda *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Tarjeta Bancolombia"
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  autoFocus
                />
              </div>

              {/* Creditor */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Acreedor (opcional)</label>
                <input
                  type="text"
                  value={formData.creditor}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditor: e.target.value }))}
                  placeholder="Ej: Bancolombia, Davivienda, etc."
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Amounts Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Monto original *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="text"
                      value={displayAmounts.original}
                      onChange={(e) => handleAmountChange(e.target.value, 'original_amount', 'original')}
                      placeholder="0"
                      className="w-full pl-9 pr-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Balance actual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="text"
                      value={displayAmounts.current}
                      onChange={(e) => handleAmountChange(e.target.value, 'current_balance', 'current')}
                      placeholder="Igual al original"
                      className="w-full pl-9 pr-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Payment details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Pago mínimo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="text"
                      value={displayAmounts.minimum}
                      onChange={(e) => handleAmountChange(e.target.value, 'minimum_payment', 'minimum')}
                      placeholder="0"
                      className="w-full pl-9 pr-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Día vencimiento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_day}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_day: e.target.value }))}
                    placeholder="15"
                    className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Interés % mes</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, interest_rate: e.target.value }))}
                    placeholder="1.8"
                    className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums transition-all"
                  />
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
                  onClick={() => setShowDebtModal(false)}
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

      {/* Payment Modal */}
      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-fadeIn shadow-elevated">
            <div className="flex items-center justify-between p-5 border-b border-gray-200/60">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Registrar pago</h2>
                <p className="text-sm text-muted">{selectedDebt.name}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 text-muted hover:text-primary rounded-xl hover:bg-gray-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-4">
              {/* Current Balance Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-muted mb-1">Balance actual</p>
                <p className="text-2xl font-bold text-primary tabular-nums">
                  {formatCOP(selectedDebt.current_balance)}
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Monto del pago *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                  <input
                    type="text"
                    value={displayAmounts.payment}
                    onChange={(e) => handlePaymentAmountChange(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-4 text-xl font-semibold border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-income/20 focus:border-income tabular-nums transition-all"
                    autoFocus
                  />
                </div>
                {selectedDebt.minimum_payment > 0 && (
                  <p className="text-xs text-muted mt-1.5">
                    Pago mínimo sugerido: {formatCOP(selectedDebt.minimum_payment)}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Nota (opcional)</label>
                <input
                  type="text"
                  value={paymentData.note}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Ej: Pago quincenal"
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
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 border border-gray-200/60 rounded-xl font-medium text-secondary hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-income text-white rounded-xl font-medium btn-scale disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Registrando...' : (
                    <>
                      <Check size={18} />
                      Registrar Pago
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

export default SnowballDebt;
