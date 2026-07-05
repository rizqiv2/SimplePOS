import { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customerService';
import { formatCurrency, formatDate } from '../utils/formatters';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers({ limit: 200, search });
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateCustomer(editing.id, form); }
      else { await createCustomer(form); }
      setShowForm(false); setEditing(null);
      setForm({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) { alert(err.response?.data?.message || 'Error saving customer'); }
  };

  const handleEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try { await deleteCustomer(id); fetchCustomers(); }
    catch (err) { alert('Error deleting customer'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', email: '', phone: '', address: '' }); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">+ Add Customer</button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone..." className="w-full max-w-md px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Purchases</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Points</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(c.totalPurchases)}</td>
                  <td className="px-4 py-3 text-right font-medium text-purple-600">{c.loyaltyPoints}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-gray-400">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="bg-white rounded-t-xl sm:rounded-lg p-6 w-full sm:max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" rows="2" /></div>
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

export default Customers;