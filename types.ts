export type UserRole = 'user' | 'admin';
export type PlanType = 'solo' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  businessName?: string;
  joinedDate: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive';
  totalSpent: number;
  lastContact: string;
  notes: string;
}

export type DocumentType = 'invoice' | 'quote' | 'receipt';
export type DocumentStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface DocItem {
  id: string;
  description: string;
  quantity: number | string;
  price: number | string;
}

export interface DocDesign {
  color: string;
  font: string; // 'helvetica' | 'times' | 'courier'
  layout: 'modern' | 'classic'; // 'modern' = left align, 'classic' = center align
}

export interface AppDocument {
  id: string;
  clientId: string;
  type: DocumentType;
  status: DocumentStatus;
  items: DocItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  dueDate: string;
  notes?: string;
  design?: DocDesign;
}

export interface Integration {
  id: string;
  name: string;
  connected: boolean;
  icon: string; // lucide icon name
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}