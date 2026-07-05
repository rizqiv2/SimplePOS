import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium';
  const mobileLinkClass = 'block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50';

  const navLinks = (
    <>
      <Link to="/" className={linkClass}>Dashboard</Link>
      <Link to="/pos" className={linkClass}>POS</Link>
      <Link to="/inventory" className={linkClass}>Inventory</Link>
      <Link to="/customers" className={linkClass}>Customers</Link>
      <Link to="/transactions" className={linkClass}>Transactions</Link>
      {user && ['admin', 'manager', 'cashier'].includes(user.role) && (
        <Link to="/reports" className={linkClass}>Reports</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/users" className={linkClass}>Users</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/audit-logs" className={linkClass}>Audit Logs</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/settings" className={linkClass}>Settings</Link>
      )}
    </>
  );

  const mobileLinks = (
    <>
      <Link to="/" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</Link>
      <Link to="/pos" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>POS</Link>
      <Link to="/inventory" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Inventory</Link>
      <Link to="/customers" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Customers</Link>
      <Link to="/transactions" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Transactions</Link>
      {user && ['admin', 'manager', 'cashier'].includes(user.role) && (
        <Link to="/reports" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Reports</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/users" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Users</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/audit-logs" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Audit Logs</Link>
      )}
      {user && user.role === 'admin' && (
        <Link to="/settings" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>Settings</Link>
      )}
      <div className="border-t border-gray-200 pt-3 mt-3">
        <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50">
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">POS System</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                {navLinks}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-700">
                {user?.username} ({user?.role})
              </span>
              <button onClick={handleLogout} className="hidden sm:block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Logout
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                <span className="text-2xl leading-none">{menuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden border-t border-gray-200 px-4 py-3 space-y-1">
            {mobileLinks}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
