/**
 * Admin Portal - Modern Header Component
 * Displays breadcrumbs, page title, and user actions
 */

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Settings,
  LogOut,
  User,
  ChevronRight,
  Search,
  Menu,
  X,
} from 'lucide-react';

interface Breadcrumb {
  label: string;
  path: string;
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [{ label: 'Dashboard', path: '/dashboard' }];

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      path: currentPath,
    });
  });

  return breadcrumbs;
}

interface HeaderProps {
  onMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ onMenuToggle, showMobileMenu = false }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const breadcrumbs = getBreadcrumbs(location.pathname);
  const notificationCount = 5;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 z-30 shadow-sm lg:left-64">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side: Menu toggle + Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile menu toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
            {breadcrumbs.slice(0, -1).map((item, idx) => (
              <React.Fragment key={idx}>
                <button
                  onClick={() => navigate(item.path)}
                  className="hover:text-gray-900 whitespace-nowrap transition"
                >
                  {item.label}
                </button>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              </React.Fragment>
            ))}
            {breadcrumbs.length > 0 && (
              <span className="font-medium text-gray-900 whitespace-nowrap">
                {breadcrumbs[breadcrumbs.length - 1].label}
              </span>
            )}
          </nav>
        </div>

        {/* Right side: Search, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Search bar (desktop only) */}
          <div className="hidden lg:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Quick search..."
              className="flex-1 ml-2 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {[
                    { title: 'New support ticket', time: '5 min ago', read: false },
                    { title: 'User registered', time: '1 hour ago', read: false },
                    { title: 'Payment received', time: '3 hours ago', read: true },
                  ].map((notif, idx) => (
                    <button
                      key={idx}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition ${
                        !notif.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                            !notif.read ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                          <p className="text-xs text-gray-500">{notif.time}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                AD
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-900">Admin</span>
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@swipesavvy.com</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-b border-gray-100">
                  <User size={16} />
                  My Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition border-b border-gray-100">
                  <Settings size={16} />
                  Settings
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
