import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../ui/Button'; // Assuming Button component exists
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Search } from 'lucide-react';

// Inline SVG Icons
const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

const Header: React.FC = () => {
  // Use real authentication and user profile data
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  
  const isAuthenticated = !!user;
  
  // Function to handle logout
  const logout = async () => {
    try {
      await signOut();
      // Navigate to home page or login page after logout
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleQuickSearch = () => {
    navigate('/listings');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive ? 'text-yellow-400 bg-neutral-700' : 'text-neutral-300 hover:text-yellow-400 hover:bg-neutral-700'}`;
  
  const desktopNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-yellow-400' : 'text-neutral-300 hover:text-yellow-400'}`;

  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Top Row: Logo, Business Links, Sign In */}
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex-shrink-0">
            <img className="h-8 md:h-10 w-auto" src="/Sakah logo new.png" alt="Sakah" />
          </Link>

          {/* Quick Search Button */}
          <div className="hidden md:flex items-center mx-auto">
            <button 
              onClick={handleQuickSearch}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-neutral-300 hover:text-yellow-400 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search listings...</span>
            </button>
          </div>

          {/* Right side actions - Desktop */}
          <div className="hidden md:flex items-center space-x-3 relative">
            {isAuthenticated && user ? (
              <div ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-neutral-300 hover:text-yellow-400 transition-colors p-1 rounded-lg"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username || 'User'} className="h-8 w-8 rounded-full" />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" />
                  )}
                  <span className="hidden lg:inline text-sm font-medium">
                    {profile?.username || profile?.email || 'My Account'}
                  </span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-neutral-800 rounded-lg shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <NavLink to="/dashboard" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-yellow-400 bg-neutral-700' : 'text-neutral-200 hover:bg-neutral-700 hover:text-yellow-400'}`} onClick={() => setIsProfileMenuOpen(false)}>Dashboard</NavLink>
                    <NavLink to="/dashboard/profile" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-yellow-400 bg-neutral-700' : 'text-neutral-200 hover:bg-neutral-700 hover:text-yellow-400'}`} onClick={() => setIsProfileMenuOpen(false)}>My Profile</NavLink>
                    <NavLink to="/dashboard/settings" className={({isActive}) => `block px-4 py-2 text-sm ${isActive ? 'text-yellow-400 bg-neutral-700' : 'text-neutral-200 hover:bg-neutral-700 hover:text-yellow-400'}`} onClick={() => setIsProfileMenuOpen(false)}>Settings</NavLink>
                    <div className="border-t border-neutral-700 my-1"></div>
                    <button 
                      onClick={async () => { 
                        await logout(); 
                        setIsProfileMenuOpen(false); 
                      }}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700 hover:text-red-400 transition-colors"
                    >
                      <LogoutIcon className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="primary" size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 whitespace-nowrap rounded-lg">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-300 hover:text-yellow-400 p-2 rounded-md"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Links & SakahSoko Button - Desktop */}
        <div className="hidden md:flex items-center justify-center space-x-2 lg:space-x-4 h-12 border-t border-neutral-700">
          <NavLink to="/services" className={desktopNavLinkClasses}>Services</NavLink>
          <NavLink to="/property" className={desktopNavLinkClasses}>Property</NavLink>
          <NavLink to="/stores" className={desktopNavLinkClasses}>Stores</NavLink>
          <NavLink to="/vehicles" className={desktopNavLinkClasses}>Vehicles</NavLink>
          <NavLink to="/for-businesses" className={desktopNavLinkClasses}>Sakah For Businesses</NavLink>
          <Button variant="primary" size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full">
            <Link to="/sakahsoko" className="text-black">SakahSoko</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-neutral-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile Quick Search */}
            <div className="mb-4">
              <button
                onClick={handleQuickSearch}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 hover:text-yellow-400 transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>Search listings...</span>
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/services" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Services</NavLink>
              <NavLink to="/property" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Property</NavLink>
              <NavLink to="/stores" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Stores</NavLink>
              <NavLink to="/vehicles" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Vehicles</NavLink>
              <NavLink to="/for-businesses" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Sakah For Businesses</NavLink>
            </div>
            <div className="pt-2">
              <Button variant="primary" size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500 w-full justify-center rounded-full">
                <Link to="/sakahsoko" className="text-black w-full block">SakahSoko</Link>
              </Button>
            </div>
            {isAuthenticated && user ? (
              <>
                <div className="border-t border-neutral-700 my-2"></div>
                <NavLink to="/dashboard" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                <NavLink to="/dashboard/profile" className={navLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>My Profile</NavLink>
                <button 
                  onClick={async () => { 
                    await logout(); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className={`${navLinkClasses({isActive:false})} w-full text-left flex items-center space-x-2 hover:text-red-400`}
                >
                  <LogoutIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-neutral-700 mt-2">
                  <Button variant="primary" size="sm" className="w-full bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-500 rounded-lg">
                      <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;