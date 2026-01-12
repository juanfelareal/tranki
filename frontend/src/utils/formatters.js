// Format amount as COP currency
export const formatCOP = (amount) => {
  if (amount === null || amount === undefined) return '$0';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format amount without currency symbol
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined) return '0';

  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Format compact amount (1.5M, 45K, etc.)
export const formatCompact = (amount) => {
  if (amount === null || amount === undefined) return '$0';

  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatCOP(amount);
};

// Parse COP input (handles "45 mil", "1.5M", etc.)
export const parseCOPInput = (text) => {
  if (!text) return 0;

  // Remove currency symbols and spaces
  let cleaned = text.toString().toLowerCase().replace(/[$\s,\.]/g, '');

  // Handle "mil" (thousands)
  if (cleaned.includes('mil')) {
    const num = parseFloat(cleaned.replace('mil', '').trim()) || 0;
    return num * 1000;
  }

  // Handle "M" or "millón" (millions)
  if (cleaned.includes('m') || cleaned.includes('millón') || cleaned.includes('millon')) {
    const num = parseFloat(cleaned.replace(/m|millón|millon/g, '').trim()) || 0;
    return num * 1000000;
  }

  // Handle "k" (thousands)
  if (cleaned.includes('k')) {
    const num = parseFloat(cleaned.replace('k', '').trim()) || 0;
    return num * 1000;
  }

  return parseFloat(cleaned) || 0;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Format date for input
export const formatDateInput = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Format relative date (hoy, ayer, etc.)
export const formatRelativeDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time for comparison
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return 'Hoy';
  } else if (date.getTime() === yesterday.getTime()) {
    return 'Ayer';
  } else {
    return formatDate(dateString);
  }
};

// Get current month/year
export const getCurrentPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};

// Format month name
export const formatMonth = (month, year) => {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Format percentage
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(1)}%`;
};

// Format percentage change with sign
export const formatPercentageChange = (value) => {
  if (value === null || value === undefined) return '0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};
