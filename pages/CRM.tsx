import React, { useState } from 'react';
import { Card, Button, Input, TextArea } from '../components/UI';
import { Plus, Phone, Mail, MapPin, Search, Sparkles } from 'lucide-react';
import { Client } from '../types';
import { suggestClientAction } from '../services/geminiService';

interface CRMProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
}

export const CRM: React.FC<CRMProps> = ({ clients, onAddClient }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [suggestion, setSuggestion] = useState<{id: string, text: string} | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // New Client Form
  const [newClient, setNewClient] = useState<Partial<Client>>({});

  const handleSaveClient = () => {
    if (!newClient.name || !newClient.email) return;
    onAddClient({
      id: Math.random().toString(36).substr(2, 9),
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone || '',
      company: newClient.company || '',
      address: newClient.address || '',
      status: 'active',
      totalSpent: 0,
      lastContact: new Date().toISOString().split('T')[0],
      notes: newClient.notes || '',
    } as Client);
    setIsAdding(false);
    setNewClient({});
  };

  const handleGetSuggestion = async (client: Client) => {
    setLoadingId(client.id);
    const result = await suggestClientAction(JSON.stringify(client));
    setSuggestion({ id: client.id, text: result });
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">CRM Lite</h2>
          <p className="text-slate-500">Manage your client relationships.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Client</>}
        </Button>
      </div>

      {isAdding && (
        <Card title="Add New Client" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={newClient.name || ''} onChange={e => setNewClient({...newClient, name: e.target.value})} />
            <Input label="Email" type="email" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} />
            <Input label="Phone" value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
            <Input label="Company" value={newClient.company || ''} onChange={e => setNewClient({...newClient, company: e.target.value})} />
            <TextArea label="Address" className="md:col-span-2" value={newClient.address || ''} onChange={e => setNewClient({...newClient, address: e.target.value})} />
            <TextArea label="Notes" className="md:col-span-2" value={newClient.notes || ''} onChange={e => setNewClient({...newClient, notes: e.target.value})} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveClient}>Save Client</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map(client => (
          <Card key={client.id} className="relative hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{client.name}</h3>
                  <p className="text-xs text-slate-500">{client.company}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {client.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                {client.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                {client.phone}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span className="truncate">{client.address}</span>
              </div>
            </div>

            {suggestion?.id === client.id && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100 text-sm text-slate-700 animate-in fade-in">
                <div className="flex items-center gap-2 mb-1 text-orange-600 font-semibold">
                  <Sparkles size={14} /> AI Suggestion
                </div>
                {suggestion.text}
              </div>
            )}

            <div className="flex gap-2 border-t border-slate-100 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 text-xs h-9" 
                onClick={() => handleGetSuggestion(client)}
                isLoading={loadingId === client.id}
              >
                <Sparkles size={14} className="mr-1 text-orange-500" /> 
                {loadingId === client.id ? 'Thinking...' : 'Insights'}
              </Button>
              <Button variant="ghost" className="flex-1 text-xs h-9">View Details</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
