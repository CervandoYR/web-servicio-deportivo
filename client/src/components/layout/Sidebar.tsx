import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Users2, CalendarCheck,
  CreditCard, UserPlus, Megaphone, Globe, Settings,
  ChevronLeft, ChevronRight, Trophy, LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { clsx } from 'clsx';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Alumnos', icon: Users },
  { to: '/admin/trainers', label: 'Entrenadores', icon: UserCheck },
  { to: '/admin/groups', label: 'Grupos', icon: Users2 },
  { to: '/admin/attendance', label: 'Asistencia', icon: CalendarCheck },
  { to: '/admin/payments', label: 'Pagos', icon: CreditCard },
  { to: '/admin/leads', label: 'Leads', icon: UserPlus },
  { to: '/admin/campaigns', label: 'Campañas', icon: Megaphone },
  { to: '/admin/landing', label: 'Landing Page', icon: Globe },
  { to: '/admin/settings', label: 'Configuración', icon: Settings },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  const { academy, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={clsx(
      'flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out flex-shrink-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Trophy size={16} className="text-white" />
            </div>
            <span className="font-bold text-sm truncate">{academy?.name || 'Academia'}</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mx-auto">
            <Trophy size={16} className="text-white" />
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="text-gray-400 hover:text-white transition-colors ml-2 flex-shrink-0">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={onToggle} className="flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors border-b border-gray-700/50">
          <ChevronRight size={18} />
        </button>
      )}

      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto px-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150"
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
