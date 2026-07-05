import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/auditLogService';
import { formatDate } from '../utils/formatters';

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  VOID: 'bg-yellow-100 text-yellow-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  REGISTER: 'bg-indigo-100 text-indigo-600',
  STOCK_ADJUST: 'bg-orange-100 text-orange-600',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({ page, limit: 50, action: filterAction || undefined, resource: filterResource || undefined });
      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, filterAction, filterResource]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        <div className="flex gap-2">
          <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm">
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="VOID">VOID</option>
            <option value="LOGIN">LOGIN</option>
            <option value="REGISTER">REGISTER</option>
            <option value="STOCK_ADJUST">STOCK ADJUST</option>
          </select>
          <select value={filterResource} onChange={e => { setFilterResource(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm">
            <option value="">All Resources</option>
            <option value="Product">Product</option>
            <option value="Customer">Customer</option>
            <option value="User">User</option>
            <option value="Sale">Sale</option>
            <option value="Setting">Setting</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Resource</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Details</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-3 font-medium">{log.user?.username || '-'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.resource}</td>
                <td className="px-4 py-3 text-right text-gray-500 text-xs">{log.resourceId || '-'}</td>
                <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">{log.details ? JSON.stringify(log.details) : '-'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{log.ip || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="7" className="text-center py-8 text-gray-400">No audit logs found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
