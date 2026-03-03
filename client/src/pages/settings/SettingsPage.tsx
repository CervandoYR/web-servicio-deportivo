import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, Palette, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { user, academy, setAcademy } = useAuthStore();

  const { data: academyData } = useQuery({
    queryKey: ['academy'],
    queryFn: () => api.get('/academy').then(extractData),
  });

  const [academyForm, setAcademyForm] = useState({ name: '', slug: '', primaryColor: '#3b82f6', email: '', phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    if (academyData) {
      setAcademyForm({
        name: academyData.name || '',
        slug: academyData.slug || '',
        primaryColor: academyData.primaryColor || '#3b82f6',
        email: academyData.email || '',
        phone: academyData.phone || '',
        address: academyData.address || '',
      });
    }
  }, [academyData]);

  const updateAcademyMutation = useMutation({
    mutationFn: (d: any) => api.put('/academy', d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['academy'] });
      setAcademy({ ...academy!, ...res.data.data });
      toast.success('Academia actualizada');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (d: any) => api.put('/auth/password', d),
    onSuccess: () => { toast.success('Contraseña actualizada'); setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) { toast.error('Las contraseñas no coinciden'); return; }
    updatePasswordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona la configuración de tu academia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Building2 size={16} className="text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Datos de la academia</h2>
          </div>
          <form onSubmit={e => { e.preventDefault(); updateAcademyMutation.mutate(academyForm); }} className="space-y-4">
            <div><label className="label">Nombre *</label><input className="input" value={academyForm.name} onChange={e => setAcademyForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div><label className="label">Slug (URL)</label><input className="input" value={academyForm.slug} onChange={e => setAcademyForm(f => ({ ...f, slug: e.target.value }))} /></div>
            <div><label className="label">Email</label><input type="email" className="input" value={academyForm.email} onChange={e => setAcademyForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="label">Teléfono</label><input className="input" value={academyForm.phone} onChange={e => setAcademyForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="label">Dirección</label><input className="input" value={academyForm.address} onChange={e => setAcademyForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div>
              <label className="label flex items-center gap-2"><Palette size={13} />Color principal</label>
              <div className="flex items-center gap-3">
                <input type="color" className="h-9 w-16 rounded border border-gray-300 dark:border-gray-700 cursor-pointer p-0.5" value={academyForm.primaryColor} onChange={e => setAcademyForm(f => ({ ...f, primaryColor: e.target.value }))} />
                <input className="input flex-1" value={academyForm.primaryColor} onChange={e => setAcademyForm(f => ({ ...f, primaryColor: e.target.value }))} placeholder="#3b82f6" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={updateAcademyMutation.isPending} className="btn-primary">
                {updateAcademyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-green-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mi cuenta</h2>
          </div>
          <div className="mb-5 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-400">Nombre</span><span className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-700 dark:text-gray-300">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Rol</span><span className="badge badge-blue">{user?.role}</span></div>
          </div>

          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Cambiar contraseña</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div><label className="label">Contraseña actual</label><input type="password" className="input" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} required /></div>
            <div><label className="label">Nueva contraseña</label><input type="password" className="input" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={8} /></div>
            <div><label className="label">Confirmar nueva contraseña</label><input type="password" className="input" value={passwordForm.confirm} onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} required /></div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={updatePasswordMutation.isPending} className="btn-primary">
                {updatePasswordMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Cambiar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
