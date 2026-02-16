import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '../components/UI';
import { User } from '../types';
import { Check, Loader2 } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: Partial<User>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: user.name,
    email: user.email,
    businessName: user.businessName || '',
    plan: user.plan
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync state if prop changes (e.g. from external updates)
  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      businessName: user.businessName || '',
      plan: user.plan
    });
  }, [user]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      onUpdateUser(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500">Manage your account and preferences.</p>
      </div>

      <Card title="Profile Information">
        <div className="space-y-4">
          <Input 
            label="Full Name" 
            value={formData.name || ''} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <Input 
            label="Email Address" 
            value={formData.email || ''} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <Input 
            label="Business Name" 
            value={formData.businessName || ''} 
            placeholder="My Awesome Business"
            onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
          />
          <div className="flex justify-end items-center gap-3">
            {showSuccess && <span className="text-green-600 text-sm flex items-center"><Check size={14} className="mr-1"/> Saved</span>}
            <Button onClick={handleSave} isLoading={isSaving} disabled={!formData.name || !formData.email}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Subscription">
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-800 font-medium">Current Plan</p>
            <p className="text-2xl font-bold text-orange-600 capitalize">{user.plan}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Renews on</p>
            <p className="font-medium text-slate-800">Dec 31, 2024</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => onUpdateUser({ plan: 'solo' })}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${user.plan === 'solo' ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
          >
            <div className="flex justify-between mb-2">
              <span className="font-bold text-slate-800">Solo</span>
              <span className="font-bold text-slate-800">$29/mo</span>
            </div>
            <p className="text-xs text-slate-500">For getting started.</p>
          </div>
          <div 
            onClick={() => onUpdateUser({ plan: 'pro' })}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${user.plan === 'pro' ? 'border-orange-500 ring-1 ring-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
          >
            <div className="flex justify-between mb-2">
              <span className="font-bold text-slate-800">Pro</span>
              <span className="font-bold text-slate-800">$50/mo</span>
            </div>
            <p className="text-xs text-slate-500">For power users.</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="outline">Manage Billing</Button>
        </div>
      </Card>

      <Card title="Preferences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Currency">
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </Select>
          <Select label="Timezone">
            <option>UTC-5 (EST)</option>
            <option>UTC-8 (PST)</option>
            <option>UTC+0 (GMT)</option>
          </Select>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary">Update Preferences</Button>
        </div>
      </Card>
    </div>
  );
};
