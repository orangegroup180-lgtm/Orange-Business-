import React from 'react';
import { Card, Button, StatusBadge } from '../components/UI';
import { User } from '../types';

interface AdminProps {
  users?: User[]; 
}

export const Admin: React.FC<AdminProps> = () => {
  // Mock users for admin view
  const allUsers: User[] = [
    { id: '1', name: 'Demo User', email: 'user@orange.biz', role: 'user', plan: 'pro', joinedDate: '2023-01-15' },
    { id: '2', name: 'Admin User', email: 'admin@orange.biz', role: 'admin', plan: 'pro', joinedDate: '2023-01-01' },
    { id: '3', name: 'Sarah Connor', email: 'sarah@skynet.com', role: 'user', plan: 'solo', joinedDate: '2023-03-10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
          <p className="text-slate-500">Platform overview and user management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white">
          <p className="text-slate-400 text-sm">Total Revenue (MRR)</p>
          <h3 className="text-3xl font-bold text-white mt-1">$12,450</h3>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm">Total Users</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">1,204</h3>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm">Active Subscriptions</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">892</h3>
        </Card>
      </div>

      <Card title="User Management" className="overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{u.role}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={u.plan} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{u.joinedDate}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" className="text-xs">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-slate-100">
          {allUsers.map((u) => (
            <div key={u.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.email}</div>
                </div>
                <StatusBadge status={u.plan} />
              </div>
              <div className="flex justify-between items-center text-sm mt-3">
                <span className="capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">{u.role}</span>
                <span className="text-slate-400 text-xs">Joined {u.joinedDate}</span>
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" className="w-full text-xs h-8">Edit User</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
