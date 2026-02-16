import { User, Client, AppDocument } from '../types';

const STORAGE_KEYS = {
  USER: 'orange_user',
  CLIENTS: 'orange_clients',
  DOCUMENTS: 'orange_documents',
  AUTH: 'orange_auth'
};

// Mock Data Seeds
const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Sterling',
  email: 'alex@orange.biz',
  role: 'user',
  plan: 'pro',
  businessName: 'Sterling Design Studio',
  joinedDate: '2023-05-20'
};

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0123', company: 'Acme Inc', status: 'active', totalSpent: 12000, lastContact: '2023-11-01', notes: 'Key enterprise account.' },
  { id: 'c2', name: 'Jane Doe', email: 'jane@gmail.com', phone: '555-9876', company: 'Freelancer', status: 'active', totalSpent: 500, lastContact: '2023-11-10', notes: 'Needs monthly updates.' },
];

const MOCK_DOCS: AppDocument[] = [
  { id: 'd1001', clientId: 'c1', type: 'invoice', status: 'paid', items: [{ id: 'i1', description: 'Web Design', quantity: 1, price: 5000 }], subtotal: 5000, tax: 500, total: 5500, date: '2023-10-15', dueDate: '2023-10-30', notes: 'Thank you for your business.' },
  { id: 'd1002', clientId: 'c1', type: 'quote', status: 'sent', items: [{ id: 'i2', description: 'Maintenance', quantity: 10, price: 200 }], subtotal: 2000, tax: 200, total: 2200, date: '2023-11-01', dueDate: '2023-11-15' },
  { id: 'd1003', clientId: 'c2', type: 'invoice', status: 'overdue', items: [{ id: 'i3', description: 'Consultation', quantity: 5, price: 100 }], subtotal: 500, tax: 50, total: 550, date: '2023-09-20', dueDate: '2023-10-04' },
];

export const storage = {
  getUser: (): User => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : MOCK_USER;
  },
  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  getClients: (): Client[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : MOCK_CLIENTS;
  },
  saveClients: (clients: Client[]) => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  getDocuments: (): AppDocument[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return data ? JSON.parse(data) : MOCK_DOCS;
  },
  saveDocuments: (docs: AppDocument[]) => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  },

  getAuth: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },
  setAuth: (status: boolean) => {
    localStorage.setItem(STORAGE_KEYS.AUTH, String(status));
  },
  
  clear: () => {
    localStorage.clear();
  }
};
