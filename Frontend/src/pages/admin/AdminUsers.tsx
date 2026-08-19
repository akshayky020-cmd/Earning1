import { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Edit2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateUserRole, updateUserStatus } from '../../store/slices/dataSlice';

export const AdminUsers = () => {
  const users = useSelector((state: RootState) => state.data.users);
  const dispatch = useDispatch();

  const handleToggleBlock = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    dispatch(updateUserStatus({ id, status: newStatus }));
  };

  const handleToggleRole = (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    dispatch(updateUserRole({ id, role: newRole }));
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View, block, or modify user roles.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Search users..."
          />
        </div>
      </header>

      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-white/5">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Balance (₹)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.mobile}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-gray-900 dark:text-white">
                    {user.balance.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide flex items-center inline-flex ${
                      user.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">
                    {user.joinDate}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 inline-flex"
                      title="Toggle Role"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleToggleBlock(user.id, user.status)}
                      className={`p-2 transition-colors rounded-lg inline-flex ${
                        user.status === 'active' 
                          ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
                          : 'text-red-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10'
                      }`}
                      title={user.status === 'active' ? "Block User" : "Unblock User"}
                    >
                      {user.status === 'active' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
