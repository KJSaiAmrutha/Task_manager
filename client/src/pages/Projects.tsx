import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Users, Calendar, Trash2 } from 'lucide-react';
import api from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p: any) => p.id !== id));
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">Manage your team's initiatives</p>
        </div>
        {isAdmin && (
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all">
            <Plus size={20} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project: any, index: number) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={project.id}
              className="glass-panel p-6 rounded-3xl relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <FolderKanban size={24} />
                </div>
                {isAdmin && (
                  <button onClick={() => deleteProject(project.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-6 line-clamp-2">{project.description || 'No description provided.'}</p>

              <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{project.members?.length || 0} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">No projects found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
