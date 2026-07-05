export const getAuditLogs = async (params = {}) => {
  const token = localStorage.getItem('token');
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.action) query.set('action', params.action);
  if (params.resource) query.set('resource', params.resource);
  if (params.userId) query.set('userId', params.userId);
  const res = await fetch(`/api/audit-logs?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};
