import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, PenLine, ScanLine, Sparkles } from 'lucide-react';
import { transactionsAPI, categoriesAPI, accountsAPI, aiAPI } from '../utils/api';
import { parseCOPInput, formatDateInput, formatNumber } from '../utils/formatters';
import ImageUploader from './ImageUploader';
import ParsedTransactionsList from './ParsedTransactionsList';
import BottomSheet from './BottomSheet';

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  // Tab state
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'scan'

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

  // Scan state
  const [selectedImages, setSelectedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [totalImagesToProcess, setTotalImagesToProcess] = useState(0);
  const [parsedTransactions, setParsedTransactions] = useState(null);
  const [sourceInfo, setSourceInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setActiveTab('manual');
    setType('expense');
    setAmount('');
    setDisplayAmount('');
    setDescription('');
    setCategoryId('');
    setAccountId('');
    setDate(formatDateInput(new Date()));
    setError('');
    setSelectedImages([]);
    setIsProcessing(false);
    setProcessingCount(0);
    setTotalImagesToProcess(0);
    setParsedTransactions(null);
    setSourceInfo(null);
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

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Image scanning handlers - now supports multiple images
  const handleImagesSelect = async (files) => {
    setSelectedImages(prev => [...prev, ...files]);
    setError('');

    // Start processing all images
    setIsProcessing(true);
    setTotalImagesToProcess(files.length);
    setProcessingCount(0);

    const allTransactions = [];
    const banksDetected = new Set();
    let sourceType = 'unknown';

    try {
      // Process images sequentially to avoid overwhelming the API
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Convert file to base64
          const base64Data = await fileToBase64(file);
          const response = await aiAPI.parseImage({
            image: base64Data,
            mimeType: file.type
          });

          console.log('API Response:', response.data);

          if (response.data.success) {
            const transactions = response.data.data.transactions || [];
            allTransactions.push(...transactions);

            if (response.data.data.bank_detected) {
              banksDetected.add(response.data.data.bank_detected);
            }
            if (response.data.data.source_type !== 'unknown') {
              sourceType = response.data.data.source_type;
            }
          } else {
            console.error('API returned error:', response.data.error);
            setError(response.data.error || 'Error al procesar la imagen');
          }
        } catch (err) {
          console.error(`Error processing image ${i + 1}:`, err);
          setError(err.response?.data?.error || err.message || 'Error al procesar la imagen');
        }

        setProcessingCount(i + 1);
      }

      if (allTransactions.length > 0) {
        setParsedTransactions(allTransactions);
        setSourceInfo({
          source_type: sourceType,
          bank_detected: banksDetected.size > 0 ? Array.from(banksDetected).join(', ') : null
        });
      } else {
        setError('No se detectaron transacciones en las imágenes');
      }
    } catch (err) {
      console.error('Error parsing images:', err);
      setError('Error al procesar las imágenes');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImagesClear = () => {
    setSelectedImages([]);
    setParsedTransactions(null);
    setSourceInfo(null);
    setError('');
    setProcessingCount(0);
    setTotalImagesToProcess(0);
  };

  const handleSaveParsedTransactions = async (transactions) => {
    // Save each transaction
    for (const tx of transactions) {
      await transactionsAPI.create(tx);
    }
    onSuccess?.();
    onClose();
  };

  const handleCancelScan = () => {
    handleImagesClear();
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva transacción"
      maxHeight="85vh"
    >
      {/* Tab Selector - Compact */}
      <div className="flex gap-2 px-4 pt-2">
        <button
          type="button"
          onClick={() => { setActiveTab('manual'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-75 touch-feedback ${
            activeTab === 'manual'
              ? 'bg-primary text-white'
              : 'bg-black/[0.03] text-muted'
          }`}
        >
          <PenLine size={14} />
          <span>Manual</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('scan'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-75 touch-feedback ${
            activeTab === 'scan'
              ? 'bg-primary text-white'
              : 'bg-black/[0.03] text-muted'
          }`}
        >
          <ScanLine size={14} />
          <span>Escanear</span>
          <Sparkles size={10} className={activeTab === 'scan' ? 'text-white/70' : 'text-primary'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
          {activeTab === 'manual' ? (
            /* Manual Form - Compact */
            <form onSubmit={handleManualSubmit} className="space-y-3">
              {/* Type selector - Inline compact */}
              <div className="flex gap-2 p-0.5 bg-black/[0.03] rounded-lg">
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
                    className="w-full pl-8 pr-3 py-3 text-2xl font-bold border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary tabular-nums tracking-tight transition-all"
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
                className="w-full px-3 py-2.5 text-sm border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />

              {/* Category, Date, Account - Compact row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <p className="text-xs font-medium text-muted mb-1.5">Categoría</p>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-2 py-2.5 text-sm border border-border/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                    className="w-full px-2 py-2.5 text-sm border border-border/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="col-span-1">
                  <p className="text-xs font-medium text-muted mb-1.5">Cuenta</p>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-2 py-2.5 text-sm border border-border/50 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
          ) : (
            /* Scan Tab */
            <div className="space-y-4">
              {!parsedTransactions ? (
                <>
                  <ImageUploader
                    onImagesSelect={handleImagesSelect}
                    onClear={handleImagesClear}
                    isProcessing={isProcessing}
                    processingCount={processingCount}
                    totalCount={totalImagesToProcess}
                  />
                  {error && (
                    <p className="text-sm text-expense bg-expense/10 px-4 py-3 rounded-xl">
                      {error}
                    </p>
                  )}
                </>
              ) : (
                <ParsedTransactionsList
                  transactions={parsedTransactions}
                  categories={categories}
                  accounts={accounts}
                  sourceInfo={sourceInfo}
                  onSave={handleSaveParsedTransactions}
                  onCancel={handleCancelScan}
                  onCategoriesUpdate={setCategories}
                />
              )}
            </div>
          )}
        </div>
    </BottomSheet>
  );
};

export default AddTransactionModal;
