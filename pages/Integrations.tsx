import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'gmail', name: 'Gmail', description: 'Send emails directly from your dashboard.', connected: true, color: 'bg-red-500', loading: false },
    { id: 'stripe', name: 'Stripe', description: 'Accept payments and sync transactions.', connected: false, color: 'bg-indigo-600', loading: false },
    { id: 'paypal', name: 'PayPal', description: 'Alternative payment gateway for clients.', connected: false, color: 'bg-blue-600', loading: false },
  ]);

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(tool => 
      tool.id === id ? { ...tool, loading: true } : tool
    ));

    // Simulate API call
    setTimeout(() => {
      setIntegrations(prev => prev.map(tool => 
        tool.id === id ? { ...tool, connected: !tool.connected, loading: false } : tool
      ));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Integrations</h2>
        <p className="text-slate-500">Connect your favorite tools to Orange Business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((tool) => (
          <Card key={tool.id} className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                {tool.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{tool.name}</h3>
                {tool.connected ? (
                  <span className="text-xs text-green-600 flex items-center font-medium">
                    <CheckCircle2 size={12} className="mr-1" /> Connected
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center">
                     Not connected
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6 flex-grow">
              {tool.description}
            </p>
            <Button 
              variant={tool.connected ? 'outline' : 'primary'} 
              className="w-full"
              onClick={() => toggleIntegration(tool.id)}
              isLoading={tool.loading}
            >
              {tool.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
