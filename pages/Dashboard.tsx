import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sparkles, ArrowUpRight, ArrowDownRight, DollarSign, FileText, Users } from 'lucide-react';
import { AppDocument, Client } from '../types';
import { generateInsights } from '../services/geminiService';

interface DashboardProps {
  documents: AppDocument[];
  clients: Client[];
}

export const Dashboard: React.FC<DashboardProps> = ({ documents, clients }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Calculate stats
  const totalRevenue = documents
    .filter(d => d.status === 'paid')
    .reduce((sum, d) => sum + d.total, 0);

  const pendingRevenue = documents
    .filter(d => d.status === 'sent' || d.status === 'overdue')
    .reduce((sum, d) => sum + d.total, 0);

  const activeClients = clients.filter(c => c.status === 'active').length;

  // Prepare chart data (Last 6 months simulated)
  const chartData = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
  ].map(d => ({ ...d, sales: d.sales + Math.floor(Math.random() * 2000) })); // Add some dynamic feel

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    const dataContext = `
      Total Revenue: $${totalRevenue}. 
      Pending Revenue: $${pendingRevenue}. 
      Active Clients: ${activeClients}. 
      Recent Sales Trend: Fluctuating but generally positive.
    `;
    const result = await generateInsights(dataContext);
    setInsights(result);
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleGenerateInsights}
          isLoading={loadingInsights}
          className="bg-slate-900"
        >
          <Sparkles size={16} className="mr-2 text-orange-400" />
          {loadingInsights ? 'Analyzing...' : (insights ? 'Refresh Insights' : 'Get AI Insights')}
        </Button>
      </div>

      {insights && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} />
          </div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-orange-400" />
            AI Business Analysis
          </h3>
          <div className="prose prose-invert max-w-none text-sm text-slate-300 whitespace-pre-line">
            {insights}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              <ArrowUpRight size={14} className="mr-1" /> +12%
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</h3>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <FileText className="text-orange-600" size={24} />
            </div>
            <span className="flex items-center text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
              {documents.filter(d => d.status === 'draft').length} Drafts
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">Pending Payments</p>
          <h3 className="text-2xl font-bold text-slate-800">${pendingRevenue.toLocaleString()}</h3>
        </Card>

        <Card className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <span className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Active
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">Total Clients</p>
          <h3 className="text-2xl font-bold text-slate-800">{activeClients}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Revenue Trend">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="space-y-4">
            {documents.slice(0, 5).map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${doc.status === 'paid' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{doc.type.toUpperCase()} #{doc.id.slice(0,6)}</p>
                    <p className="text-xs text-slate-500">{clients.find(c => c.id === doc.clientId)?.name || 'Unknown Client'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">${doc.total.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{doc.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
