// Formatting helpers shared across the UI.

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-US').format(Number(value) || 0);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Turn an axios error into a user-friendly message.
export const getErrorMessage = (error, fallback = 'Something went wrong') => {
  const res = error?.response?.data;
  if (res?.errors?.length) return res.errors[0].message;
  return res?.message || error?.message || fallback;
};
