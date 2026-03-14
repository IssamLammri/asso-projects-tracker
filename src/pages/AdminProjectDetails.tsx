import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, FileText, Image as ImageIcon, X, Edit2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function AdminProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [editProject, setEditProject] = useState({ title: '', description: '', goal_amount: '', start_date: '', status: '' });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${id}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setProject(data);
      setEditProject({
        title: data.title,
        description: data.description || '',
        goal_amount: data.goal_amount.toString(),
        start_date: data.start_date.split('T')[0],
        status: data.status
      });
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    let body: any;
    let headers: any = {
      'Authorization': `Bearer ${token}`
    };

    if (editImageFile) {
      const formData = new FormData();
      formData.append('title', editProject.title);
      formData.append('description', editProject.description);
      formData.append('goal_amount', editProject.goal_amount);
      formData.append('start_date', editProject.start_date);
      formData.append('status', editProject.status);
      formData.append('image', editImageFile);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(editProject);
    }

    const res = await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers,
      body
    });

    if (res.ok) {
      setIsEditModalOpen(false);
      setEditImageFile(null);
      fetchProject();
    } else {
      console.error('Failed to edit project:', await res.text());
      alert('Erreur lors de la modification du projet.');
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    let body: any;
    let headers: any = {
      'Authorization': `Bearer ${token}`
    };

    if (updateFile) {
      const formData = new FormData();
      formData.append('project_id', id || '');
      formData.append('title', newUpdate.title);
      formData.append('content', newUpdate.content);
      formData.append('attachment', updateFile);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        project_id: id,
        title: newUpdate.title,
        content: newUpdate.content
      });
    }

    const res = await fetch('/api/admin/project-news', {
      method: 'POST',
      headers,
      body
    });

    if (res.ok) {
      setIsUpdateModalOpen(false);
      setNewUpdate({ title: '', content: '' });
      setUpdateFile(null);
      fetchProject();
    } else {
      console.error('Failed to create update:', await res.text());
      alert('Erreur lors de la création du bloc d\'information.');
    }
  };

  const handleDeleteUpdate = async (updateId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bloc d'information ?")) return;
    
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`/api/admin/project-news/${updateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      fetchProject();
    }
  };

  if (!project) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Retour aux projets
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{project.title}</h2>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-slate-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                title="Modifier le projet"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mt-2">Gestion des informations et blocs</p>
          </div>
          <button 
            onClick={() => setIsUpdateModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Ajouter un bloc d'info
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {project.updates?.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-500 border border-slate-100 shadow-sm">
            Aucun bloc d'information pour le moment. Ajoutez-en un pour informer les fidèles de l'avancement, des devis, etc.
          </div>
        ) : (
          project.updates?.map((update: any) => (
            <div key={update.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative group">
              <button 
                onClick={() => handleDeleteUpdate(update.id)}
                className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{update.title}</h3>
              <p className="text-slate-600 whitespace-pre-wrap mb-4">{update.content}</p>
              
              {update.attachment_path && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {update.attachment_type?.startsWith('image/') ? (
                    <img src={update.attachment_path} alt="Pièce jointe" className="max-h-64 rounded-xl object-cover" />
                  ) : (
                    <a href={update.attachment_path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-4 py-2 rounded-lg transition-colors">
                      <FileText className="w-5 h-5" />
                      Voir le document joint
                    </a>
                  )}
                </div>
              )}
              <div className="mt-4 text-xs text-slate-400">
                Ajouté le {formatDate(update.created_at)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Nouveau bloc d'information</h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre (ex: Devis, Avancement...)</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={newUpdate.title}
                  onChange={e => setNewUpdate({...newUpdate, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contenu / Description</label>
                <textarea 
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={newUpdate.content}
                  onChange={e => setNewUpdate({...newUpdate, content: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pièce jointe (Image ou PDF) - Optionnel</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onChange={e => setUpdateFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Modifier le projet</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre du projet</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editProject.title}
                  onChange={e => setEditProject({...editProject, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editProject.description}
                  onChange={e => setEditProject({...editProject, description: e.target.value})}
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
                    value={editProject.goal_amount}
                    onChange={e => setEditProject({...editProject, goal_amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={editProject.start_date}
                    onChange={e => setEditProject({...editProject, start_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={editProject.status}
                    onChange={e => setEditProject({...editProject, status: e.target.value})}
                  >
                    <option value="en cours">En cours</option>
                    <option value="terminé">Terminé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nouvelle Image (Optionnel)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    onChange={e => setEditImageFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
