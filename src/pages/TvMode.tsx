import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../utils/formatters';
import ProgressBar from '../components/ProgressBar';

export default function TvMode() {
  const [projects, setProjects] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        const activeProjects = data.filter((p: any) => p.status !== 'terminé');
        setProjects(activeProjects);
      });

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % projects.length);
    }, 15000); // Rotate every 15 seconds

    return () => clearInterval(interval);
  }, [projects.length]);

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-4xl font-bold">
        Chargement des projets...
      </div>
    );
  }

  const project = projects[currentIndex];
  const percentage = (project.total_collected / project.goal_amount) * 100;
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const projectUrl = `${appUrl}/projects/${project.id}`;

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={project.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
          className="flex-grow flex flex-col p-12"
        >
          <div className="flex justify-between items-start mb-16">
            <h1 className="text-7xl font-extrabold tracking-tight leading-tight max-w-4xl">
              {project.title}
            </h1>
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
              <QRCodeSVG value={projectUrl} size={200} />
              <span className="text-slate-900 font-bold text-xl">Scannez pour participer</span>
            </div>
          </div>

          <div className="flex-grow flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-16 mb-16">
              <div className="bg-slate-800/50 p-12 rounded-3xl border border-slate-700">
                <div className="text-3xl text-slate-400 mb-4 uppercase tracking-wider font-semibold">Objectif</div>
                <div className="text-6xl font-bold text-white">{formatCurrency(project.goal_amount)}</div>
              </div>
              <div className="bg-emerald-900/30 p-12 rounded-3xl border border-emerald-800/50">
                <div className="text-3xl text-emerald-400 mb-4 uppercase tracking-wider font-semibold">Collecté</div>
                <div className="text-7xl font-bold text-emerald-400">{formatCurrency(project.total_collected)}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between text-4xl font-bold">
                <span className="text-emerald-400">{percentage.toFixed(1)}%</span>
                <span className="text-slate-400">Reste {formatCurrency(Math.max(0, project.goal_amount - project.total_collected))}</span>
              </div>
              <ProgressBar current={project.total_collected} total={project.goal_amount} size="xl" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="p-8 bg-slate-950 flex justify-center gap-4">
        {projects.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-3 rounded-full transition-all duration-500 ${
              idx === currentIndex ? 'w-16 bg-emerald-500' : 'w-4 bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
