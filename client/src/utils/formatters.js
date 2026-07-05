const getCurrency = () => localStorage.getItem('pos_currency') || 'USD';
const getLocale = () => localStorage.getItem('pos_locale') || 'en-US';

export const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat(getLocale(), {
      style: 'currency',
      currency: getCurrency()
    }).format(amount);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};
