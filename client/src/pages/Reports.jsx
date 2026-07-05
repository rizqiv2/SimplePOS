import { useState, useEffect } from 'react';
import { getSalesSummary, getRevenue, getTopProducts } from '../services/reportService';
import { formatCurrency } from '../utils/formatters';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today');

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    if (range === 'today') { start.setHours(0, 0, 0, 0); }
    else if (range === 'week') { start.setDate(now.getDate() - 7); start.setHours(0, 0, 0, 0); }
    else if (range === 'month') { start.setMonth(now.getMonth() - 1); start.setHours(0, 0, 0, 0); }
    else if (range === 'year') { start.setFullYear(now.getFullYear() - 1); start.setHours(0, 0, 0, 0); }
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const dates = getDateRange();
        const [s, r, tp] = await Promise.all([
          getSalesSummary(dates).catch(() => null),
          getRevenue(dates).catch(() => ({ data: [] })),
          getTopProducts(dates).catch(() => ({ data: [] }))
        ]);
        if (s?.success) setSummary(s.data.summary);
        if (r?.success) setRevenue(r.data || []);
        if (tp?.success) setTopProducts(tp.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [range]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <select value={range} onChange={e => setRange(e.target.value)} className="border rounded px-3 py-2 text-sm">
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5"><h3 className="text-gray-500 text-sm">Revenue</h3><p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalRevenue)}</p></div>
          <div className="bg-white rounded-lg shadow p-5"><h3 className="text-gray-500 text-sm">Orders</h3><p className="text-2xl font-bold mt-1">{summary.totalSales}</p></div>
          <div className="bg-white rounded-lg shadow p-5"><h3 className="text-gray-500 text-sm">Avg Order Value</h3><p className="text-2xl font-bold mt-1">{formatCurrency(summary.averageOrderValue)}</p></div>
          <div className="bg-white rounded-lg shadow p-5"><h3 className="text-gray-500 text-sm">Discounts Given</h3><p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalDiscount)}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b"><h2 className="font-semibold text-gray-800">Revenue Over Time</h2></div>
          <div className="p-6">
            {revenue.length === 0 ? <p className="text-gray-400 text-center py-8">No revenue data</p> : (
              <div className="space-y-2">
                {revenue.slice(0, 10).map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-24">{r._id}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (r.revenue / Math.max(...revenue.map(x => x.revenue))) * 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-medium w-24 text-right">{formatCurrency(r.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b"><h2 className="font-semibold text-gray-800">Top Products</h2></div>
          <div className="p-6">
            {topProducts.length === 0 ? <p className="text-gray-400 text-center py-8">No sales data</p> : (
              <div className="space-y-3">
                {topProducts.slice(0, 10).map((p, i) => (
                  <div key={i} className="flex items-center justify-between pb-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                      <div><p className="text-sm font-medium">{p.productName}</p><p className="text-xs text-gray-500">Sold {p.totalQuantity}x</p></div>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(p.totalRevenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;