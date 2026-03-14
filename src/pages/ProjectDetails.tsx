import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { formatCurrency, formatDate } from '../utils/formatters';
import ProgressBar from '../components/ProgressBar';
import { FileText, Download, Calendar, User, Clock } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = () => {
      fetch(`/api/projects/${id}`, { cache: 'no-store' })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch project');
          return res.json();
        })
        .then(data => {
          setProject(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching project:', err);
          setLoading(false);
        });
    };

    fetchProject();
    const interval = setInterval(fetchProject, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [id]);

  const lineChartData = useMemo(() => {
    if (!project) return [];
    
    const groupedByDate: Record<string, number> = {};
    if (project.collections) {
      const sortedCollections = [...project.collections].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      sortedCollections.forEach((col: any) => {
        const d = col.date.split('T')[0];
        groupedByDate[d] = (groupedByDate[d] || 0) + col.amount;
      });
    }

    const data = [];
    const startDate = project.start_date.split('T')[0];
    
    if (!groupedByDate[startDate]) {
      data.push({
        date: new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        fullDate: formatDate(startDate),
        total: 0,
        objectif: project.goal_amount
      });
    }

    let cumulative = 0;
    Object.keys(groupedByDate).sort().forEach(dateStr => {
      cumulative += groupedByDate[dateStr];
      data.push({
        date: new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        fullDate: formatDate(dateStr),
        total: cumulative,
        objectif: project.goal_amount
      });
    });

    // If there are collections but the last one is not today, we could add a point for today, but let's keep it simple.
    return data;
  }, [project]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-12 text-slate-500">Projet introuvable.</div>;
  }

  const percentage = (project.total_collected / project.goal_amount) * 100;
  const remaining = Math.max(0, project.goal_amount - project.total_collected);

  const chartData = [
    { name: 'Collecté', value: project.total_collected, color: '#10b981' },
    { name: 'Restant', value: remaining, color: '#f1f5f9' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
            project.status === 'terminé' ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {project.status.toUpperCase()}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">{project.title}</h1>
          <p className="text-lg text-slate-600 whitespace-pre-wrap max-w-3xl">
            {project.description || "Aucune description fournie."}
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl mt-6 w-fit">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span>Lancé le {formatDate(project.start_date)}</span>
          </div>
        </div>
        {project.image && (
          <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm border border-slate-100 hidden md:block">
            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Progress & Pie Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-8">
            <div className="w-48 h-48 relative flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-emerald-600">{percentage.toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="mb-6">
                <div className="text-4xl sm:text-5xl font-bold text-emerald-600 mb-2">
                  {formatCurrency(project.total_collected)}
                </div>
                <div className="text-lg text-slate-500 font-medium">
                  collectés sur {formatCurrency(project.goal_amount)}
                </div>
              </div>
              <ProgressBar current={project.total_collected} total={project.goal_amount} size="lg" />
              <div className="mt-4 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">{percentage.toFixed(1)}% atteint</span>
                <span className="text-slate-500">Reste: {formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          {lineChartData.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Évolution des dons</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `${value} €`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name === 'total' ? 'Collecté' : 'Objectif']}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Collecté" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="objectif" 
                      name="Objectif" 
                      stroke="#94a3b8" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Project Updates / Info Blocks */}
          {project.updates && project.updates.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Actualités et informations</h3>
              {project.updates.map((update: any) => (
                <div key={update.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                    <Calendar className="w-4 h-4" />
                    {formatDate(update.created_at)}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{update.title}</h4>
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed mb-6">{update.content}</p>
                  
                  {update.attachment_path && (
                    <div className="mt-4 pt-6 border-t border-slate-100">
                      {update.attachment_type?.startsWith('image/') ? (
                        <img 
                          src={update.attachment_path} 
                          alt="Illustration" 
                          className="max-h-96 rounded-2xl object-cover border border-slate-100 shadow-sm" 
                        />
                      ) : (
                        <a 
                          href={update.attachment_path} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-3 text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 hover:bg-emerald-100 px-5 py-3 rounded-xl transition-colors"
                        >
                          <FileText className="w-6 h-6" />
                          Consulter le document joint
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: History & Documents */}
        <div className="space-y-8">
          {/* History */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col" style={{ maxHeight: '600px' }}>
            <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-emerald-600" />
              Historique des collectes
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {project.collections && project.collections.length > 0 ? (
                project.collections.map((col: any) => (
                  <div key={col.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-900">{col.description || 'Collecte'}</div>
                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(col.date)}
                      </div>
                    </div>
                    <div className="font-bold text-lg text-emerald-600 whitespace-nowrap ml-4 bg-emerald-50 px-3 py-1 rounded-lg">
                      +{formatCurrency(col.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                  Aucune collecte enregistrée.
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          {project.documents && project.documents.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Documents
              </h2>
              <div className="space-y-3">
                {project.documents.map((doc: any) => (
                  <a 
                    key={doc.id} 
                    href={doc.filename} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-white transition-colors">
                        <FileText className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-slate-900 truncate">{doc.original_name}</div>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 flex-shrink-0 ml-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
