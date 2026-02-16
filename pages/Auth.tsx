import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { User } from '../types';
import { storage } from '../services/storage';
import { ArrowRight, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      if (!isLogin) {
        // Handle Sign Up: Create new user profile
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          email: formData.email,
          role: 'user',
          plan: 'solo',
          businessName: formData.businessName,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        storage.saveUser(newUser);
      }
      
      storage.setAuth(true);
      onLogin();
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-200/40 rounded-full blur-[120px] animate-in fade-in duration-1000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px] animate-in fade-in duration-1000 delay-300" />

      <div className="w-full max-w-md z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
        <div className="text-center mb-8">
           <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-orange-200/50 ring-4 ring-white">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Orange Business</h1>
            <p className="text-slate-500 mt-2 font-medium">The operating system for your business.</p>
        </div>

        <Card className="border-white/50 shadow-2xl backdrop-blur-xl bg-white/80 ring-1 ring-white/50">
          <div className="mb-6 flex justify-center">
            <div className="bg-slate-100/80 p-1 rounded-full flex w-full max-w-[200px]">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                <Input 
                  label="Full Name" 
                  placeholder="e.g. Alex Sterling"
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-white/50 focus:bg-white"
                />
                <Input 
                  label="Business Name" 
                  placeholder="e.g. Sterling Studio"
                  required 
                  value={formData.businessName}
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                  className="bg-white/50 focus:bg-white"
                />
              </div>
            )}
            
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="name@company.com"
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="bg-white/50 focus:bg-white"
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="bg-white/50 focus:bg-white"
            />

            <Button 
              className="w-full mt-4 py-3 text-base shadow-orange-200" 
              isLoading={isLoading}
            >
              {isLogin ? 'Sign In' : 'Create Account'} 
              {!isLoading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <a href="#" className="text-xs text-slate-400 hover:text-orange-600 transition-colors">Forgot your password?</a>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock size={12} />
            <span>Secured by Orange ID</span>
          </div>
        </Card>
      </div>
    </div>
  );
};