import React from 'react';
import { Loader2, X, ChevronDown } from 'lucide-react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode }> = ({ 
  children, className = '', title, action 
}) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] ${className}`}>
    {(title || action) && (
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
        {title && <h3 className="font-bold text-lg text-slate-800 tracking-tight">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', isLoading?: boolean }> = ({ 
  children, className = '', variant = 'primary', isLoading, disabled, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 tracking-wide";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 focus:ring-slate-100",
    secondary: "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 focus:ring-orange-100",
    outline: "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-100",
    ghost: "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 focus:ring-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 focus:ring-red-100"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full group">
    {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-3">{label}</label>}
    <input 
      className={`w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500/20 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 shadow-sm group-hover:bg-slate-100 focus:group-hover:bg-white ${className}`}
      {...props}
    />
  </div>
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full group">
    {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-3">{label}</label>}
    <textarea 
      className={`w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500/20 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 shadow-sm group-hover:bg-slate-100 focus:group-hover:bg-white ${className}`}
      {...props}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
  <div className="w-full group">
    {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-3">{label}</label>}
    <div className="relative">
      <select 
        className={`w-full pl-5 pr-10 py-3.5 bg-slate-50 border-transparent rounded-2xl text-sm text-slate-900 focus:bg-white focus:border-orange-500/20 focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all duration-200 appearance-none cursor-pointer shadow-sm group-hover:bg-slate-100 focus:group-hover:bg-white ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    active: "bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-600/20",
    inactive: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
    draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
    sent: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    overdue: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/50 ring-1 ring-black/5">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-white/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};