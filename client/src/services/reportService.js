import api from './api';

export const getSalesSummary = async (params) => {
  const response = await api.get('/reports/sales-summary', { params });
  return response.data;
};

export const getRevenue = async (params) => {
  const response = await api.get('/reports/revenue', { params });
  return response.data;
};

export const getTopProducts = async (params) => {
  const response = await api.get('/reports/top-products', { params });
  return response.data;
};

export const getInventoryValue = async () => {
  const response = await api.get('/reports/inventory-value');
  return response.data;
};

export const getCashierPerformance = async (params) => {
  const response = await api.get('/reports/cashier-performance', { params });
  return response.data;
};
