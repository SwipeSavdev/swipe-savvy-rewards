/**
 * Admin Portal - Modern Sidebar Component
 * Provides navigation with collapsible groups and active states
 */

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Activity,
  Ticket,
  Shield,
  BarChart3,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react';

interface NavSubItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  submenu?: NavSubItem[];
  group?: string;
}

const navigationGroups = [
  {
    group: 'Main',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    group: 'Support',
    items: [
      {
        label: 'Support System',
        icon: <MessageSquare size={20} />,
        submenu: [
          { label: 'Dashboard', path: '/support/dashboard', icon: <Activity size={16} /> },
          { label: 'Tickets', path: '/support/tickets', icon: <Ticket size={16} />, badge: 5 },
        ],
      },
    ],
  },
  {
    group: 'Administration',
    items: [
      {
        label: 'Administration',
        icon: <Shield size={20} />,
        submenu: [
          { label: 'Users', path: '/admin/users', icon: <Users size={16} /> },
          { label: 'Audit Logs', path: '/admin/audit-logs', icon: <Activity size={16} /> },
        ],
      },
    ],
  },
  {
    group: 'Business',
    items: [
      { label: 'Users', path: '/users', icon: <Users size={20} /> },
      { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
      { label: 'Merchants', path: '/merchants', icon: <ShoppingBag size={20} /> },
      { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    ],
  },
  {
    group: 'Tools',
    items: [
      { label: 'AI Marketing', path: '/ai-marketing', icon: <Sparkles size={20} /> },
      { label: 'Feature Flags', path: '/feature-flags', icon: <Zap size={20} /> },
      { label: 'Concierge', path: '/concierge', icon: <MessageSquare size={20} /> },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Main', 'Support', 'Administration', 'Business'])
  );

  const toggleGroup = (groupLabel: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(groupLabel)) {
      newSet.delete(groupLabel);
    } else {
      newSet.add(groupLabel);
    }
    setExpandedGroups(newSet);
  };

  const isActive = (path?: string) => {
    return path && location.pathname.startsWith(path);
  };

  const isSubmenuActive = (submenu?: NavSubItem[]) => {
    return submenu?.some((item) => location.pathname.startsWith(item.path));
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white overflow-y-auto shadow-xl">
      {/* Logo/Branding */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold">SwipeSavvy</h1>
          <p className="text-xs text-gray-400">Admin Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        {navigationGroups.map((navGroup) => (
          <div key={navGroup.group} className="mb-8">
            {/* Group Title */}
            {navGroup.group !== 'Main' && (
              <h3 className="px-4 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {navGroup.group}
              </h3>
            )}

            {/* Group Items */}
            <div className="space-y-1">
              {navGroup.items.map((item) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isExpanded = expandedGroups.has(item.label);
                const isItemActive = isActive(item.path) || isSubmenuActive(item.submenu);

                return (
                  <div key={item.label}>
                    {/* Main Item */}
                    {item.path && !hasSubmenu ? (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                          isActive(item.path)
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium text-sm flex-1">{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => hasSubmenu && toggleGroup(item.label)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                          isItemActive && hasSubmenu
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                        {hasSubmenu && (
                          <ChevronDown
                            size={16}
                            className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        )}
                      </button>
                    )}

                    {/* Submenu */}
                    {hasSubmenu && isExpanded && (
                      <div className="mt-1 space-y-1 pl-4">
                        {item.submenu!.map((subitem) => (
                          <Link
                            key={subitem.path}
                            to={subitem.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                              isActive(subitem.path)
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                          >
                            <span>{subitem.icon}</span>
                            <span className="flex-1">{subitem.label}</span>
                            {subitem.badge && (
                              <span className="px-2 py-1 text-xs bg-red-600 rounded-full font-semibold">
                                {subitem.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile/Logout */}
      <div className="px-4 py-4 border-t border-gray-800 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">admin@swipesavvy.com</p>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/10 hover:text-red-400 transition">
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
