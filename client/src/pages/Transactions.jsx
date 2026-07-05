import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSales, voidTransaction } from '../services/salesService';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const Transactions = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 25 };
      if (filterStatus) params.status = filterStatus;
      if (filterPayment) params.paymentMethod = filterPayment;
      if (user?.role === 'cashier') params.cashierId = user.id;
      const res = await getSales(params);
      if (res.success) {
        setSales(res.data);
        setTotalPages(res.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, [page, filterStatus, filterPayment]);

  const handleVoid = async (id) => {
    if (!confirm('Void this transaction? Stock will be restored.')) return;
    try {
      const res = await voidTransaction(id);
      if (res.success) fetchSales();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to void transaction');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="void">Void</option>
          </select>
          <select value={filterPayment} onChange={e => { setFilterPayment(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm">
            <option value="">All Payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Transaction ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Items</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              {['admin', 'manager'].includes(user?.role) && (
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{s.transactionId}</td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(s.createdAt)}</td>
                <td className="px-4 py-3 text-gray-600">{s.orderType || '-'}</td>
                <td className="px-4 py-3 capitalize">{s.paymentMethod}</td>
                <td className="px-4 py-3 text-right">{s.items?.length || 0}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.total)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.status === 'completed' ? 'bg-green-100 text-green-700' :
                    s.status === 'void' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{s.status}</span>
                </td>
                {['admin', 'manager'].includes(user?.role) && (
                  <td className="px-4 py-3 text-right">
                    {s.status === 'completed' && (
                      <button onClick={() => handleVoid(s.id)} className="text-red-600 hover:text-red-800 text-xs">Void</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {sales.length === 0 && (
              <tr><td colSpan="8" className="text-center py-8 text-gray-400">No transactions found</td></tr>
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

export default Transactions;
