import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  LayoutDashboard,
  Compass,
  Ticket,
  CalendarCheck,
  Award,
  Bell,
  User,
  PlusCircle,
  QrCode,
  BarChart3,
  Users,
  ShieldCheck,
  FolderKanban,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Links based on active role
  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
          { label: 'Event Approvals', icon: ShieldCheck, path: '/admin/approvals' },
          { label: 'User Management', icon: Users, path: '/admin/users' },
          { label: 'Event Catalog', icon: FolderKanban, path: '/admin/events' },
          { label: 'Platform Analytics', icon: BarChart3, path: '/admin/analytics' },
          { label: 'Explore Events', icon: Compass, path: '/events' },
        ];
      case 'organizer':
        return [
          { label: 'Organizer Dashboard', icon: LayoutDashboard, path: '/organizer/dashboard' },
          { label: 'Create New Event', icon: PlusCircle, path: '/organizer/events/new' },
          { label: 'Manage Events', icon: CalendarCheck, path: '/organizer/events' },
          { label: 'QR Ticket Scanner', icon: QrCode, path: '/organizer/scanner' },
          { label: 'Event Analytics', icon: BarChart3, path: '/organizer/analytics' },
          { label: 'Explore Events', icon: Compass, path: '/events' },
        ];
      case 'student':
      default:
        return [
          { label: 'Student Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
          { label: 'My Registrations', icon: CalendarCheck, path: '/my-registrations' },
          { label: 'Digital Tickets', icon: Ticket, path: '/my-tickets' },
          { label: 'Certificates', icon: Award, path: '/my-certificates' },
          { label: 'Explore Events', icon: Compass, path: '/events' },
        ];
    }
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                Event<span className="text-brand-600">X</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                {user?.role} portal
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2">
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </span>
          )}
        </div>

        {navLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${isCollapsed ? 'justify-center px-2' : ''}`
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        <div className="px-3 pt-6 pb-2">
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Account
            </span>
          )}
        </div>

        <NavLink
          to="/notifications"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-brand-50 text-brand-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center px-2' : ''}`
          }
          title={isCollapsed ? 'Notifications' : undefined}
        >
          <Bell className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Notifications</span>}
        </NavLink>

        <NavLink
          to="/profile"
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-brand-50 text-brand-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            } ${isCollapsed ? 'justify-center px-2' : ''}`
          }
          title={isCollapsed ? 'My Profile' : undefined}
        >
          <User className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>My Profile</span>}
        </NavLink>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-slate-100">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100 ${isCollapsed ? 'justify-center p-1' : ''}`}>
          <img
            src={
              user?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=5146E5&color=fff`
            }
            alt={user?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 capitalize truncate">{user?.role}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-xs bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

