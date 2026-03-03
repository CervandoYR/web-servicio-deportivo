import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Users, Clock, UserPlus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';
import Modal from '../../components/ui/Modal';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [addModal, setAddModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.get(`/groups/${id}`).then(extractData),
  });

  const { data: allStudents } = useQuery({
    queryKey: ['students-picker', studentSearch],
    queryFn: () => api.get('/students', { params: { search: studentSearch, limit: 50 } }).then(extractData),
    enabled: addModal,
  });

  const assignMutation = useMutation({
    mutationFn: (studentId: string) => api.post(`/students/${studentId}/group`, { groupId: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['group', id] });
      toast.success('Alumno agregado al grupo');
      setAddModal(false);
      setSelectedStudentId('');
      setStudentSearch('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al agregar alumno'),
  });

  const removeMutation = useMutation({
    mutationFn: (studentId: string) => api.delete(`/students/${studentId}/group/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['group', id] }); toast.success('Alumno removido del grupo'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-gray-400" size={28} /></div>;
  if (!group) return <div className="text-center py-24 text-gray-400">Grupo no encontrado</div>;

  const activeStudents = (group.students || []).filter((sg: any) => sg.isActive);
  const studentCount = activeStudents.length;
  const pct = group.capacity > 0 ? (studentCount / group.capacity) * 100 : 0;

  const assignedIds = new Set(activeStudents.map((sg: any) => sg.student?.id));
  const availableStudents = (allStudents?.data || []).filter((s: any) => !assignedIds.has(s.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/groups" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{group.name}</h1>
          <p className="text-sm text-gray-500">{group.sportType || 'Grupo'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Información</h2>
          <div className="space-y-3 text-sm">
            {group.sportType && <div className="flex justify-between"><span className="text-gray-400">Deporte</span><span className="badge badge-blue">{group.sportType}</span></div>}
            <div className="flex justify-between"><span className="text-gray-400">Entrenador</span><span className="text-gray-900 dark:text-gray-100">{group.trainer?.name || '—'}</span></div>
            {group.schedule && (
              <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{group.schedule}</span>
              </div>
            )}
            {group.schedules?.length > 0 && (
              <div className="space-y-1">
                {group.schedules.map((s: any, i: number) => {
                  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
                  return (
                    <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={12} className="flex-shrink-0" />
                      <span className="text-xs">{days[s.dayOfWeek]} {s.startTime}–{s.endTime}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500">Ocupación</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{studentCount}/{group.capacity}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alumnos ({studentCount}/{group.capacity})</h2>
            </div>
            <button onClick={() => setAddModal(true)} disabled={studentCount >= group.capacity} className="btn-primary text-xs" title={studentCount >= group.capacity ? 'Grupo lleno' : ''}>
              <UserPlus size={14} />Agregar alumno
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="table-header">Alumno</th>
                  <th className="table-header">Email / Teléfono</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {activeStudents.map((sg: any) => (
                  <tr key={sg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell font-medium">
                      <Link to={`/admin/students/${sg.student?.id}`} className="text-blue-600 hover:underline">
                        {sg.student?.firstName} {sg.student?.lastName}
                      </Link>
                    </td>
                    <td className="table-cell text-gray-500 text-xs">
                      <div>{sg.student?.parentEmail || '—'}</div>
                      {sg.student?.parentPhone && <div>{sg.student.parentPhone}</div>}
                    </td>
                    <td className="table-cell"><span className={`badge ${sg.student?.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>{sg.student?.status}</span></td>
                    <td className="table-cell text-right">
                      <button onClick={() => { if (confirm('¿Remover alumno del grupo?')) removeMutation.mutate(sg.student?.id); }}
                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Remover del grupo">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!activeStudents.length && (
                  <tr><td colSpan={4} className="table-cell text-center text-gray-400 py-10">No hay alumnos en este grupo</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={addModal} onClose={() => { setAddModal(false); setSelectedStudentId(''); setStudentSearch(''); }} title="Agregar alumno al grupo">
        <div className="space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 text-sm" placeholder="Buscar alumno..." value={studentSearch} onChange={e => { setStudentSearch(e.target.value); setSelectedStudentId(''); }} />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
            {availableStudents.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">{studentSearch ? 'Sin resultados' : 'Todos los alumnos ya están en el grupo'}</p>
            )}
            {availableStudents.map((s: any) => (
              <button key={s.id} type="button" onClick={() => setSelectedStudentId(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedStudentId === s.id ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                  {s.firstName[0]}{s.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{s.firstName} {s.lastName}</p>
                  {s.parentEmail && <p className="text-xs text-gray-400 truncate">{s.parentEmail}</p>}
                </div>
                {s.groups?.some((sg: any) => sg.isActive) && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">En otro grupo</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => { setAddModal(false); setSelectedStudentId(''); setStudentSearch(''); }} className="btn-secondary">Cancelar</button>
            <button onClick={() => selectedStudentId && assignMutation.mutate(selectedStudentId)} disabled={!selectedStudentId || assignMutation.isPending} className="btn-primary">
              {assignMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Agregar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
