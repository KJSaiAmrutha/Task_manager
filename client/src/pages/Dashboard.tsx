import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Clock, FolderKanban } from 'lucide-react';
import api from '../lib/axios';

const StatCard = ({ title, value, icon: Icon, colorClass, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-colors"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${colorClass} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="text-gray-400 font-medium">{title}</h3>
      <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
    </div>
    <div className="text-4xl font-bold text-white relative z-10">{value}</div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to your mission control.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={FolderKanban} colorClass="bg-blue-500 text-blue-400" delay={0.1} />
        <StatCard title="Total Tasks" value={stats?.totalTasks || 0} icon={BarChart3} colorClass="bg-purple-500 text-purple-400" delay={0.2} />
        <StatCard title="Completed" value={stats?.completedTasks || 0} icon={CheckCircle2} colorClass="bg-green-500 text-green-400" delay={0.3} />
        <StatCard title="Overdue" value={stats?.overdueTasks || 0} icon={Clock} colorClass="bg-red-500 text-red-400" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-panel p-6 rounded-3xl"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
            Recent Activity
          </h2>
          <div className="space-y-4">
            {stats?.recentActivities?.length > 0 ? stats.recentActivities.map((activity: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="text-white font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-400">{activity.project?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    activity.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    activity.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">No recent activity found.</p>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center"
        >
           <div className="w-32 h-32 rounded-full border-8 border-white/10 border-t-blue-500 flex items-center justify-center glow-effect mb-6 relative">
              <div className="text-2xl font-bold text-white">
                {stats?.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </div>
           </div>
           <h3 className="text-lg font-semibold text-white">Overall Progress</h3>
           <p className="text-sm text-gray-400 mt-2">Keep up the good work! You are making great progress today.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
