import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const AdminLayout: React.FC = () => {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      title: 'Action Required',
      message: 'New listing requires approval', 
      time: '10 minutes ago', 
      read: false,
      type: 'warning'
    },
    { 
      id: 2, 
      title: 'Content Reported',
      message: 'User reported a listing', 
      time: '2 hours ago', 
      read: false,
      type: 'error'
    },
    { 
      id: 3, 
      title: 'System Update',
      message: 'System update completed successfully', 
      time: '1 day ago', 
      read: true,
      type: 'success'
    }
  ]);
  
  const notificationsPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Handle click outside notifications panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target as Node)) {
        setShowNotificationsPanel(false);
      }
    };
    
    if (showNotificationsPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsPanel]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Focus search on Ctrl+K or Command+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
  };
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown as any);
    return () => {
      document.removeEventListener('keydown', handleKeyDown as any);
    };
  }, []);
  
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };
  
  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
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
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500\" aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500\" aria-hidden="true" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500\" aria-hidden="true" />;
      case 'info':
      default:
        return <Bell className="w-5 h-5 text-blue-500\" aria-hidden="true" />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden" onKeyDown={handleKeyDown}>
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
              <Link to="/admin\" className="flex items-center">
                <img src="/Sakah logo new.png\" alt="Sakah\" className="h-8 mr-2" />
                <span className="text-xl font-bold text-yellow-400">Admin</span>
              </Link>
            ) : (
              <Link to="/admin" className="flex items-center justify-center w-full">
                <ShieldCheck className="h-8 w-8 text-yellow-400" aria-hidden="true" />
              </Link>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-full hover:bg-neutral-800 transition-colors"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-neutral-400\" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-5 w-5 text-neutral-400\" aria-hidden="true" />
              )}
            </button>
          </div>

          <nav className="mt-6 flex-1 overflow-y-auto" aria-label="Admin navigation">
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
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <item.icon className={`h-5 w-5 ${isSidebarOpen ? 'mr-3' : 'mx-auto'}`} aria-hidden="true" />
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
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-neutral-400" aria-hidden="true" />
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
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`flex items-center px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${!isSidebarOpen && 'justify-center'}`}
                aria-label="View main site"
              >
                <Home className="h-5 w-5" aria-hidden="true" />
                {isSidebarOpen && <span className="ml-3">View Site</span>}
              </Link>
              <button
                onClick={handleSignOut}
                className={`flex items-center px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors ${!isSidebarOpen && 'justify-center'}`}
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
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
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <h1 className="text-xl font-semibold text-neutral-800 hidden md:block">
              {navItems.find(item => isActive(item.path))?.label || 'Admin'}
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center bg-neutral-100 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ml-2 bg-transparent border-none focus:outline-none text-sm text-neutral-800 w-40"
                  aria-label="Search"
                />
                <span className="text-xs text-neutral-400 ml-2">Ctrl+K</span>
              </form>
              
              {/* Help */}
              <Link 
                to="/admin/help" 
                className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                aria-label="Help and documentation"
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
              </Link>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors relative"
                  onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                  aria-label={`Notifications (${notifications.filter(n => !n.read).length} unread)`}
                  aria-expanded={showNotificationsPanel}
                  aria-haspopup="true"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {/* Notifications Panel */}
                {showNotificationsPanel && (
                  <div 
                    ref={notificationsPanelRef}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="notifications-menu"
                  >
                    <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
                      <h3 className="font-medium text-neutral-800">Notifications</h3>
                      {notifications.filter(n => !n.read).length > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-yellow-600 hover:text-yellow-700"
                          aria-label="Mark all as read"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-neutral-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-neutral-300\" aria-hidden="true" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 ${!notification.read ? 'bg-yellow-50' : ''}`}
                            role="menuitem"
                          >
                            <div className="flex">
                              <div className="flex-shrink-0 mr-3">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-neutral-800">{notification.title}</p>
                                <p className="text-sm text-neutral-600">{notification.message}</p>
                                <p className="text-xs text-neutral-400 mt-1">{notification.time}</p>
                              </div>
                              <div className="ml-2 flex flex-col space-y-1">
                                {!notification.read && (
                                  <button 
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-neutral-400 hover:text-neutral-600 p-1"
                                    aria-label="Mark as read"
                                  >
                                    <CheckCircle className="w-4 h-4" aria-hidden="true" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="text-neutral-400 hover:text-neutral-600 p-1"
                                  aria-label="Delete notification"
                                >
                                  <X className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t border-neutral-200 bg-neutral-50 text-center">
                      <Link 
                        to="/admin/notifications" 
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        onClick={() => setShowNotificationsPanel(false)}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                to="/" 
                className="text-neutral-600 hover:text-neutral-900 flex items-center"
                aria-label="View main site"
              >
                <Home className="w-5 h-5 mr-1" aria-hidden="true" />
                <span className="hidden md:inline text-sm">View Site</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
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
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                </button>
              </div>
              
              <div className="p-4">
                <form onSubmit={handleSearch} className="flex items-center bg-neutral-800 rounded-lg px-3 py-2 mb-6">
                  <Search className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ml-2 bg-transparent border-none focus:outline-none text-sm text-white w-full"
                    aria-label="Search"
                  />
                </form>
              </div>
              
              <nav className="flex-1 overflow-y-auto" aria-label="Admin navigation">
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
                        aria-current={isActive(item.path) ? 'page' : undefined}
                      >
                        <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
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
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-5 w-5 text-neutral-400" aria-hidden="true" />
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
                    aria-label="View main site"
                  >
                    <Home className="h-5 w-5 mr-3" aria-hidden="true" />
                    <span>View Site</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-5 w-5 mr-3" aria-hidden="true" />
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