import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, Users2, CreditCard, UserPlus, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import { api, extractData } from '../../lib/api';

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(extractData),
  });

  const { data: revenue } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: () => api.get('/dashboard/revenue').then(extractData),
  });

  const { data: occupancy } = useQuery({
    queryKey: ['dashboard-occupancy'],
    queryFn: () => api.get('/dashboard/occupancy').then(extractData),
  });

  const { data: activity } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: () => api.get('/dashboard/activity').then(extractData),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Resumen general de la academia</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Alumnos activos" value={stats?.activeStudents ?? '—'} icon={Users} color="blue"
          trend={stats ? { value: 5, label: 'este mes' } : undefined} loading={loadingStats} />
        <StatCard title="Entrenadores" value={stats?.totalTrainers ?? '—'} icon={UserCheck} color="green" loading={loadingStats} />
        <StatCard title="Grupos activos" value={stats?.totalGroups ?? '—'} icon={Users2} color="purple" loading={loadingStats} />
        <StatCard title="Ingresos del mes" value={stats ? `$${stats.monthlyRevenue.toLocaleString()}` : '—'} icon={CreditCard} color="green"
          trend={stats ? { value: stats.revenueGrowth, label: 'vs mes anterior' } : undefined} loading={loadingStats} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Leads nuevos" value={stats?.newLeads ?? '—'} icon={UserPlus} color="yellow" loading={loadingStats} />
        <StatCard title="Pagos pendientes" value={stats?.pendingPayments ?? '—'} icon={TrendingUp} color="blue" loading={loadingStats} />
        <StatCard title="Pagos vencidos" value={stats?.overduePayments ?? '—'} icon={AlertCircle} color="red" loading={loadingStats} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Ingresos últimos 12 meses</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Ingresos']} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Ocupación por grupo</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={(occupancy || []).map((g: any) => ({
              name: g.name,
              alumnos: g._count?.students || 0,
              capacidad: g.capacity,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="alumnos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacidad" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Alumnos recientes</h2>
          <div className="space-y-2">
            {(activity?.recentStudents || []).map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('es')}</p>
                </div>
              </div>
            ))}
            {!activity?.recentStudents?.length && <p className="text-sm text-gray-400 py-4 text-center">Sin datos</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Últimos pagos</h2>
          <div className="space-y-2">
            {(activity?.recentPayments || []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.student?.firstName} {p.student?.lastName}</p>
                  <p className="text-xs text-gray-400">{new Date(p.paidAt).toLocaleDateString('es')}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">${Number(p.amount).toLocaleString()}</span>
              </div>
            ))}
            {!activity?.recentPayments?.length && <p className="text-sm text-gray-400 py-4 text-center">Sin datos</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
