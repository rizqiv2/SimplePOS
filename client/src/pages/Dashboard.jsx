import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSalesSummary } from '../services/reportService';
import { getProducts, getLowStockProducts } from '../services/productService';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        const endStr = new Date().toISOString();

        const summaryParams = { startDate: todayStr, endDate: endStr };
        if (user?.role === 'cashier') summaryParams.cashierId = user.id;

        const [summaryRes, lowStockRes, productsRes] = await Promise.all([
          getSalesSummary(summaryParams).catch(() => null),
          getLowStockProducts().catch(() => ({ data: { data: [] } })),
          getProducts({ limit: 5 }).catch(() => null)
        ]);

        if (summaryRes?.success) setSalesSummary(summaryRes.data.summary);
        if (lowStockRes?.success) setLowStockItems(lowStockRes.data);
        if (productsRes?.success) {
          setProductCount(productsRes.pagination?.total || 0);
          setRecentSales(productsRes.data.slice(0, 5) || []);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading dashboard...</div></div>;
  }

  const stats = [
    { label: "Today's Sales", value: salesSummary ? formatCurrency(salesSummary.totalRevenue) : '$0.00', color: 'bg-blue-500' },
    { label: 'Transactions', value: salesSummary ? formatNumber(salesSummary.totalSales) : '0', color: 'bg-green-500' },
    { label: 'Low Stock Items', value: formatNumber(lowStockItems.length), color: 'bg-red-500' },
    { label: 'Total Products', value: formatNumber(productCount), color: 'bg-purple-500' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <button onClick={() => navigate('/pos')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          New Sale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white text-xl">{['$', '#', '!', '📦'][i]}</span>
            </div>
            <h3 className="text-gray-500 text-sm">{stat.label}</h3>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-800">Low Stock Alerts</h2>
          </div>
          <div className="p-6">
            {lowStockItems.length === 0 ? (
              <p className="text-gray-500 text-sm">No low stock items</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600 font-medium">{item.stock} left</p>
                      <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <p className="text-sm text-blue-600 cursor-pointer" onClick={() => navigate('/inventory')}>
                    +{lowStockItems.length - 5} more items
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <button onClick={() => navigate('/pos')} className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">
              Open POS Register
            </button>
            <button onClick={() => navigate('/inventory')} className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium">
              Manage Inventory
            </button>
            <button onClick={() => navigate('/customers')} className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium">
              View Customers
            </button>
            {['admin', 'manager', 'cashier'].includes(user?.role) && (
              <button onClick={() => navigate('/reports')} className="w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-sm font-medium">
                View Reports
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;