import api from './api';

export const createSale = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const getSales = async (params) => {
  const response = await api.get('/sales', { params });
  return response.data;
};

export const getSale = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

export const holdTransaction = async (id) => {
  const response = await api.put(`/sales/${id}/hold`);
  return response.data;
};

export const completeTransaction = async (id) => {
  const response = await api.put(`/sales/${id}/complete`);
  return response.data;
};

export const voidTransaction = async (id) => {
  const response = await api.put(`/sales/${id}/void`);
  return response.data;
};
