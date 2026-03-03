import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';

const STATUS_OPTS = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
type AttStatus = typeof STATUS_OPTS[number];

const statusColor: Record<AttStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ABSENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  EXCUSED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function AttendancePage() {
  const qc = useQueryClient();
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<Record<string, AttStatus>>({});

  const { data: groups } = useQuery({
    queryKey: ['groups-list'],
    queryFn: () => api.get('/groups').then(extractData),
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', groupId, date],
    queryFn: () => api.get(`/attendance/group/${groupId}`, { params: { date } }).then(extractData),
    enabled: !!groupId,
    onSuccess: (data: any) => {
      const map: Record<string, AttStatus> = {};
      (data || []).forEach((r: any) => { map[r.studentId] = r.status; });
      setRecords(map);
    },
  });

  const { data: groupDetail } = useQuery({
    queryKey: ['group-students', groupId],
    queryFn: () => api.get(`/groups/${groupId}`).then(extractData),
    enabled: !!groupId,
  });

  const saveMutation = useMutation({
    mutationFn: () => api.post('/attendance', {
      groupId, date,
      records: Object.entries(records).map(([studentId, status]) => ({ studentId, status })),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance'] }); toast.success('Asistencia guardada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al guardar'),
  });

  const students = (groupDetail?.students || []).filter((sg: any) => sg.isActive).map((sg: any) => sg.student);

  const toggle = (studentId: string) => {
    setRecords(prev => {
      const cur = prev[studentId] || 'PRESENT';
      const idx = STATUS_OPTS.indexOf(cur as AttStatus);
      const next = STATUS_OPTS[(idx + 1) % STATUS_OPTS.length];
      return { ...prev, [studentId]: next };
    });
  };

  const setAll = (status: AttStatus) => {
    const map: Record<string, AttStatus> = {};
    students.forEach((s: any) => { map[s.id] = status; });
    setRecords(map);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Asistencia</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registrar asistencia por grupo y fecha</p>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="label">Grupo</label>
            <select className="input" value={groupId} onChange={e => setGroupId(e.target.value)}>
              <option value="">Seleccionar grupo...</option>
              {(groups?.data || groups || []).map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Fecha</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
      </div>

      {groupId && (
        <div className="card">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{students.length} alumnos</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setAll('PRESENT')} className="btn-secondary text-xs px-3 py-1.5 text-green-600">
                <CheckCircle size={13} />Todos presentes
              </button>
              <button onClick={() => setAll('ABSENT')} className="btn-secondary text-xs px-3 py-1.5 text-red-500">
                <XCircle size={13} />Todos ausentes
              </button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !students.length} className="btn-primary text-xs px-3 py-1.5">
                {saveMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Guardar
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.map((s: any) => {
                const status = (records[s.id] || 'PRESENT') as AttStatus;
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.firstName} {s.lastName}</span>
                    </div>
                    <button onClick={() => toggle(s.id)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusColor[status]}`}>
                      {status}
                    </button>
                  </div>
                );
              })}
              {!students.length && <p className="text-center text-gray-400 py-10 text-sm">No hay alumnos en este grupo</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
