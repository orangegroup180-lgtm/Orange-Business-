import { supabase } from './supabase';
import { User, Client, AppDocument } from '../types';

export const api = {
  // Auth & Profile
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      businessName: data.business_name,
      role: data.role as any,
      plan: data.plan as any,
      joinedDate: data.joined_date
    };
  },

  createProfile: async (user: User) => {
    // Note: User ID is provided by Supabase Auth
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      name: user.name,
      business_name: user.businessName,
      role: user.role,
      plan: user.plan,
      joined_date: user.joinedDate
    });
    if (error) throw error;
  },

  updateProfile: async (id: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.businessName) dbUpdates.business_name = updates.businessName;
    if (updates.plan) dbUpdates.plan = updates.plan;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', id);
    if (error) throw error;
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      company: c.company,
      address: c.address,
      status: c.status,
      totalSpent: Number(c.total_spent),
      lastContact: c.last_contact,
      notes: c.notes
    }));
  },

  createClient: async (client: Client) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    // We let Supabase generate the UUID for ID
    const { data, error } = await supabase.from('clients').insert({
      user_id: user.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      status: client.status,
      total_spent: client.totalSpent,
      last_contact: client.lastContact,
      notes: client.notes
    }).select().single();

    if (error) throw error;
    
    // Return the client with the new ID from DB
    return {
      ...client,
      id: data.id
    };
  },

  // Documents
  getDocuments: async (): Promise<AppDocument[]> => {
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (error) throw error;

    return data.map((d: any) => ({
      id: d.id,
      clientId: d.client_id,
      type: d.type,
      status: d.status,
      date: d.date,
      dueDate: d.due_date,
      subtotal: Number(d.subtotal),
      tax: Number(d.tax),
      total: Number(d.total),
      items: d.items,
      design: d.design,
      notes: d.notes
    }));
  },

  createDocument: async (doc: AppDocument) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");

    const { data, error } = await supabase.from('documents').insert({
      user_id: user.id,
      client_id: doc.clientId,
      type: doc.type,
      status: doc.status,
      date: doc.date,
      due_date: doc.dueDate,
      subtotal: doc.subtotal,
      tax: doc.tax,
      total: doc.total,
      items: doc.items,
      design: doc.design,
      notes: doc.notes
    }).select().single();

    if (error) throw error;
    return { ...doc, id: data.id };
  },

  updateDocument: async (doc: AppDocument) => {
    const { error } = await supabase.from('documents').update({
      client_id: doc.clientId,
      type: doc.type,
      status: doc.status,
      date: doc.date,
      due_date: doc.dueDate,
      subtotal: doc.subtotal,
      tax: doc.tax,
      total: doc.total,
      items: doc.items,
      design: doc.design,
      notes: doc.notes
    }).eq('id', doc.id);

    if (error) throw error;
  },

  deleteDocument: async (id: string) => {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
  }
};