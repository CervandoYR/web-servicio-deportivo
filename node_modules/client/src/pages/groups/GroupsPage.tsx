import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Eye, Loader2, Users2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api, extractData } from '../../lib/api';
import Modal from '../../components/ui/Modal';

export default function GroupsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', sportType: '', capacity: 20, schedule: '', trainerId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['groups', search],
    queryFn: () => api.get('/groups', { params: { search } }).then(extractData),
  });

  const { data: trainers } = useQuery({
    queryKey: ['trainers-list'],
    queryFn: () => api.get('/trainers').then(extractData),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/groups', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); toast.success('Grupo creado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/groups/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); toast.success('Grupo actualizado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/groups/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['groups'] }); toast.success('Eliminado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const openCreate = () => { setForm({ name: '', sportType: '', capacity: 20, schedule: '', trainerId: '' }); setSelected(null); setModal('create'); };
  const openEdit = (g: any) => { setForm({ name: g.name, sportType: g.sportType || '', capacity: g.capacity, schedule: g.schedule || '', trainerId: g.trainerId || '' }); setSelected(g); setModal('edit'); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('El nombre del grupo es obligatorio'); return; }
    if (!form.sportType.trim()) { toast.error('El tipo de deporte es obligatorio'); return; }
    const payload = { ...form, capacity: Number(form.capacity), trainerId: form.trainerId || undefined };
    if (modal === 'create') createMutation.mutate(payload);
    else updateMutation.mutate({ id: selected.id, ...payload });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Grupos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} grupos</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} />Nuevo grupo</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar grupos..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="table-header">Nombre</th>
                  <th className="table-header">Deporte</th>
                  <th className="table-header">Entrenador</th>
                  <th className="table-header">Alumnos / Cap.</th>
                  <th className="table-header">Horario</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data?.data || []).map((g: any) => {
                  const count = g._count?.students ?? 0;
                  const pct = g.capacity > 0 ? (count / g.capacity) * 100 : 0;
                  return (
                    <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="table-cell font-medium">{g.name}</td>
                      <td className="table-cell">{g.sportType ? <span className="badge badge-blue">{g.sportType}</span> : '—'}</td>
                      <td className="table-cell text-gray-500">{g.trainer?.name || '—'}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{count}/{g.capacity}</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-gray-500 text-xs">{g.schedule || '—'}</td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/groups/${g.id}`} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Eye size={15} /></Link>
                          <button onClick={() => openEdit(g)} className="p-1.5 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => { if (confirm('¿Eliminar grupo?')) deleteMutation.mutate(g.id); }} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!data?.data?.length && <tr><td colSpan={6} className="table-cell text-center text-gray-400 py-10">No se encontraron grupos</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nuevo grupo' : 'Editar grupo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Nombre *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Deporte *</label><input className="input" value={form.sportType} onChange={e => setForm(f => ({ ...f, sportType: e.target.value }))} placeholder="Fútbol..." required /></div>
            <div><label className="label">Capacidad</label><input type="number" min={1} max={200} className="input" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} /></div>
          </div>
          <div><label className="label">Entrenador</label>
            <select className="input" value={form.trainerId} onChange={e => setForm(f => ({ ...f, trainerId: e.target.value }))}>
              <option value="">Sin asignar</option>
              {(trainers?.data || trainers || []).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div><label className="label">Horario</label><input className="input" value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} placeholder="Lun/Mié/Vie 18:00-19:30" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={15} className="animate-spin" /> : (modal === 'create' ? 'Crear' : 'Guardar')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
