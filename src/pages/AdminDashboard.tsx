import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, LogOut, LayoutDashboard, Settings, FileText, PlusCircle, Trash2, X, MoonStar } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({ title: '', description: '', goal_amount: '', start_date: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newCollection, setNewCollection] = useState({ amount: '', date: new Date().toISOString().split('T')[0], description: '', source: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    const res = await fetch('/api/projects', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    let body: any;
    let headers: any = {
      'Authorization': `Bearer ${token}`
    };

    if (imageFile) {
      const formData = new FormData();
      formData.append('title', newProject.title);
      formData.append('description', newProject.description);
      formData.append('goal_amount', newProject.goal_amount);
      formData.append('start_date', newProject.start_date);
      formData.append('image', imageFile);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(newProject);
    }

    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers,
      body
    });

    if (res.ok) {
      setIsModalOpen(false);
      setNewProject({ title: '', description: '', goal_amount: '', start_date: '' });
      setImageFile(null);
      fetchProjects();
    } else {
      console.error('Failed to create project:', await res.text());
      alert('Erreur lors de la création du projet.');
    }
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const res = await fetch('/api/admin/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        project_id: selectedProjectId,
        amount: parseFloat(newCollection.amount),
        date: newCollection.date,
        description: newCollection.description,
        source: newCollection.source
      })
    });

    if (res.ok) {
      setIsCollectionModalOpen(false);
      setNewCollection({ amount: '', date: new Date().toISOString().split('T')[0], description: '', source: '' });
      fetchProjects();
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      fetchProjects();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <MoonStar className="w-6 h-6 text-emerald-500" />
          <h1 className="text-xl font-bold tracking-tight">Admin Mosquée</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-slate-800 rounded-xl text-emerald-400 font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </Link>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors">
            <LogOut className="w-5 h-5" />
            Retour au site
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-800 rounded-xl text-red-400 transition-colors">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Projets</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nouveau projet
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-medium uppercase tracking-wider">
                  <th className="p-6">Projet</th>
                  <th className="p-6">Objectif</th>
                  <th className="p-6">Collecté</th>
                  <th className="p-6">Statut</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-slate-900">{project.title}</div>
                      <div className="text-sm text-slate-500 mt-1">{formatDate(project.start_date)}</div>
                    </td>
                    <td className="p-6 font-medium text-slate-700">{formatCurrency(project.goal_amount)}</td>
                    <td className="p-6 font-bold text-emerald-600">{formatCurrency(project.total_collected)}</td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'terminé' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {project.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-3">
                      <Link 
                        to={`/admin/projects/${project.id}`}
                        className="inline-flex text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        title="Gérer les informations et blocs"
                      >
                        <FileText className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => { setSelectedProjectId(project.id); setIsCollectionModalOpen(true); }}
                        className="text-slate-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-lg"
                        title="Ajouter une collecte"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Supprimer le projet"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {projects.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Aucun projet trouvé.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Nouveau projet</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre du projet</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Objectif (€)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={newProject.goal_amount}
                    onChange={e => setNewProject({...newProject, goal_amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={newProject.start_date}
                    onChange={e => setNewProject({...newProject, start_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image du projet</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                >
                  Créer le projet
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Collection Modal */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Ajouter une collecte</h3>
              <button onClick={() => setIsCollectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCollection} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant (€)</label>
                  <input 
                    type="number" 
                    required 
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={newCollection.amount}
                    onChange={e => setNewCollection({...newCollection, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={newCollection.date}
                    onChange={e => setNewCollection({...newCollection, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (ex: Collecte du vendredi)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={newCollection.description}
                  onChange={e => setNewCollection({...newCollection, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source (ex: Espèces, Virement)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={newCollection.source}
                  onChange={e => setNewCollection({...newCollection, source: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                >
                  Ajouter la collecte
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
