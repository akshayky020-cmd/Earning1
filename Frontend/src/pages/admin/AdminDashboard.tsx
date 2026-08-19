import { Users, ArrowUpRight, ArrowDownRight, Cpu } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export const AdminDashboard = () => {
  const users = useSelector((state: RootState) => state.data.users);
  const plans = useSelector((state: RootState) => state.data.plans);
  const transactions = useSelector((state: RootState) => state.data.transactions);

  const totalUsers = users.length;

  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role !== 'admin').length;

  const activePlans = plans.length;
  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
  const totalWithdrawals = transactions.filter(t => (t.type === 'withdraw' || t.type === 'withdrawal') && t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);

  const stats = [
    { title: 'Total Users', value: totalUsers.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { title: 'User Levels', value: `${regularUsers} User / ${adminUsers} Admin`, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20' },
    { title: 'Total Deposits', value: `₹${totalDeposits.toLocaleString()}`, icon: ArrowDownRight, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20' },
    { title: 'Total Withdrawals', value: `₹${totalWithdrawals.toLocaleString()}`, icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20' },
  ];

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform statistics and recent activity summary.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
