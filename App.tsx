import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { CRM } from './pages/CRM';
import { EmailAI } from './pages/EmailAI';
import { Settings } from './pages/Settings';
import { Integrations } from './pages/Integrations';
import { Admin } from './pages/Admin';
import { AIChat } from './pages/AIChat';
import { Auth } from './pages/Auth';
import { User, Client, AppDocument } from './types';
import { api } from './services/api';
import { supabase } from './services/supabase';
import { Loader2, Database, AlertCircle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // App Data State
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbMissing, setDbMissing] = useState(false);

  // Initialize Auth Listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Auth session check warning:", error.message);
        }
        const session = data?.session;
        setIsAuthenticated(!!session);
        if (session) {
          loadData();
        }
      } catch (err) {
        console.error("Critical Auth Error:", err);
        // Fallback to unauthenticated state so app renders login instead of white screen
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        if (!user) loadData(); 
      } else {
        setUser(null);
        setClients([]);
        setDocuments([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setDataLoading(true);
    setError(null);
    setDbMissing(false);
    
    try {
      // 1. Check Profile
      const currentUser = await api.getCurrentUser();
      
      // 2. Fetch Business Data (only if profile exists, or try anyway to catch db errors)
      const [fetchedClients, fetchedDocs] = await Promise.all([
        api.getClients(),
        api.getDocuments()
      ]);
      
      if (currentUser) setUser(currentUser);
      setClients(fetchedClients);
      setDocuments(fetchedDocs);
    } catch (error: any) {
      console.error("Failed to load data", error);
      
      // Check for specific Supabase error codes for "Relation does not exist" (missing tables)
      if (error?.code === '42P01' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
        setDbMissing(true);
        setError("Database tables are missing.");
      } else {
        setError(error.message || "Failed to load business data. Please check your connection.");
      }
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = () => {
    // Session state handled by onAuthStateChange, but we trigger reload
    loadData();
    setView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('dashboard');
    setUser(null);
  };

  const handleCreateDocument = async (doc: AppDocument) => {
    const tempId = doc.id;
    setDocuments([doc, ...documents]);
    setView('documents');

    try {
      const created = await api.createDocument(doc);
      setDocuments(prev => prev.map(d => d.id === tempId ? created : d));
    } catch (e) {
      console.error(e);
      setDocuments(prev => prev.filter(d => d.id !== tempId));
      alert("Failed to save document. Check database permissions.");
    }
  };

  const handleUpdateDocument = async (updatedDoc: AppDocument) => {
    setDocuments(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    try {
      await api.updateDocument(updatedDoc);
    } catch (e) {
      console.error(e);
      alert("Failed to update document");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const backup = documents;
    setDocuments(documents.filter(d => d.id !== id));
    try {
      await api.deleteDocument(id);
    } catch (e) {
      console.error(e);
      setDocuments(backup);
      alert("Failed to delete document");
    }
  };

  const handleAddClient = async (client: Client) => {
    const tempId = client.id;
    setClients([...clients, client]);
    try {
      const created = await api.createClient(client);
      setClients(prev => prev.map(c => c.id === tempId ? { ...c, id: created.id } : c));
    } catch (e) {
      console.error(e);
      setClients(prev => prev.filter(c => c.id !== tempId));
      alert("Failed to create client");
    }
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!user) return;
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    try {
      await api.updateProfile(user.id, updatedUser);
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    }
  };

  const renderView = () => {
    if (dataLoading && !user) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-500">Loading your business data...</p>
        </div>
      );
    }

    // Database Setup Required (Missing Tables OR Missing Profile)
    if ((dbMissing || (isAuthenticated && !user && !dataLoading)) && !error?.includes("fetch")) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in slide-in-from-bottom-4">
           <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
              <Database size={32} />
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-3">Database Setup Required</h2>
           <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
             {dbMissing 
               ? "The database tables are missing. The app cannot function without them." 
               : "We couldn't find your user profile. This usually happens if the database tables haven't been created yet."}
           </p>
           <div className="bg-slate-50 p-6 rounded-xl text-left max-w-lg w-full border border-slate-200 shadow-sm">
              <p className="text-sm font-bold text-slate-700 mb-2">How to fix this:</p>
              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Supabase Dashboard</a>.</li>
                <li>Open the <strong>SQL Editor</strong> tab.</li>
                <li>Paste and Run the <strong>Database SQL Script</strong>.</li>
                <li>Refresh this page.</li>
              </ol>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="mt-8 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-slate-200 flex items-center"
           >
             <RefreshCw size={16} className="mr-2" />
             I've ran the script, Refresh
           </button>
        </div>
      )
    }

    if (error && !user) {
         return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={32} />
               </div>
               <h2 className="text-2xl font-bold text-slate-800 mb-3">Connection Error</h2>
               <p className="text-slate-500 max-w-md mb-8">{error}</p>
               <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-900 text-white rounded-full">Retry</button>
            </div>
         )
    }

    switch(view) {
      case 'dashboard': return <Dashboard documents={documents} clients={clients} />;
      case 'documents': return (
        <Documents 
          documents={documents} 
          clients={clients} 
          onCreateDocument={handleCreateDocument} 
          onUpdateDocument={handleUpdateDocument}
          onDeleteDocument={handleDeleteDocument} 
        />
      );
      case 'crm': return <CRM clients={clients} onAddClient={handleAddClient} />;
      case 'ai-chat': return <AIChat />;
      case 'email-ai': return <EmailAI documents={documents} clients={clients} />;
      case 'settings': return user ? <Settings user={user} onUpdateUser={handleUpdateUser} /> : null;
      case 'integrations': return <Integrations />;
      case 'admin': return <Admin />;
      default: return <Dashboard documents={documents} clients={clients} />;
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        user={user || { id: '', name: 'Loading...', email: '', role: 'user', plan: 'solo', joinedDate: '' }}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 md:ml-64 transition-all duration-200 w-full">
        <Topbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={view === 'ai-chat' ? 'AI Assistant' : view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}
          user={user || { id: '', name: '', email: '', role: 'user', plan: 'solo', joinedDate: '' }}
        />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;