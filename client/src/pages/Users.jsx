import { useState, useEffect } from 'react';
const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'cashier' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!editing;
      const url = isEdit ? `/api/users/${editing._id}` : '/api/auth/register';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { username: form.username, email: form.email, role: form.role } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) { setShowForm(false); setEditing(null); fetchUsers(); }
      else { alert(data.message); }
    } catch (err) { alert('Error saving user'); }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setForm({ username: user.username, email: user.email, password: '', role: user.role });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) fetchUsers();
      else alert(data.message);
    } catch (err) { alert('Error deleting user'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <button onClick={() => { setEditing(null); setForm({ username: '', email: '', password: '', role: 'cashier' }); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">+ Add User</button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                    <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-400">No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Username *</label><input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" /></div>
              {!editing && <div><label className="block text-sm font-medium text-gray-700 mb-1">Password *</label><input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" /></div>}
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="cashier">Cashier</option><option value="manager">Manager</option><option value="admin">Admin</option>
                </select>
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

export default Users;