import api from './api';

export const getCustomers = async (params) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const getCustomer = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await api.post('/customers', customerData);
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await api.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

export const getCustomerPurchases = async (id) => {
  const response = await api.get(`/customers/${id}/purchases`);
  return response.data;
};

export const updateLoyaltyPoints = async (id, points) => {
  const response = await api.put(`/customers/${id}/points`, { points });
  return response.data;
};
