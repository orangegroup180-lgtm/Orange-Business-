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
import { storage } from './services/storage';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(storage.getAuth());
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // App Data State
  const [user, setUser] = useState<User>(storage.getUser());
  const [clients, setClients] = useState<Client[]>(storage.getClients());
  const [documents, setDocuments] = useState<AppDocument[]>(storage.getDocuments());

  // Persistence Effects
  useEffect(() => {
    if (isAuthenticated) {
      storage.saveUser(user);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      storage.saveClients(clients);
    }
  }, [clients, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      storage.saveDocuments(documents);
    }
  }, [documents, isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    // Refresh user data in case it was just created during signup
    setUser(storage.getUser());
    setView('dashboard');
  };

  const handleLogout = () => {
    storage.setAuth(false);
    setIsAuthenticated(false);
    setView('dashboard');
  };

  const handleCreateDocument = (doc: AppDocument) => {
    setDocuments([doc, ...documents]);
    setView('documents');
  };

  const handleUpdateDocument = (updatedDoc: AppDocument) => {
    setDocuments(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const handleAddClient = (client: Client) => {
    setClients([...clients, client]);
  };

  const handleUpdateUser = (updatedUser: Partial<User>) => {
    setUser({ ...user, ...updatedUser });
  };

  const renderView = () => {
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
      case 'settings': return <Settings user={user} onUpdateUser={handleUpdateUser} />;
      case 'integrations': return <Integrations />;
      case 'admin': return <Admin />;
      default: return <Dashboard documents={documents} clients={clients} />;
    }
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="flex-1 md:ml-64 transition-all duration-200 w-full">
        <Topbar 
          onMenuClick={() => setSidebarOpen(true)} 
          title={view === 'ai-chat' ? 'AI Assistant' : view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}
          user={user}
        />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;