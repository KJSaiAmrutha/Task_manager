import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckSquare, Clock, Trash2, Edit2 } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'MEDIUM': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'LOW': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400';
      case 'IN_PROGRESS': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      setTasks(tasks.map((t: any) => t.id === id ? { ...t, status: newStatus } : t) as any);
      toast.success('Task status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-gray-400">Track and manage your work</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all">
          <Plus size={20} />
          New Task
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 text-sm">
                  <th className="p-4 font-medium">Task</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Deadline</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task: any, index: number) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={task.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/5 ${getStatusColor(task.status)}`}>
                          <CheckSquare size={18} />
                        </div>
                        <div>
                          <p className={`font-medium ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-white'}`}>{task.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{task.project?.name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className={`bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none cursor-pointer ${getStatusColor(task.status)}`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-gray-400 flex items-center gap-2">
                      <Clock size={16} />
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-gray-500 hover:text-blue-400 transition-colors p-2">
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {tasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">No tasks found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
