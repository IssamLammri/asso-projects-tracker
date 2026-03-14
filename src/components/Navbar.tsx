import { Link } from 'react-router-dom';
import { MoonStar } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <MoonStar className="h-8 w-8 text-emerald-600" />
              <span className="font-bold text-xl text-slate-900 tracking-tight">Mosquée Projets</span>
            </Link>
          </div>
          <div className="flex items-center">
            <Link to="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900">
              Administration
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
