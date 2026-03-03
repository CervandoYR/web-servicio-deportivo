import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, UserCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';
import Modal from '../../components/ui/Modal';

const statusBadge: Record<string, string> = {
  NEW: 'badge-blue', CONTACTED: 'badge-yellow', CONVERTED: 'badge-green', LOST: 'badge-gray',
};

export default function LeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', sportInterest: '', source: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['leads', search, status],
    queryFn: () => api.get('/leads', { params: { search, status: status || undefined } }).then(extractData),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/leads', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead creado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/leads/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Actualizado'); setModal(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Eliminado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/leads/${id}/convert`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead convertido a alumno'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const openCreate = () => { setForm({ name: '', email: '', phone: '', sportInterest: '', source: '', notes: '' }); setSelected(null); setModal('create'); };
  const openEdit = (l: any) => { setForm({ name: l.name, email: l.email || '', phone: l.phone || '', sportInterest: l.sportInterest || '', source: l.source || '', notes: l.notes || '' }); setSelected(l); setModal('edit'); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (!form.phone.trim()) { toast.error('El teléfono es obligatorio'); return; }
    if (modal === 'create') createMutation.mutate(form);
    else updateMutation.mutate({ id: selected.id, ...form });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Leads / Prospectos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} leads</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} />Nuevo lead</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto text-sm" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos</option>
            <option value="NEW">Nuevo</option>
            <option value="CONTACTED">Contactado</option>
            <option value="CONVERTED">Convertido</option>
            <option value="LOST">Perdido</option>
          </select>
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
                  <th className="table-header">Deporte</th>
                  <th className="table-header">Fuente</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data?.data || []).map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell font-medium">{l.name}</td>
                    <td className="table-cell text-gray-500">{l.email || '—'}</td>
                    <td className="table-cell text-gray-500">{l.phone || '—'}</td>
                    <td className="table-cell">{l.sportInterest || '—'}</td>
                    <td className="table-cell text-gray-500">{l.source || '—'}</td>
                    <td className="table-cell"><span className={`badge ${statusBadge[l.status] || 'badge-gray'}`}>{l.status}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        {l.status !== 'CONVERTED' && (
                          <button onClick={() => { if (confirm('¿Convertir a alumno?')) convertMutation.mutate(l.id); }}
                            className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Convertir a alumno">
                            <UserCheck size={15} />
                          </button>
                        )}
                        <button onClick={() => openEdit(l)} className="p-1.5 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => { if (confirm('¿Eliminar lead?')) deleteMutation.mutate(l.id); }} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && <tr><td colSpan={7} className="table-cell text-center text-gray-400 py-10">No se encontraron leads</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nuevo lead' : 'Editar lead'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Nombre *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="label">Teléfono *</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Deporte de interés</label><input className="input" value={form.sportInterest} onChange={e => setForm(f => ({ ...f, sportInterest: e.target.value }))} /></div>
            <div><label className="label">Fuente</label><input className="input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Web, Referido..." /></div>
          </div>
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
