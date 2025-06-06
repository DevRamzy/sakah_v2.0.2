import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const AdminLayout: React.FC = () => {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'grid_view' },
    { path: '/admin/listings', label: 'Listings', icon: 'format_list_bulleted' },
    { path: '/admin/users', label: 'Users', icon: 'people' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.aside 
        className="bg-black text-white"
        initial={{ width: isSidebarOpen ? 250 : 80 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/admin" className="text-xl font-bold text-yellow-400">
              Sakah Admin
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <span className="material-icons text-white">
              {isSidebarOpen ? 'chevron_left' : 'chevron_right'}
            </span>
          </button>
        </div>

        <nav className="mt-8">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 transition-colors ${
                    isActive(item.path)
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <span className="material-icons mr-3">{item.icon}</span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <div className="flex items-center mb-4">
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="font-medium">{profile?.full_name || 'Admin User'}</p>
                <p className="text-sm text-gray-300">{profile?.role || 'admin'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
          >
            <span className="material-icons mr-3">logout</span>
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              {navItems.find(item => isActive(item.path))?.label || 'Admin'}
            </h1>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-black flex items-center">
                <span className="material-icons mr-1">home</span>
                <span>View Site</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
