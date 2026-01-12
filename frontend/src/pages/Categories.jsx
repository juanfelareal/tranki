import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, TrendingUp, TrendingDown } from 'lucide-react';
import { categoriesAPI } from '../utils/api';
import { formatCOP } from '../utils/formatters';

const ICONS = [
  '🍔', '🍕', '🍜', '☕', '🛒', '🚗', '🚌', '✈️', '🏠', '💡',
  '📱', '💻', '🎮', '🎬', '🎵', '📚', '💊', '🏥', '👕', '👟',
  '💰', '💳', '🏦', '📈', '💼', '🎁', '🎉', '💇', '🐕', '🌱',
  '🔧', '📦', '🛍️', '🎯', '⭐', '❤️'
];

const COLORS = [
  '#0A0A0A', '#1F2937', '#374151', '#4B5563', '#6B7280',
  '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    icon: '📦',
    color: '#374151'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [catRes, statsRes] = await Promise.all([
        categoriesAPI.getAll(),
        categoriesAPI.getStats()
      ]);
      setCategories(catRes.data || []);
      setStats(statsRes.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon || '📦',
        color: category.color || '#374151'
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        type: 'expense',
        icon: '📦',
        color: '#374151'
      });
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Ingresa un nombre');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      closeModal();
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoriesAPI.delete(id);
      loadCategories();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar');
    }
  };

  const getCategoryStats = (categoryId) => {
    return stats.find(s => s.category_id === categoryId) || { total: 0, count: 0 };
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-48 shimmer rounded-xl" />
          <div className="h-5 w-32 shimmer rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-20 shimmer rounded-2xl" />
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
          <h1 className="text-3xl font-bold text-primary tracking-tight">Categorías</h1>
          <p className="text-muted mt-1">{categories.length} categorías</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium btn-scale shadow-md"
        >
          <Plus size={18} />
          Nueva
        </button>
      </div>

      {/* Expense Categories */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3 bg-black/[0.01]">
          <div className="p-2 bg-expense/10 rounded-xl">
            <TrendingDown size={18} className="text-expense" />
          </div>
          <h3 className="font-semibold text-primary">Gastos</h3>
          <span className="text-sm text-muted">({expenseCategories.length})</span>
        </div>
        <div className="divide-y divide-border/50">
          {expenseCategories.map((cat, index) => {
            const catStats = getCategoryStats(cat.id);
            return (
              <div
                key={cat.id}
                className="px-6 py-4 flex items-center gap-5 hover:bg-black/[0.01] transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary">{cat.name}</p>
                  <p className="text-sm text-muted mt-0.5">
                    {catStats.count} transacciones • {formatCOP(catStats.total)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(cat)}
                    className="p-2.5 text-muted hover:text-primary rounded-xl hover:bg-black/5 transition-all duration-75"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2.5 text-muted hover:text-expense rounded-xl hover:bg-expense/10 transition-all duration-75"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Income Categories */}
      <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center gap-3 bg-black/[0.01]">
          <div className="p-2 bg-income/10 rounded-xl">
            <TrendingUp size={18} className="text-income" />
          </div>
          <h3 className="font-semibold text-primary">Ingresos</h3>
          <span className="text-sm text-muted">({incomeCategories.length})</span>
        </div>
        <div className="divide-y divide-border/50">
          {incomeCategories.map((cat, index) => {
            const catStats = getCategoryStats(cat.id);
            return (
              <div
                key={cat.id}
                className="px-6 py-4 flex items-center gap-5 hover:bg-black/[0.01] transition-all animate-fadeIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-primary">{cat.name}</p>
                  <p className="text-sm text-muted mt-0.5">
                    {catStats.count} transacciones • {formatCOP(catStats.total)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(cat)}
                    className="p-2.5 text-muted hover:text-primary rounded-xl hover:bg-black/5 transition-all duration-75"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2.5 text-muted hover:text-expense rounded-xl hover:bg-expense/10 transition-all duration-75"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-fadeIn shadow-elevated">
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="text-lg font-semibold tracking-tight">
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-muted hover:text-primary rounded-xl hover:bg-black/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Type */}
              <div className="flex gap-2 p-1 bg-black/[0.03] rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-75 ${
                    formData.type === 'expense'
                      ? 'bg-expense text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <TrendingDown size={18} />
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all duration-75 ${
                    formData.type === 'income'
                      ? 'bg-income text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <TrendingUp size={18} />
                  Ingreso
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Restaurantes"
                  className="w-full px-4 py-3 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  autoFocus
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Ícono</label>
                <div className="grid grid-cols-9 gap-1 max-h-36 overflow-y-auto p-2 bg-black/[0.02] rounded-xl">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-75 ${
                        formData.icon === icon
                          ? 'bg-primary text-white shadow-sm scale-110'
                          : 'hover:bg-black/5'
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
                <div className="grid grid-cols-9 gap-2">
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

              {/* Preview */}
              <div className="flex items-center gap-4 p-4 bg-black/[0.02] rounded-xl">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ backgroundColor: `${formData.color}15` }}
                >
                  {formData.icon}
                </div>
                <div>
                  <p className="font-semibold text-primary">{formData.name || 'Nombre de categoría'}</p>
                  <p className="text-sm text-muted">
                    {formData.type === 'income' ? 'Ingreso' : 'Gasto'}
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
                  className="flex-1 py-3 border border-border/50 rounded-xl font-medium text-secondary hover:bg-black/[0.02] transition-all"
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
    </div>
  );
};

export default Categories;
