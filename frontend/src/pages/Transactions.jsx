import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, X, ChevronDown, Pencil } from 'lucide-react';
import { transactionsAPI, categoriesAPI } from '../utils/api';
import { formatCOP, formatRelativeDate } from '../utils/formatters';
import EditTransactionModal from '../components/EditTransactionModal';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);

  // Edit modal state
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadData = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        transactionsAPI.getAll(filters),
        categoriesAPI.getAll()
      ]);
      setTransactions(txRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await transactionsAPI.getAll({
        ...filters,
        search: search || undefined
      });
      setTransactions(res.data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTransactions();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      category_id: '',
      start_date: '',
      end_date: ''
    });
    setSearch('');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length || deleting) return;
    if (!confirm(`¿Eliminar ${selectedIds.length} transacción(es)?`)) return;

    setDeleting(true);
    try {
      await transactionsAPI.bulkDelete(selectedIds);
      setSelectedIds([]);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setDeleting(false);
    }
  };

  const deleteOne = async (id) => {
    if (!confirm('¿Eliminar esta transacción?')) return;

    try {
      await transactionsAPI.delete(id);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTransaction(null);
  };

  const handleEditSuccess = () => {
    loadTransactions();
  };

  const hasActiveFilters = filters.type || filters.category_id || filters.start_date || filters.end_date;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-56 shimmer rounded-xl" />
          <div className="h-5 w-32 shimmer rounded-lg" />
        </div>
        <div className="h-12 shimmer rounded-xl" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 shimmer rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary tracking-tight">Transacciones</h1>
        <p className="text-muted mt-1">
          {transactions.length} registro{transactions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por descripción..."
              className="w-full pl-11 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-75 ${
              hasActiveFilters
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-secondary hover:text-primary hover:border-primary'
            }`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>
        </form>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-card-premium border border-gray-200/60 rounded-2xl p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-primary">Filtros</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-muted hover:text-primary flex items-center gap-1 transition-colors"
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Todos</option>
                  <option value="income">Ingresos</option>
                  <option value="expense">Gastos</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Categoría</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Desde</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Hasta</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-primary/20 rounded-xl px-5 py-4 animate-fadeIn">
          <span className="text-sm font-medium text-primary">
            {selectedIds.length} seleccionada{selectedIds.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 text-sm text-expense bg-expense/10 hover:bg-expense/20 rounded-lg transition-colors font-medium"
          >
            <Trash2 size={16} />
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      )}

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200/60 text-xs font-medium text-muted uppercase tracking-wide">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.length === transactions.length}
                onChange={selectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
            <div className="col-span-4">Descripción</div>
            <div className="col-span-2">Categoría</div>
            <div className="col-span-2">Fecha</div>
            <div className="col-span-2 text-right">Monto</div>
            <div className="col-span-1" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/50">
            {transactions.map((tx, index) => (
              <div
                key={tx.id}
                className={`grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-all animate-fadeIn cursor-pointer ${
                  selectedIds.includes(tx.id) ? 'bg-primary/[0.03]' : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => openEditModal(tx)}
              >
                {/* Checkbox */}
                <div className="col-span-1 hidden sm:flex items-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(tx.id)}
                    onChange={() => toggleSelect(tx.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>

                {/* Description */}
                <div className="col-span-8 sm:col-span-4 flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: `${tx.category_color || '#E5E7EB'}15` }}
                  >
                    {tx.category_icon || (tx.type === 'income' ? '💰' : '📦')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-primary truncate">
                      {tx.description || tx.category_name || (tx.type === 'income' ? 'Ingreso' : 'Gasto')}
                    </p>
                    <p className="text-xs text-muted sm:hidden">
                      {tx.category_name} • {formatRelativeDate(tx.date)}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="hidden sm:block col-span-2">
                  <span className="text-sm text-secondary">{tx.category_name || 'Sin categoría'}</span>
                </div>

                {/* Date */}
                <div className="hidden sm:block col-span-2">
                  <span className="text-sm text-muted">{formatRelativeDate(tx.date)}</span>
                </div>

                {/* Amount */}
                <div className="col-span-3 sm:col-span-2 text-right">
                  <span className={`font-semibold tabular-nums text-lg ${
                    tx.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCOP(tx.amount)}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(tx)}
                    className="p-2 text-muted hover:text-primary rounded-lg hover:bg-primary/10 transition-all duration-75"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteOne(tx.id)}
                    className="p-2 text-muted hover:text-expense rounded-lg hover:bg-expense/10 transition-all duration-75"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card-premium border border-gray-200/60 rounded-2xl py-16 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-lg font-medium text-primary">No hay transacciones</p>
          <p className="text-sm text-muted mt-1">
            {hasActiveFilters ? 'Intenta con otros filtros' : 'Agrega tu primera transacción'}
          </p>
        </div>
      )}

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default Transactions;
