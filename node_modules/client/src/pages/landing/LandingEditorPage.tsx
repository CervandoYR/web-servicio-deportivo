import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2, Trash2, Plus, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Edit2, ExternalLink, X, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, extractData } from '../../lib/api';
import Modal from '../../components/ui/Modal';
import ImageUploader from '../../components/ui/ImageUploader';
import { useAuthStore } from '../../store/auth.store';

/* ── Section type metadata ───────────────────────────────────── */
const SECTION_META: Record<string, { label: string; icon: string; description: string }> = {
  hero:         { label: 'Hero',         icon: '🏆', description: 'Banner principal con carrusel' },
  programs:     { label: 'Programas',    icon: '⚽', description: 'Tarjetas de programas por edad' },
  schedules:    { label: 'Horarios',     icon: '🕐', description: 'Grupos y horarios (desde DB)' },
  trainers:     { label: 'Entrenadores', icon: '👨‍🏫', description: 'Equipo de entrenadores (desde DB)' },
  testimonials: { label: 'Testimonios',  icon: '💬', description: 'Carrusel de opiniones de familias' },
  gallery:      { label: 'Galería',      icon: '🖼️', description: 'Cuadrícula de imágenes' },
  cta:          { label: 'CTA Final',    icon: '🎯', description: 'Sección de llamada a la acción' },
  footer:       { label: 'Footer',       icon: '📍', description: 'Contacto y redes sociales' },
};

