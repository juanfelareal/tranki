import { useState, useEffect } from 'react';
import { PiggyBank, AlertCircle, CheckCircle, TrendingUp, Edit2, Save, X, Lightbulb } from 'lucide-react';
import { budgetsAPI, categoriesAPI } from '../utils/api';
import { formatCOP, formatNumber, getCurrentPeriod, formatMonth, parseCOPInput } from '../utils/formatters';
import { useSubscription } from '../hooks/useSubscription';
import UpgradePrompt from '../components/UpgradePrompt';

const Budgets = () => {
  const { isPro, loading: subLoading, upgrade } = useSubscription();

  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempAmount, setTempAmount] = useState('');
  const { month, year } = getCurrentPeriod();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [monthlyRes, budgetsRes, categoriesRes, comparisonRes] = await Promise.all([
        budgetsAPI.getMonthly({ month, year }),
        budgetsAPI.getAll({ month, year }),
        categoriesAPI.getAll(),
        budgetsAPI.getComparison({ month, year })
      ]);

      setMonthlyBudget(monthlyRes.data);
      setCategoryBudgets(budgetsRes.data || []);
      setCategories(categoriesRes.data?.filter(c => c.type === 'expense') || []);
      setComparison(comparisonRes.data || []);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMonthly = async () => {
    const amount = parseCOPInput(tempAmount);
    if (!amount || amount <= 0) return;

    try {
      await budgetsAPI.setMonthly({ month, year, total_budget: amount });
      setEditingMonthly(false);
      loadData();
    } catch (error) {
      console.error('Error saving monthly budget:', error);
    }
  };

  const handleSaveCategory = async (categoryId) => {
    const amount = parseCOPInput(tempAmount);
    if (!amount || amount <= 0) return;

    try {
      await budgetsAPI.create({
        category_id: categoryId,
        month,
        year,
        amount
      });
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Error saving category budget:', error);
    }
  };

  const startEditMonthly = () => {
    setTempAmount(monthlyBudget?.total_budget?.toString() || '');
    setEditingMonthly(true);
  };

  const startEditCategory = (categoryId, currentAmount) => {
    setTempAmount(currentAmount?.toString() || '');
    setEditingCategory(categoryId);
  };

  const getStatusInfo = (spent, budget) => {
    if (!budget) return { color: 'bg-gray-200', status: 'Sin presupuesto', icon: null };

    const percentage = (spent / budget) * 100;

    if (percentage >= 100) {
      return { color: 'bg-expense', status: 'Excedido', icon: AlertCircle, textColor: 'text-expense' };
    } else if (percentage >= 80) {
      return { color: 'bg-amber-500', status: 'Alerta', icon: AlertCircle, textColor: 'text-amber-500' };
    }
    return { color: 'bg-income', status: 'OK', icon: CheckCircle, textColor: 'text-income' };
  };

  const totalSpent = comparison.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalBudgeted = comparison.reduce((sum, c) => sum + (c.budget || 0), 0);
  const monthlyStatus = getStatusInfo(totalSpent, monthlyBudget?.total_budget);

  if (!subLoading && !isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Presupuesto</h1>
          <p className="text-muted mt-1">{formatMonth(month, year)}</p>
        </div>
        <div className="glass-card-premium border border-accent-emerald-100/50 rounded-2xl">
          <UpgradePrompt feature="Presupuestos" onUpgrade={upgrade} />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-48 shimmer rounded-xl" />
          <div className="h-5 w-32 shimmer rounded-lg" />
        </div>
        <div className="h-44 shimmer rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Presupuesto</h1>
        <p className="text-muted mt-1">{formatMonth(month, year)}</p>
      </div>

      {/* Monthly Budget Card */}
      <div className="relative overflow-hidden bg-gradient-balance text-white rounded-2xl p-7 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="relative">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                <PiggyBank size={26} />
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Presupuesto mensual</p>
                {editingMonthly ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xl">$</span>
                    <input
                      type="text"
                      value={tempAmount}
                      onChange={(e) => setTempAmount(e.target.value)}
                      placeholder="0"
                      className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-2xl font-bold w-44 focus:outline-none focus:ring-2 focus:ring-white/30 tabular-nums"
                      autoFocus
                    />
                    <button onClick={handleSaveMonthly} className="p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-all">
                      <Save size={18} />
                    </button>
                    <button onClick={() => setEditingMonthly(false)} className="p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-all">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-4xl font-bold tabular-nums tracking-tight">
                      {monthlyBudget?.total_budget ? formatCOP(monthlyBudget.total_budget) : 'Sin definir'}
                    </p>
                    <button onClick={startEditMonthly} className="p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-all">
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {monthlyStatus.icon && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm ${
                monthlyStatus.status === 'OK' ? 'bg-income/20 text-white' :
                monthlyStatus.status === 'Alerta' ? 'bg-amber-500/20 text-white' : 'bg-expense/20 text-white'
              }`}>
                <monthlyStatus.icon size={14} />
                {monthlyStatus.status}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {monthlyBudget?.total_budget && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Gastado: {formatCOP(totalSpent)}</span>
                <span className="opacity-80">Disponible: {formatCOP(Math.max(0, monthlyBudget.total_budget - totalSpent))}</span>
              </div>
              <div className="h-3 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={`h-full transition-all rounded-full ${
                    totalSpent / monthlyBudget.total_budget >= 1 ? 'bg-expense' :
                    totalSpent / monthlyBudget.total_budget >= 0.8 ? 'bg-amber-500' : 'bg-income'
                  }`}
                  style={{ width: `${Math.min(100, (totalSpent / monthlyBudget.total_budget) * 100)}%` }}
                />
              </div>
              <p className="text-sm opacity-60 text-center tabular-nums">
                {((totalSpent / monthlyBudget.total_budget) * 100).toFixed(0)}% utilizado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Budgets */}
      <div className="glass-card-premium border border-accent-emerald-100/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-accent-emerald-100/50 flex items-center justify-between bg-accent-emerald-50/30">
          <h3 className="font-semibold text-primary">Presupuesto por categoría</h3>
          <span className="text-sm text-muted">
            {comparison.filter(c => c.budget).length} de {categories.length} configuradas
          </span>
        </div>

        <div className="divide-y divide-border/50">
          {categories.map((category, index) => {
            const budgetData = comparison.find(c => c.category_id === category.id);
            const budget = budgetData?.budget || 0;
            const spent = budgetData?.spent || 0;
            const percentage = budget ? Math.min(100, (spent / budget) * 100) : 0;
            const status = getStatusInfo(spent, budget);
            const isEditing = editingCategory === category.id;

            return (
              <div
                key={category.id}
                className="px-6 py-4 animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <p className="font-medium text-primary">{category.name}</p>
                      <p className="text-sm text-muted">
                        {formatCOP(spent)} {budget ? `de ${formatCOP(budget)}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">$</span>
                        <input
                          type="text"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(e.target.value)}
                          placeholder="0"
                          className="w-28 px-3 py-1.5 text-sm border border-accent-emerald-100/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 tabular-nums"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveCategory(category.id)}
                          className="p-1.5 text-income hover:bg-income/10 rounded-lg transition-all"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1.5 text-muted hover:bg-accent-emerald-50 rounded-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {status.icon && (
                          <status.icon size={18} className={status.textColor} />
                        )}
                        <button
                          onClick={() => startEditCategory(category.id, budget)}
                          className="p-2 text-muted hover:text-primary hover:bg-accent-emerald-50 rounded-xl transition-all duration-75"
                        >
                          <Edit2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-accent-emerald-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all rounded-full ${status.color}`}
                    style={{ width: budget ? `${percentage}%` : '0%' }}
                  />
                </div>
                {budget > 0 && (
                  <div className="flex justify-between mt-1.5 text-xs text-muted">
                    <span className="tabular-nums">{percentage.toFixed(0)}%</span>
                    <span>
                      {spent >= budget
                        ? `Excedido por ${formatCOP(spent - budget)}`
                        : `Faltan ${formatCOP(budget - spent)}`
                      }
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card-premium border border-accent-yellow/30 rounded-2xl p-5 bg-accent-yellow/5">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-accent-yellow/20 rounded-xl">
            <Lightbulb size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-primary">Tip de ahorro</p>
            <p className="text-sm text-muted mt-1">
              La regla 50/30/20: Destina 50% a necesidades, 30% a deseos y 20% al ahorro.
              {monthlyBudget?.total_budget && (
                <span className="block mt-1.5 font-medium text-primary">
                  Tu meta de ahorro: {formatCOP(monthlyBudget.total_budget * 0.2)}/mes
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
