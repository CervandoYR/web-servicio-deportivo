import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';
import Modal from '../../components/ui/Modal';

export default function TrainersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', speciality: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['trainers', search],
    queryFn: () => api.get('/trainers', { params: { search } }).then(extractData),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/trainers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trainers'] }); toast.success('Entrenador creado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/trainers/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trainers'] }); toast.success('Entrenador actualizado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trainers/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trainers'] }); toast.success('Eliminado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const openCreate = () => { setForm({ name: '', email: '', phone: '', speciality: '' }); setSelected(null); setModal('create'); };
  const openEdit = (t: any) => { setForm({ name: t.name, email: t.email || '', phone: t.phone || '', speciality: t.specialty || '' }); setSelected(t); setModal('edit'); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === 'create') createMutation.mutate(form);
    else updateMutation.mutate({ id: selected.id, ...form });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Entrenadores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} entrenadores</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} />Nuevo entrenador</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
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
                  <th className="table-header">Email</th>
                  <th className="table-header">Teléfono</th>
                  <th className="table-header">Especialidad</th>
                  <th className="table-header">Grupos</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data?.data || []).map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell font-medium">{t.name}</td>
                    <td className="table-cell text-gray-500">{t.email || '—'}</td>
                    <td className="table-cell text-gray-500">{t.phone || '—'}</td>
                    <td className="table-cell">{t.specialty ? <span className="badge badge-blue">{t.specialty}</span> : '—'}</td>
                    <td className="table-cell">{t._count?.groups ?? 0}</td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => { if (confirm('¿Eliminar entrenador?')) deleteMutation.mutate(t.id); }} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && <tr><td colSpan={6} className="table-cell text-center text-gray-400 py-10">No se encontraron entrenadores</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nuevo entrenador' : 'Editar entrenador'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Nombre *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Teléfono</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label">Especialidad</label><input className="input" value={form.speciality} onChange={e => setForm(f => ({ ...f, speciality: e.target.value }))} placeholder="Fútbol, Natación..." /></div>
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