/* ── Section media manager ───────────────────────────────────── */
function SectionMediaManager({ sectionId }: { sectionId: string }) {
  const qc = useQueryClient();
  const { data: sections } = useQuery({
    queryKey: ['landing-sections'],
    queryFn: () => api.get('/landing/sections').then(extractData),
  });
  const media = (sections || []).find((s: any) => s.id === sectionId)?.media || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/landing/media/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['landing-sections'] }); toast.success('Imagen eliminada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const onUploaded = () => qc.invalidateQueries({ queryKey: ['landing-sections'] });

  return (
    <div className="space-y-3">
      <label className="label flex items-center gap-1.5"><Image size={13} />Imágenes</label>
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {media.map((m: any) => (
            <div key={m.id} className="relative aspect-video rounded-xl overflow-hidden group bg-gray-100 dark:bg-gray-800">
              <img src={m.url} alt={m.altText || ''} className="w-full h-full object-cover" />
              <button
                onClick={() => { if (confirm('¿Eliminar imagen?')) deleteMutation.mutate(m.id); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <ImageUploader sectionId={sectionId} onUploaded={onUploaded} />
      {!media.length && <p className="text-xs text-gray-400 text-center">Sin imágenes. Sube la primera.</p>}
    </div>
  );
}

/* ── Dynamic section content form ───────────────────────────── */
function SectionForm({ type, content, onChange }: { type: string; content: any; onChange: (c: any) => void }) {
  const c = content || {};
  const set = (key: string, val: any) => onChange({ ...c, [key]: val });

  const { data: trainersList } = useQuery({
    queryKey: ['landing-trainers'],
    queryFn: () => api.get('/landing/trainers').then(extractData),
    enabled: type === 'trainers',
  });

  const textRow = (label: string, key: string, multi = false) => (
    <div key={key}>
      <label className="label">{label}</label>
      {multi
        ? <textarea className="input resize-none" rows={2} value={c[key] || ''} onChange={e => set(key, e.target.value)} />
        : <input className="input" value={c[key] || ''} onChange={e => set(key, e.target.value)} />}
    </div>
  );

  /* ── Programs / Testimonials array editors ── */
  const ProgramsEditor = () => {
    const items: any[] = c.programs || [];
    const upd = (i: number, k: string, v: string) => {
      const next = [...items]; next[i] = { ...next[i], [k]: v };
      set('programs', next);
    };
    const add = () => set('programs', [...items, { name: '', ageRange: '', description: '', icon: '⚽' }]);
    const remove = (i: number) => set('programs', items.filter((_: any, idx: number) => idx !== i));
    return (
      <div className="space-y-3">
        {items.map((p: any, i: number) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2 relative">
            <button type="button" onClick={() => remove(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2"><label className="label text-xs">Nombre</label><input className="input text-sm" value={p.name} onChange={e => upd(i,'name',e.target.value)} /></div>
              <div><label className="label text-xs">Icono</label><input className="input text-sm" value={p.icon} onChange={e => upd(i,'icon',e.target.value)} /></div>
            </div>
            <div><label className="label text-xs">Rango de edad</label><input className="input text-sm" value={p.ageRange} onChange={e => upd(i,'ageRange',e.target.value)} placeholder="5 - 12 años" /></div>
            <div><label className="label text-xs">Descripción</label><textarea className="input text-sm resize-none" rows={2} value={p.description} onChange={e => upd(i,'description',e.target.value)} /></div>
          </div>
        ))}
        <button type="button" onClick={add} className="btn-secondary text-xs w-full"><Plus size={12} />Añadir programa</button>
      </div>
    );
  };

  const TestimonialsEditor = () => {
    const items: any[] = c.testimonials || [];
    const upd = (i: number, k: string, v: any) => {
      const next = [...items]; next[i] = { ...next[i], [k]: v };
      set('testimonials', next);
    };
    const add = () => set('testimonials', [...items, { name: '', role: '', text: '', rating: 5 }]);
    const remove = (i: number) => set('testimonials', items.filter((_: any, idx: number) => idx !== i));
    return (
      <div className="space-y-3">
        {items.map((t: any, i: number) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2 relative">
            <button type="button" onClick={() => remove(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label text-xs">Nombre</label><input className="input text-sm" value={t.name} onChange={e => upd(i,'name',e.target.value)} /></div>
              <div><label className="label text-xs">Rol</label><input className="input text-sm" value={t.role} onChange={e => upd(i,'role',e.target.value)} placeholder="Padre de..." /></div>
            </div>
            <div><label className="label text-xs">Testimonio</label><textarea className="input text-sm resize-none" rows={2} value={t.text} onChange={e => upd(i,'text',e.target.value)} /></div>
            <div><label className="label text-xs">Calificación (1-5)</label>
              <select className="input text-sm" value={t.rating} onChange={e => upd(i,'rating',Number(e.target.value))}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </div>
          </div>
        ))}
        <button type="button" onClick={add} className="btn-secondary text-xs w-full"><Plus size={12} />Añadir testimonio</button>
      </div>
    );
  };

  switch (type) {
    case 'hero': return (
      <div className="space-y-3">
        {textRow('Título principal', 'title')}
        {textRow('Subtítulo', 'subtitle', true)}
        {textRow('Texto del botón CTA', 'ctaText')}
        {textRow('Enlace del botón CTA', 'ctaLink')}
        <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">💡 Las imágenes del carrusel se gestionarán mediante la subida de archivos (próximamente S3).</p>
      </div>
    );
    case 'programs': return (
      <div className="space-y-3">
        {textRow('Título de la sección', 'title')}
        {textRow('Subtítulo', 'subtitle', true)}
        <label className="label">Programas</label>
        <ProgramsEditor />
      </div>
    );
    case 'schedules': return (
      <div className="space-y-3">
        {textRow('Título de la sección', 'title')}
        {textRow('Subtítulo', 'subtitle', true)}
        <p className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">ℹ️ Los grupos y horarios se cargan automáticamente desde la base de datos. Para editarlos, ve a la sección <strong>Grupos</strong>.</p>
      </div>
    );
    case 'trainers': return (
      <div className="space-y-3">
        {textRow('Título de la sección', 'title')}
        {textRow('Subtítulo', 'subtitle', true)}
        <div>
          <label className="label">Entrenadores visibles en la landing</label>
          {!trainersList?.length && <p className="text-xs text-gray-400">No hay entrenadores creados aún.</p>}
          <div className="space-y-1.5 mt-1">
            {(trainersList || []).map((t: any) => {
              const selected: string[] = c.selectedTrainerIds || [];
              const checked = selected.includes(t.id);
              return (
                <label key={t.id} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${checked ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input type="checkbox" className="rounded" checked={checked}
                    onChange={() => {
                      const next = checked ? selected.filter(id => id !== t.id) : [...selected, t.id];
                      set('selectedTrainerIds', next);
                    }} />
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">{t.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{t.name}</p>
                    {t.specialty && <p className="text-xs text-gray-400 truncate">{t.specialty}</p>}
                  </div>
                </label>
              );
            })}
          </div>
          {(c.selectedTrainerIds?.length === 0 || !c.selectedTrainerIds) && (
            <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 mt-2">Si no seleccionas ninguno, se mostrarán todos los entrenadores activos.</p>
          )}
        </div>
      </div>
    );
    case 'testimonials': return (
      <div className="space-y-3">
        {textRow('Título de la sección', 'title')}
        {textRow('Subtítulo', 'subtitle', true)}
        <label className="label">Testimonios</label>
        <TestimonialsEditor />
      </div>
    );
    case 'gallery': return (
      <div className="space-y-3">
        {textRow('Título de la sección', 'title')}
        {textRow('Subtítulo', 'subtitle', true)}
        <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">💡 La gestión de imágenes de galería estará disponible próximamente con soporte S3.</p>
      </div>
    );
    case 'cta': return (
      <div className="space-y-3">
        {textRow('Título', 'title')}
        {textRow('Subtítulo', 'subtitle', true)}
        {textRow('Texto botón principal', 'ctaText')}
        {textRow('Número de WhatsApp', 'whatsapp')}
        {textRow('Texto botón WhatsApp', 'whatsappText')}
      </div>
    );
    case 'footer': return (
      <div className="space-y-3">
        {textRow('Dirección', 'address')}
        {textRow('Teléfono', 'phone')}
        {textRow('Email', 'email')}
        {textRow('Instagram URL', 'instagram')}
        {textRow('Facebook URL', 'facebook')}
        {textRow('YouTube URL', 'youtube')}
        {textRow('Google Maps Embed URL', 'mapEmbedUrl')}
      </div>
    );
    default: return <p className="text-gray-400 text-sm">Sin configuración para este tipo.</p>;
  }
}

/* ── Main component ───────────────────────────────────────────── */
export default function LandingEditorPage() {
  const qc = useQueryClient();
  const academy = useAuthStore(s => s.academy);
  const [editSection, setEditSection] = useState<any>(null);
  const [editContent, setEditContent] = useState<any>({});
  const [addModal, setAddModal] = useState(false);
  const [newType, setNewType] = useState('hero');

  const { data: sections, isLoading } = useQuery({
    queryKey: ['landing-sections'],
    queryFn: () => api.get('/landing/sections').then(extractData),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['landing-sections'] });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/landing/sections/${id}/toggle`),
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const reorderMutation = useMutation({
    mutationFn: (orders: any[]) => api.put('/landing/sections/reorder', { orders }),
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: any) => api.put(`/landing/sections/${id}`, { content }),
    onSuccess: () => { invalidate(); toast.success('Sección guardada'); setEditSection(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/landing/sections/${id}`),
    onSuccess: () => { invalidate(); toast.success('Sección eliminada'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const createMutation = useMutation({
    mutationFn: (type: string) => api.post('/landing/sections', { type, content: {} }),
    onSuccess: () => { invalidate(); toast.success('Sección añadida'); setAddModal(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Error'),
  });

  const sorted = [...(sections || [])].sort((a: any, b: any) => a.order - b.order);

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const orders = sorted.map((s: any, i: number) => {
      if (i === idx) return { id: s.id, order: sorted[target].order };
      if (i === target) return { id: s.id, order: sorted[idx].order };
      return { id: s.id, order: s.order };
    });
    reorderMutation.mutate(orders);
  };

  const openEdit = (s: any) => { setEditSection(s); setEditContent({ ...(s.content || {}) }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Editor de Landing Page</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestiona el contenido de tu página pública</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/${academy?.slug}`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
            <ExternalLink size={14} />Ver página
          </a>
          <button onClick={() => setAddModal(true)} className="btn-primary text-sm"><Plus size={14} />Nueva sección</button>
        </div>
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={28} /></div>
      ) : (
        <div className="space-y-2">
          {sorted.map((s: any, idx: number) => {
            const meta = SECTION_META[s.type] || { label: s.type, icon: '📄', description: '' };
            return (
              <div key={s.id} className={`card p-4 flex items-center gap-4 transition-opacity ${!s.isActive ? 'opacity-50' : ''}`}>
                <span className="text-2xl select-none">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{meta.label}</span>
                    {!s.isActive && <span className="badge badge-gray text-xs">Oculto</span>}
                    <span className="text-xs text-gray-400">{meta.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-colors" title="Subir">
                    <ChevronUp size={15} />
                  </button>
                  <button onClick={() => move(idx, 1)} disabled={idx === sorted.length - 1} className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-colors" title="Bajar">
                    <ChevronDown size={15} />
                  </button>
                  <button onClick={() => toggleMutation.mutate(s.id)} className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title={s.isActive ? 'Ocultar' : 'Mostrar'}>
                    {s.isActive ? <ToggleRight size={18} className="text-blue-500" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="Editar">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => { if (confirm('¿Eliminar esta sección?')) deleteMutation.mutate(s.id); }} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Eliminar">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
          {!sorted.length && (
            <div className="card p-12 text-center">
              <p className="text-gray-400 text-sm">No hay secciones. Añade una para empezar.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit modal */}
      <Modal open={!!editSection} onClose={() => setEditSection(null)} title={`Editar: ${SECTION_META[editSection?.type]?.label || editSection?.type}`}>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <SectionForm type={editSection?.type} content={editContent} onChange={setEditContent} />
          {(editSection?.type === 'hero' || editSection?.type === 'gallery') && editSection?.id && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <SectionMediaManager sectionId={editSection.id} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setEditSection(null)} className="btn-secondary">Cancelar</button>
          <button onClick={() => updateMutation.mutate({ id: editSection.id, content: editContent })} disabled={updateMutation.isPending} className="btn-primary">
            {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar cambios
          </button>
        </div>
      </Modal>

      {/* Add section modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Añadir sección">
        <div className="space-y-3">
          <label className="label">Tipo de sección</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SECTION_META).map(([type, meta]) => (
              <button key={type} type="button" onClick={() => setNewType(type)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm ${newType === type ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                <span className="text-lg">{meta.icon}</span>
                <div>
                  <div className="font-semibold">{meta.label}</div>
                  <div className="text-xs text-gray-400 leading-tight">{meta.description}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
            <button onClick={() => setAddModal(false)} className="btn-secondary">Cancelar</button>
            <button onClick={() => createMutation.mutate(newType)} disabled={createMutation.isPending} className="btn-primary">
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Añadir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
