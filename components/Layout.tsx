import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Mail, 
  Settings, 
  Workflow, 
  Shield, 
  LogOut, 
  Menu, 
  Sparkles,
  Search,
  Bell
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  user: User;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, user, onLogout, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'crm', icon: Users, label: 'Clients' },
    { id: 'email-ai', icon: Mail, label: 'Email AI' },
    { id: 'ai-chat', icon: Sparkles, label: 'Assistant', highlight: true },
    { id: 'integrations', icon: Workflow, label: 'Integrations' },
    { id: 'admin', icon: Shield, label: 'Admin', role: 'admin' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="h-20 flex items-center px-8 border-b border-slate-50">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white mr-3 shadow-lg shadow-orange-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
              Orange
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {menuItems.filter(item => !item.role || item.role === user.role).map((item) => (
              <button
                key={item.id}
                onClick={() => { onChangeView(item.id); onClose(); }}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group
                  ${currentView === item.id 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon 
                  size={18} 
                  className={`mr-3 transition-colors ${currentView === item.id ? 'text-orange-400' : item.highlight ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`} 
                />
                {item.label}
                {item.highlight && (
                  <span className={`ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${currentView === item.id ? 'bg-orange-500/20 text-orange-200' : 'bg-orange-50 text-orange-600'}`}>
                    New
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-50">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-slate-700 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const Topbar: React.FC<{ onMenuClick: () => void; title: string; user: User }> = ({ onMenuClick, title, user }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 h-20 px-4 md:px-8 flex items-center justify-between transition-all duration-200">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center bg-slate-100/50 rounded-full px-4 py-2 border border-slate-200/50 focus-within:bg-white focus-within:border-orange-200 focus-within:ring-2 focus-within:ring-orange-100 transition-all w-64">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full placeholder-slate-400 text-slate-700"
          />
        </div>

        <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};