import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';

const statusBadge: Record<string, string> = {
  PAID: 'badge-green', PENDING: 'badge-yellow', OVERDUE: 'badge-red',
};

export default function PaymentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payments', search, status, page],
    queryFn: () => api.get('/payments', { params: { search, status: status || undefined, page, limit: 20 } }).then(extractData),
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => api.put(`/payments/${id}/pay`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); toast.success('Marcado como pagado'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post('/payments/generate'),
    onSuccess: (res: any) => { qc.invalidateQueries({ queryKey: ['payments'] }); toast.success(`${res.data?.data?.count || 0} pagos generados`); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error al generar'),
  });

  const overduesMutation = useMutation({
    mutationFn: () => api.put('/payments/overdue'),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); toast.success('Pagos vencidos actualizados'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pagos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} registros</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => overduesMutation.mutate()} disabled={overduesMutation.isPending} className="btn-secondary text-sm">
            {overduesMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
            Actualizar vencidos
          </button>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn-primary text-sm">
            {generateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Generar mensual
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-8 text-sm" placeholder="Buscar alumno..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-auto text-sm" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PAID">Pagado</option>
            <option value="OVERDUE">Vencido</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={24} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="table-header">Alumno</th>
                  <th className="table-header">Período</th>
                  <th className="table-header">Monto</th>
                  <th className="table-header">Vencimiento</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Pagado el</th>
                  <th className="table-header text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data?.data || []).map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="table-cell font-medium">{p.student?.firstName} {p.student?.lastName}</td>
                    <td className="table-cell text-gray-500">{p.month}/{p.year}</td>
                    <td className="table-cell font-semibold">${Number(p.amount).toLocaleString()}</td>
                    <td className="table-cell text-gray-500">{p.dueDate ? new Date(p.dueDate).toLocaleDateString('es') : '—'}</td>
                    <td className="table-cell"><span className={`badge ${statusBadge[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                    <td className="table-cell text-gray-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString('es') : '—'}</td>
                    <td className="table-cell text-right">
                      {p.status !== 'PAID' && (
                        <button onClick={() => markPaidMutation.mutate(p.id)} disabled={markPaidMutation.isPending}
                          className="p-1.5 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                          <CheckCircle size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && <tr><td colSpan={7} className="table-cell text-center text-gray-400 py-10">Sin resultados</td></tr>}
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
    </div>
  );
}
