import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  ListChecks, 
  Users, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Search,
  Menu,
  X,
  Home,
  ShieldCheck
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New listing requires approval', time: '10 minutes ago', read: false },
    { id: 2, message: 'User reported a listing', time: '2 hours ago', read: false },
    { id: 3, message: 'System update completed', time: '1 day ago', read: true }
  ]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { path: '/admin/listings', label: 'Listings', icon: ListChecks },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside 
        className="bg-black text-white hidden md:block"
        initial={{ width: isSidebarOpen ? 250 : 80 }}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-neutral-800">
            {isSidebarOpen ? (
              <Link to="/admin" className="flex items-center">
                <img src="/Sakah logo new.png" alt="Sakah" className="h-8 mr-2" />
                <span className="text-xl font-bold text-yellow-400">Admin</span>
              </Link>
            ) : (
              <Link to="/admin" className="flex items-center justify-center w-full">
                <ShieldCheck className="h-8 w-8 text-yellow-400" />
              </Link>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-full hover:bg-neutral-800 transition-colors"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-neutral-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              )}
            </button>
          </div>

          <nav className="mt-6 flex-1 overflow-y-auto">
            <ul className="space-y-2 px-3">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-yellow-500 text-black font-medium'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {isSidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-neutral-800">
            <div className="flex items-center mb-4">
              {isSidebarOpen ? (
                <>
                  <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white">{profile?.full_name || 'Admin User'}</p>
                    <p className="text-xs text-neutral-400">{profile?.role || 'admin'}</p>
                  </div>
                </>
              ) : (
                <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center mx-auto overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${!isSidebarOpen && 'justify-center'}`}
              >
                <Home className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3">View Site</span>}
              </Link>
              <button
                onClick={handleSignOut}
                className={`flex items-center px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${!isSidebarOpen && 'justify-center'}`}
              >
                <LogOut className="h-5 w-5" />
                {isSidebarOpen && <span className="ml-3">Sign Out</span>}
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10 border-b border-neutral-200">
          <div className="px-4 py-3 flex justify-between items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <h1 className="text-xl font-semibold text-neutral-800 hidden md:block">
              {navItems.find(item => isActive(item.path))?.label || 'Admin'}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center bg-neutral-100 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-neutral-500" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="ml-2 bg-transparent border-none focus:outline-none text-sm text-neutral-800 w-40"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors relative">
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              
              <Link to="/" className="text-neutral-600 hover:text-neutral-900 flex items-center">
                <Home className="w-5 h-5 mr-1" />
                <span className="hidden md:inline text-sm">View Site</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-black text-white flex flex-col">
              <div className="p-4 flex items-center justify-between border-b border-neutral-800">
                <Link to="/admin" className="flex items-center">
                  <img src="/Sakah logo new.png" alt="Sakah" className="h-8 mr-2" />
                  <span className="text-xl font-bold text-yellow-400">Admin</span>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              </div>
              
              <nav className="mt-6 flex-1 overflow-y-auto">
                <ul className="space-y-2 px-3">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-yellow-500 text-black font-medium'
                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="p-4 border-t border-neutral-800">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-white">{profile?.full_name || 'Admin User'}</p>
                    <p className="text-xs text-neutral-400">{profile?.role || 'admin'}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/"
                    className="flex items-center px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="h-5 w-5 mr-3" />
                    <span>View Site</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-neutral-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;