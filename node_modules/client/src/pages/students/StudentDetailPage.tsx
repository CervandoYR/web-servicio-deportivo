import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, CalendarCheck, CreditCard, Users2 } from 'lucide-react';
import { api, extractData } from '../../lib/api';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => api.get(`/students/${id}`).then(extractData),
  });

  const { data: attendance } = useQuery({
    queryKey: ['student-attendance', id],
    queryFn: () => api.get(`/attendance/student/${id}`).then(extractData),
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ['student-payments', id],
    queryFn: () => api.get('/payments', { params: { studentId: id, limit: 12 } }).then(extractData),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-gray-400" size={28} /></div>;
  if (!student) return <div className="text-center py-24 text-gray-400">Alumno no encontrado</div>;

  const paymentStatusBadge: Record<string, string> = { PAID: 'badge-green', PENDING: 'badge-yellow', OVERDUE: 'badge-red' };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/students" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</h1>
          <p className="text-sm text-gray-500">Perfil del alumno</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xl font-bold">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{student.firstName} {student.lastName}</p>
              <span className={`badge ${student.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{student.status}</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {student.parentEmail && <div><span className="text-gray-400">Email: </span><span className="text-gray-700 dark:text-gray-300">{student.parentEmail}</span></div>}
            {student.parentPhone && <div><span className="text-gray-400">Tel: </span><span className="text-gray-700 dark:text-gray-300">{student.parentPhone}</span></div>}
            {student.birthDate && <div><span className="text-gray-400">Nacimiento: </span><span className="text-gray-700 dark:text-gray-300">{new Date(student.birthDate).toLocaleDateString('es')}</span></div>}
            <div><span className="text-gray-400">Registrado: </span><span className="text-gray-700 dark:text-gray-300">{new Date(student.createdAt).toLocaleDateString('es')}</span></div>
          </div>
          {student.notes && <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{student.notes}</p>}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users2 size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Grupos actuales</h2>
          </div>
          <div className="space-y-2">
            {(student.groups || []).filter((sg: any) => sg.isActive).map((sg: any) => (
              <div key={sg.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                <span className="font-medium text-gray-900 dark:text-gray-100">{sg.group?.name}</span>
                <span className="text-gray-400">{sg.group?.sportType}</span>
              </div>
            ))}
            {!student.groups?.filter((sg: any) => sg.isActive).length && <p className="text-sm text-gray-400 py-4 text-center">Sin grupos asignados</p>}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-green-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pagos recientes</h2>
          </div>
          <div className="space-y-2">
            {(payments?.data || []).slice(0, 6).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{p.month}/{p.year}</p>
                  <span className={`badge text-xs ${paymentStatusBadge[p.status] || 'badge-gray'}`}>{p.status}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">${Number(p.amount).toLocaleString()}</span>
              </div>
            ))}
            {!payments?.data?.length && <p className="text-sm text-gray-400 py-4 text-center">Sin pagos</p>}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarCheck size={16} className="text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Historial de asistencia reciente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="table-header">Fecha</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Grupo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(attendance?.data || []).slice(0, 15).map((a: any) => (
                <tr key={a.id}>
                  <td className="table-cell">{new Date(a.date).toLocaleDateString('es')}</td>
                  <td className="table-cell"><span className={`badge ${a.status === 'PRESENT' ? 'badge-green' : a.status === 'ABSENT' ? 'badge-red' : 'badge-yellow'}`}>{a.status}</span></td>
                  <td className="table-cell text-gray-500">{a.group?.name || '—'}</td>
                </tr>
              ))}
              {!attendance?.data?.length && <tr><td colSpan={3} className="table-cell text-center text-gray-400 py-8">Sin registros de asistencia</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
