import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Send, Trash2, Loader2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';
import Modal from '../../components/ui/Modal';

const statusBadge: Record<string, string> = {
  DRAFT: 'badge-gray', SCHEDULED: 'badge-yellow', SENT: 'badge-green', FAILED: 'badge-red',
};

export default function CampaignsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', body: '', segment: 'ALL' });

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(extractData),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post('/campaigns', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaña creada'); setModal(false); setForm({ name: '', subject: '', body: '', segment: 'ALL' }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/campaigns/${id}/send`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaña enviada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al enviar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Eliminada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Campañas de Email</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} campañas</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} />Nueva campaña</button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
      ) : (
        <div className="grid gap-4">
          {(data?.data || []).map((c: any) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Megaphone size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{c.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{c.subject}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Segmento: {c.segment}</span>
                      {c.sentAt && <span>Enviada: {new Date(c.sentAt).toLocaleDateString('es')}</span>}
                      {c.logs?.length > 0 && <span>{c.logs.length} destinatarios</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge ${statusBadge[c.status] || 'badge-gray'}`}>{c.status}</span>
                  {c.status === 'DRAFT' && (
                    <button onClick={() => { if (confirm('¿Enviar campaña ahora?')) sendMutation.mutate(c.id); }}
                      disabled={sendMutation.isPending}
                      className="btn-primary text-xs px-3 py-1.5">
                      {sendMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      Enviar
                    </button>
                  )}
                  {c.status === 'DRAFT' && (
                    <button onClick={() => { if (confirm('¿Eliminar campaña?')) deleteMutation.mutate(c.id); }}
                      className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!(data?.data || []).length && (
            <div className="card p-12 text-center">
              <Megaphone size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400">No hay campañas creadas</p>
              <button onClick={() => setModal(true)} className="btn-primary mt-4 mx-auto"><Plus size={15} />Crear primera campaña</button>
            </div>
          )}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Nueva campaña" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="label">Nombre de la campaña *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
          <div><label className="label">Asunto del email *</label><input className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required /></div>
          <div>
            <label className="label">Segmento</label>
            <select className="input" value={form.segment} onChange={e => setForm(f => ({ ...f, segment: e.target.value }))}>
              <option value="ALL">Todos los alumnos activos</option>
              <option value="ACTIVE">Solo alumnos activos</option>
              <option value="OVERDUE">Con pagos vencidos</option>
              <option value="LEADS">Leads / Prospectos</option>
            </select>
          </div>
          <div>
            <label className="label">Contenido del email *</label>
            <textarea className="input resize-none font-mono text-sm" rows={6} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Escribe el contenido del email..." required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Crear campaña'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
