import { useState, useEffect } from 'react';
import { Check, TrendingUp, TrendingDown, AlertCircle, Sparkles, Plus, X, Brain, ChevronDown, Calendar, Wallet } from 'lucide-react';
import { formatCOP, formatNumber, parseCOPInput } from '../utils/formatters';
import { categoriesAPI } from '../utils/api';

const ParsedTransactionsList = ({
  transactions,
  categories,
  accounts,
  onSave,
  onCancel,
  sourceInfo,
  onCategoriesUpdate
}) => {
  const [editedTransactions, setEditedTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);

  // Expanded transaction for editing
  const [expandedTxId, setExpandedTxId] = useState(null);

  // New category creation state
  const [creatingForTxId, setCreatingForTxId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Common icons for quick selection
  const quickIcons = ['📦', '🚗', '🍽️', '💡', '🛍️', '🎮', '💰', '📱', '✈️', '🏠', '💊', '📚', '⛽', '🅿️', '🐾', '💳'];

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    const withIds = transactions.map((tx, index) => ({
      ...tx,
      _id: `parsed-${index}`,
      _categoryId: tx.suggested_category_id || findCategoryId(tx.suggested_category, tx.type, localCategories),
      _accountId: accounts[0]?.id || '',
      _displayAmount: formatNumber(tx.amount),
      _originalDescription: tx.description || tx.merchant || '',
      _categorySource: tx.category_source,
      _matchedRule: tx.matched_rule,
    }));
    setEditedTransactions(withIds);
    setSelectedIds(new Set(withIds.map(tx => tx._id)));
  }, [transactions, localCategories, accounts]);

  const findCategoryId = (suggestedName, type, cats) => {
    if (!suggestedName) return '';
    const lowerSuggested = suggestedName.toLowerCase();
    const categoryType = type === 'income' ? 'income' : 'expense';
    const match = cats.find(c =>
      c.type === categoryType &&
      c.name.toLowerCase().includes(lowerSuggested)
    );
    if (match) return match.id;
    const defaultCategory = cats.find(c =>
      c.type === categoryType &&
      (c.name.includes('Otros') || c.name.includes('General'))
    );
    return defaultCategory?.id || '';
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === editedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(editedTransactions.map(tx => tx._id)));
    }
  };

  const updateTransaction = (id, field, value) => {
    setEditedTransactions(prev =>
      prev.map(tx => {
        if (tx._id !== id) return tx;
        if (field === 'amount') {
          const cleaned = value.replace(/[^\d]/g, '');
          const numValue = cleaned ? parseInt(cleaned, 10) : 0;
          return {
            ...tx,
            amount: numValue,
            _displayAmount: cleaned ? formatNumber(numValue) : '',
          };
        }
        if (field === '_categoryId' && value && value !== 'new') {
          return { ...tx, [field]: value, _categoryChanged: true };
        }
        return { ...tx, [field]: value };
      })
    );
  };

  const handleAddNewCategory = (txId) => {
    const tx = editedTransactions.find(t => t._id === txId);
    setNewCategoryName(tx?.description || tx?.merchant || '');
    setNewCategoryIcon('📦');
    setCreatingForTxId(txId);
    setExpandedTxId(txId);
  };

  const cancelNewCategory = () => {
    setCreatingForTxId(null);
    setNewCategoryName('');
    setNewCategoryIcon('📦');
  };

  const createAndAssignCategory = async () => {
    if (!newCategoryName.trim()) return;
    const tx = editedTransactions.find(t => t._id === creatingForTxId);
    if (!tx) return;

    setCreatingCategory(true);
    try {
      const categoryType = tx.type === 'income' ? 'income' : 'expense';
      const response = await categoriesAPI.create({
        name: newCategoryName.trim(),
        type: categoryType,
        icon: newCategoryIcon,
        color: categoryType === 'income' ? '#22C55E' : '#EF4444'
      });

      const newCategory = response.data;
      setLocalCategories(prev => [...prev, newCategory]);
      onCategoriesUpdate?.([...localCategories, newCategory]);

      setEditedTransactions(prev =>
        prev.map(t => {
          if (t._id !== creatingForTxId) return t;
          return {
            ...t,
            _categoryId: newCategory.id,
            _categoryChanged: true,
            _newCategoryCreated: true
          };
        })
      );

      const keyword = (tx._originalDescription || tx.description || tx.merchant || '').toLowerCase().trim();
      if (keyword) {
        await categoriesAPI.createRule({
          keyword: keyword,
          category_id: newCategory.id
        });
      }

      cancelNewCategory();
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear la categoría');
    } finally {
      setCreatingCategory(false);
    }
  };

  const saveLearnedRules = async (transactionsToSave) => {
    const rulesPromises = transactionsToSave
      .filter(tx => tx._categoryChanged && tx._categoryId && tx._originalDescription)
      .map(tx => {
        const keyword = tx._originalDescription.toLowerCase().trim();
        return categoriesAPI.createRule({
          keyword: keyword,
          category_id: tx._categoryId
        }).catch(err => {
          console.warn('Failed to save rule for:', keyword, err);
          return null;
        });
      });
    await Promise.all(rulesPromises);
  };

  const handleSave = async () => {
    const selectedTxs = editedTransactions.filter(tx => selectedIds.has(tx._id));
    const selectedTransactions = selectedTxs.map(tx => ({
      type: tx.type,
      amount: tx.amount,
      description: tx.description || tx.merchant || '',
      category_id: tx._categoryId || null,
      account_id: tx._accountId || null,
      date: tx.date || new Date().toISOString().split('T')[0],
    }));

    if (selectedTransactions.length === 0) {
      alert('Selecciona al menos una transacción');
      return;
    }

    setSaving(true);
    try {
      await saveLearnedRules(selectedTxs);
      await onSave(selectedTransactions);
    } catch (error) {
      console.error('Error saving transactions:', error);
      alert('Error al guardar las transacciones');
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = (type) => localCategories.filter(c => c.type === type);

  const getCategoryById = (id) => localCategories.find(c => c.id === id);

  const getAccountById = (id) => accounts.find(a => a.id === id);

  if (editedTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-muted" />
        </div>
        <p className="text-lg font-medium text-primary">No se detectaron transacciones</p>
        <p className="text-sm text-muted mt-1">
          Intenta con otra imagen más clara o con mejor resolución
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      {sourceInfo && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-primary/5 rounded-xl border border-primary/10">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Sparkles size={14} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-primary">
            {sourceInfo.bank_detected && `${sourceInfo.bank_detected} • `}
            {editedTransactions.length} transacción{editedTransactions.length !== 1 ? 'es' : ''} detectada{editedTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Select All */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={selectAll}
          className="text-sm text-muted hover:text-primary flex items-center gap-2.5 transition-colors"
        >
          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-75 ${
            selectedIds.size === editedTransactions.length
              ? 'bg-primary border-primary'
              : 'border-border hover:border-primary'
          }`}>
            {selectedIds.size === editedTransactions.length && (
              <Check size={12} className="text-white" strokeWidth={3} />
            )}
          </div>
          <span>Seleccionar todas</span>
        </button>
        <span className="text-sm text-muted font-medium tabular-nums">
          {selectedIds.size} de {editedTransactions.length}
        </span>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5 max-h-[50vh] overflow-y-auto">
        {editedTransactions.map((tx, index) => {
          const isSelected = selectedIds.has(tx._id);
          const isExpanded = expandedTxId === tx._id;
          const selectedCategory = getCategoryById(tx._categoryId);
          const selectedAccount = getAccountById(tx._accountId);

          return (
            <div
              key={tx._id}
              className={`border rounded-2xl transition-all duration-75 overflow-hidden animate-fadeIn ${
                isSelected
                  ? 'border-primary/30 bg-white shadow-sm'
                  : 'border-border/50 bg-black/[0.01] opacity-60'
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Main Row - Always Visible */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelection(tx._id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-75 ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {isSelected && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Description & Amount Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          tx.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                        }`}>
                          {tx.type === 'income' ? (
                            <TrendingUp size={16} className="text-income" />
                          ) : (
                            <TrendingDown size={16} className="text-expense" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={tx.description || tx.merchant || ''}
                          onChange={(e) => updateTransaction(tx._id, 'description', e.target.value)}
                          placeholder="Descripción"
                          className="flex-1 text-sm font-semibold text-primary bg-transparent border-0 p-0 focus:outline-none focus:ring-0 min-w-0 truncate"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-muted">$</span>
                        <input
                          type="text"
                          value={tx._displayAmount}
                          onChange={(e) => updateTransaction(tx._id, 'amount', e.target.value)}
                          className={`w-24 text-right text-base font-bold bg-transparent border-0 p-0 focus:outline-none focus:ring-0 tabular-nums ${
                            tx.type === 'income' ? 'text-income' : 'text-expense'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Category & Details Row */}
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {/* Category Button */}
                      {creatingForTxId === tx._id ? (
                        <div className="flex items-center gap-1.5 bg-black/[0.03] rounded-xl p-1.5">
                          {quickIcons.slice(0, 8).map(icon => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => setNewCategoryIcon(icon)}
                              className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-all duration-75 ${
                                newCategoryIcon === icon
                                  ? 'bg-white shadow-sm ring-2 ring-primary'
                                  : 'hover:bg-white/50'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nombre"
                            className="w-24 text-xs px-2.5 py-2 bg-white border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={createAndAssignCategory}
                            disabled={creatingCategory || !newCategoryName.trim()}
                            className="w-7 h-7 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center transition-all"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelNewCategory}
                            className="w-7 h-7 text-muted hover:text-primary rounded-lg hover:bg-white flex items-center justify-center transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setExpandedTxId(isExpanded ? null : tx._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-75 ${
                            selectedCategory
                              ? 'bg-black/[0.03] text-secondary hover:bg-black/[0.06]'
                              : 'bg-accent-yellow/30 text-amber-700 border border-accent-yellow/50 hover:bg-accent-yellow/40'
                          }`}
                        >
                          {selectedCategory ? (
                            <>
                              <span>{selectedCategory.icon}</span>
                              <span>{selectedCategory.name}</span>
                              {tx._categorySource === 'learned' && (
                                <Brain size={10} className="text-primary ml-0.5" />
                              )}
                            </>
                          ) : (
                            <>
                              <Plus size={12} />
                              <span>Categoría</span>
                            </>
                          )}
                          <ChevronDown size={12} className={`transition-transform duration-75 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {/* Account Chip */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/[0.02] rounded-lg text-xs text-muted">
                        <Wallet size={12} />
                        <span>{selectedAccount?.name || 'Cuenta'}</span>
                      </div>

                      {/* Date Chip */}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/[0.02] rounded-lg text-xs text-muted">
                        <Calendar size={12} />
                        <span>{tx.date || 'Hoy'}</span>
                      </div>

                      {/* Learned indicator */}
                      {tx._matchedRule && tx._categorySource === 'learned' && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Brain size={10} />
                          Auto
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Section - Category Selection */}
              {isExpanded && creatingForTxId !== tx._id && (
                <div className="px-4 pb-4 pt-2 border-t border-border/50">
                  {/* Categories Grid */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted mb-2">Categoría</p>
                    <div className="flex flex-wrap gap-1.5">
                      {filteredCategories(tx.type).map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            updateTransaction(tx._id, '_categoryId', cat.id);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-75 ${
                            tx._categoryId === cat.id
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-black/[0.03] text-secondary hover:bg-black/[0.06]'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddNewCategory(tx._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-black/[0.03] text-secondary hover:bg-black/[0.06] border border-dashed border-border transition-all duration-75"
                      >
                        <Plus size={12} />
                        <span>Nueva</span>
                      </button>
                    </div>
                  </div>

                  {/* Account & Date Row */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted mb-1.5">Cuenta</p>
                      <select
                        value={tx._accountId}
                        onChange={(e) => updateTransaction(tx._id, '_accountId', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.icon} {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted mb-1.5">Fecha</p>
                      <input
                        type="date"
                        value={tx.date || ''}
                        onChange={(e) => updateTransaction(tx._id, 'date', e.target.value)}
                        className="w-full text-xs px-3 py-2.5 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Low confidence warning */}
              {tx.confidence && tx.confidence < 0.8 && (
                <div className="px-4 pb-3 flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-amber-500" />
                  <span className="text-xs text-amber-600">
                    Verifica los datos ({Math.round(tx.confidence * 100)}% confianza)
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border/50">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-border/50 rounded-xl font-medium text-secondary hover:bg-black/[0.02] transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || selectedIds.size === 0}
          className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 btn-scale"
        >
          {saving ? 'Guardando...' : (
            <>
              <Check size={18} />
              Guardar ({selectedIds.size})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ParsedTransactionsList;
