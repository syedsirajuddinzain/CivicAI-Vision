import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Landmark,
  AlertCircle,
  LayoutDashboard,
  HardHat,
  LogIn,
  LogOut,
  Menu,
  X,
  Shield,
  FileText,
  Bell,
  Smartphone,
  User,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import NotificationCenter from './citizen/NotificationCenter';
import PhoneCapabilitiesModal from './mobile/PhoneCapabilitiesModal';
import { getUnreadCount } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [capabilitiesOpen, setCapabilitiesOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const updateBadge = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (err) {
      console.warn('Navbar badge error:', err);
    }
  };

  useEffect(() => {
    updateBadge();
    const handleUpdate = () => updateBadge();
    window.addEventListener('civic_notifications_updated', handleUpdate);
    return () => window.removeEventListener('civic_notifications_updated', handleUpdate);
  }, []);

  // Compute dynamic navigation links strictly based on authenticated role
  const getNavLinks = () => {
    if (role === 'authority') {
      return [
        { name: 'Home', path: '/', icon: Landmark },
        { name: 'Department Dashboard', path: '/authority', icon: LayoutDashboard },
      ];
    }

    if (role === 'worker') {
      return [
        { name: 'Home', path: '/', icon: Landmark },
        { name: 'My Tasks', path: '/worker', icon: HardHat },
      ];
    }

    if (role === 'citizen') {
      return [
        { name: 'Home', path: '/', icon: Landmark },
        { name: 'Report Issue', path: '/report', icon: AlertCircle },
        { name: 'My Reports', path: '/my-reports', icon: FileText },
      ];
    }

    // Default / Unauthenticated visitor
    return [
      { name: 'Home', path: '/', icon: Landmark },
      { name: 'Report Issue', path: '/report', icon: AlertCircle },
    ];
  };

  const navLinks = getNavLinks();

  const handleRoleSwitch = async (targetRole) => {
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    try {
      const u = await switchRole(targetRole);
      if (u.role === 'authority') navigate('/authority');
      else if (u.role === 'worker') navigate('/worker');
      else navigate('/my-reports');
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const roleColors = {
    authority: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    worker: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    citizen: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight hover:opacity-90 transition">
            <div className="p-2 bg-blue-600 rounded-lg text-white flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
              Civic<span className="text-blue-400 font-extrabold">AI</span>
            </span>
          </Link>

          {/* Desktop Role-Based Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/25 text-blue-400 font-bold border border-blue-500/30 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 relative">
            {/* Phone Capabilities Demo Button */}
            <button
              type="button"
              onClick={() => setCapabilitiesOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-blue-400 hover:bg-slate-800 transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
              title="Audit Phone & Browser Capabilities"
              aria-label="Phone Capabilities"
            >
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span className="hidden xl:inline text-xs font-semibold text-slate-300">
                Phone Demo
              </span>
            </button>

            {/* Notification Bell Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-blue-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Popover */}
              <NotificationCenter
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
              />
            </div>

            {/* Authenticated User Status & Role Switcher */}
            {isAuthenticated && user ? (
              <div className="relative hidden md:flex items-center gap-2">
                {/* Role Switcher Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      roleColors[role] || 'bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                    title="Change active testing role"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="capitalize">{role}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {roleMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Switch Active Role
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRoleSwitch('citizen')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          role === 'citizen' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>Citizen</span>
                        {role === 'citizen' && <span className="text-[10px]">Active</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleSwitch('authority')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          role === 'authority' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>Authority</span>
                        {role === 'authority' && <span className="text-[10px]">Active</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleSwitch('worker')}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          role === 'worker' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>Worker</span>
                        {role === 'worker' && <span className="text-[10px]">Active</span>}
                      </button>
                    </div>
                  )}
                </div>

                {/* User Name Chip */}
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-extrabold text-slate-200 block truncate max-w-[130px]">
                    {user.name}
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Log out of session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Unauthenticated: Show Login Button */
              <div className="hidden md:flex items-center">
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-900/50 hover:shadow-md active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                type="button"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2 animate-in fade-in">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-100">{user.name}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 border ${roleColors[role] || 'bg-slate-700 text-slate-300'}`}>
                  Role: {role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/25 text-blue-400 font-bold border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Quick Role Switch in Mobile Drawer */}
          {isAuthenticated && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block px-1">
                Quick Role Testing Switcher
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('citizen')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                    role === 'citizen' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('authority')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                    role === 'authority' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Authority
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('worker')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                    role === 'worker' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Worker
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Phone Capabilities Modal */}
      <PhoneCapabilitiesModal
        isOpen={capabilitiesOpen}
        onClose={() => setCapabilitiesOpen(false)}
      />
    </header>
  );
}
