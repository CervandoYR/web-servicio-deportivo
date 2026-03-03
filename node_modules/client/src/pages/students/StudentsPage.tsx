import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';
import Modal from '../../components/ui/Modal';
import { Link } from 'react-router-dom';

const statusBadge: Record<string, string> = {
  ACTIVE: 'badge-green', INACTIVE: 'badge-gray', SUSPENDED: 'badge-red',
};

export default function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', parentEmail: '', parentPhone: '', birthDate: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn: () => api.get('/students', { params: { search, page, limit: 15 } }).then(extractData),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/students', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Alumno creado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al crear alumno'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/students/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Alumno actualizado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Alumno eliminado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al eliminar'),
  });

  const openCreate = () => {
    setForm({ firstName: '', lastName: '', parentEmail: '', parentPhone: '', birthDate: '', notes: '' });
    setSelected(null);
    setModal('create');
  };

  const openEdit = (s: any) => {
    setForm({ firstName: s.firstName, lastName: s.lastName, parentEmail: s.parentEmail || '', parentPhone: s.parentPhone || '', birthDate: s.birthDate ? s.birthDate.slice(0, 10) : '', notes: s.notes || '' });
    setSelected(s);
    setModal('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (!form.lastName.trim()) { toast.error('El apellido es obligatorio'); return; }
    if (!form.birthDate) { toast.error('La fecha de nacimiento es obligatoria'); return; }
    const payload = { ...form, birthDate: new Date(form.birthDate).toISOString() };
    if (modal === 'create') createMutation.mutate(payload);
    else updateMutation.mutate({ id: selected.id, ...payload });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Alumnos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} alumnos registrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} />Nuevo alumno</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar alumnos..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
                  <th className="table-header">Email padre/madre</th>
                  <th className="table-header">Teléfono</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Grupos</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data?.data || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell font-medium">{s.firstName} {s.lastName}</td>
                    <td className="table-cell text-gray-500">{s.parentEmail || '—'}</td>
                    <td className="table-cell text-gray-500">{s.parentPhone || '—'}</td>
                    <td className="table-cell"><span className={statusBadge[s.status] || 'badge-gray'}>{s.status}</span></td>
                    <td className="table-cell">{s.groups?.length ?? 0}</td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/students/${s.id}`} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Eye size={15} /></Link>
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => { if (confirm('¿Eliminar alumno?')) deleteMutation.mutate(s.id); }} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && <tr><td colSpan={6} className="table-cell text-center text-gray-400 py-10">No se encontraron alumnos</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Página {page} de {data.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs px-3 py-1.5">Anterior</button>
              <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn-secondary text-xs px-3 py-1.5">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nuevo alumno' : 'Editar alumno'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Nombre *</label><input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required /></div>
            <div><label className="label">Apellido *</label><input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required /></div>
          </div>
          <div><label className="label">Email (padre/madre)</label><input type="email" className="input" value={form.parentEmail} onChange={e => setForm(f => ({ ...f, parentEmail: e.target.value }))} /></div>
          <div><label className="label">Teléfono</label><input className="input" value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} /></div>
          <div><label className="label">Fecha de nacimiento *</label><input type="date" className="input" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} required /></div>
          <div><label className="label">Notas</label><textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
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
