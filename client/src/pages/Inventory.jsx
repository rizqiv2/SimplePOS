import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { formatCurrency } from '../utils/formatters';

const Inventory = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', price: '', stock: '', minStock: '10', description: '' });

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ limit: 200, search });
      if (res.success) setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateProduct(editing.id, form);
      } else {
        await createProduct(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', sku: '', price: '', stock: '', minStock: '10', description: '' });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setForm({ name: product.name, sku: product.sku, price: product.price, stock: product.stock, minStock: product.minStock, description: product.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', sku: '', price: '', stock: '', minStock: '10', description: '' });
    setShowForm(true);
  };

  const isCashier = user?.role === 'cashier';
  const hidePrices = isCashier && localStorage.getItem('pos_cashier_hide_prices') === 'true';
  const hideStock = isCashier && localStorage.getItem('pos_cashier_hide_stock') === 'true';

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        {!isCashier && <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">+ Add Product</button>}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full max-w-md px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                {!hidePrices && <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>}
                {!hideStock && <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>}
                {!hideStock && <th className="text-right px-4 py-3 font-medium text-gray-600">Min Stock</th>}
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                {!isCashier && <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                  {!hidePrices && <td className="px-4 py-3 text-right">{formatCurrency(p.price)}</td>}
                  {!hideStock && <td className={`px-4 py-3 text-right font-medium ${p.stock <= p.minStock ? 'text-red-600' : ''}`}>{p.stock}</td>}
                  {!hideStock && <td className="px-4 py-3 text-right text-gray-500">{p.minStock}</td>}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                  </td>
                  {!isCashier && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" className="text-center py-8 text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="bg-white rounded-t-xl sm:rounded-lg p-6 w-full sm:max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input type="text" required value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input type="number" step="0.01" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input type="number" required value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
                <input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" rows="2" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;