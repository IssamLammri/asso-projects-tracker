import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import ProjectCard from '../components/ProjectCard';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects');
        return res.json();
      })
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <section className="text-center max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-6">
          Soutenez les projets de notre mosquée
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Découvrez nos initiatives en cours et participez à l'amélioration de notre lieu de culte et de vie communautaire. Chaque don compte.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        {projects.length === 0 && (
          <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            Aucun projet en cours pour le moment.
          </div>
        )}
      </section>
    </motion.div>
  );
}
