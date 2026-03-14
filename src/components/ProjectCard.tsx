import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { formatCurrency } from '../utils/formatters';

interface ProjectCardProps {
  key?: React.Key;
  project: {
    id: number;
    title: string;
    image: string | null;
    goal_amount: number;
    total_collected: number;
    status: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const percentage = (project.total_collected / project.goal_amount) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="aspect-video w-full bg-slate-100 relative">
        {project.image ? (
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            Pas d'image
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            project.status === 'terminé' ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {project.status}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">{project.title}</h3>
        
        <div className="mt-auto space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-emerald-600">{formatCurrency(project.total_collected)}</span>
              <span className="text-slate-500">Objectif: {formatCurrency(project.goal_amount)}</span>
            </div>
            <ProgressBar current={project.total_collected} total={project.goal_amount} size="md" />
            <div className="text-right text-xs text-slate-500 mt-1">
              {percentage.toFixed(1)}%
            </div>
          </div>
          
          <Link 
            to={`/projects/${project.id}`}
            className="block w-full text-center py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-medium rounded-xl transition-colors border border-slate-200"
          >
            Voir les détails
          </Link>
        </div>
      </div>
    </div>
  );
}
