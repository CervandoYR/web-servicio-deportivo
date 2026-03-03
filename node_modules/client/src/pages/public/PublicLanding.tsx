import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Phone, Mail, MapPin, ChevronRight, ChevronLeft, Star, Loader2,
  CheckCircle, MessageCircle, X, Instagram, Facebook, Youtube,
  Clock, Users, Trophy, Heart,
} from 'lucide-react';
import axios from 'axios';

const publicApi = axios.create({ baseURL: '/api' });

/* ── helpers ─────────────────────────────────────────────────── */
function StarRating({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
    </div>
  );
}

/* ── Navbar ───────────────────────────────────────────────────── */
function Navbar({ academy, primaryColor }: any) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {academy?.logo && <img src={academy.logo} alt={academy.name} className="h-8 w-auto" />}
          <span className={`font-extrabold text-xl transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>{academy?.name}</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[['#programas','Programas'],['#horarios','Horarios'],['#entrenadores','Entrenadores'],['#testimonios','Testimonios']].map(([h,l]) => (
            <a key={h} href={h} className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/90 hover:text-white'}`}>{l}</a>
          ))}
        </div>
        <a href="#contacto" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: primaryColor }}>
          Inscribirse <ChevronRight size={14} />
        </a>
      </div>
    </nav>
  );
}

/* ── Hero ─────────────────────────────────────────────────────── */
function HeroSection({ content, media, primaryColor }: any) {
  const imgs = (media || []).map((m: any) => m.url);
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (imgs.length <= 1) return;
    const t = setInterval(() => setCur(c => (c + 1) % imgs.length), 5000);
    return () => clearInterval(t);
  }, [imgs.length]);
  const bg = imgs.length > 0
    ? { backgroundImage: `url(${imgs[cur]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${primaryColor}dd 0%, ${primaryColor}88 100%)` };
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={bg}>
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute top-24 right-24 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: primaryColor }} />
      <div className="absolute bottom-24 left-24 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: primaryColor }} />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
          <Trophy size={14} /> Academia Deportiva de Élite
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
          {content?.title || 'Tu Academia Deportiva'}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">{content?.subtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contacto" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-transform" style={{ backgroundColor: primaryColor }}>
            {content?.ctaText || 'Solicita información'} <ChevronRight size={20} />
          </a>
          <a href="#programas" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-semibold text-lg border border-white/30 hover:bg-white/30 transition-colors">
            Ver programas
          </a>
        </div>
      </div>
      {imgs.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {imgs.map((_: any, i: number) => (
            <button key={i} onClick={() => setCur(i)} className="h-2.5 rounded-full transition-all" style={{ backgroundColor: '#fff', opacity: i === cur ? 1 : 0.4, width: i === cur ? '28px' : '10px' }} />
          ))}
        </div>
      )}
      <div className="absolute bottom-8 right-8 text-white/60 animate-bounce"><ChevronRight size={24} className="rotate-90" /></div>
    </section>
  );
}

/* ── Programs ─────────────────────────────────────────────────── */
function ProgramsSection({ content, primaryColor }: any) {
  const programs = content?.programs || [];
  return (
    <section id="programas" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{content?.title}</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">{content?.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((p: any, i: number) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-shadow border border-gray-100 flex flex-col">
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{p.name}</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white w-fit mb-4" style={{ backgroundColor: primaryColor }}>
                <Users size={11} />{p.ageRange}
              </span>
              <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1">{p.description}</p>
              <a href="#contacto" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: primaryColor }}>
                Más información <ChevronRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Schedules ────────────────────────────────────────────────── */
function SchedulesSection({ content, groups, primaryColor }: any) {
  const sports = [...new Set(groups.map((g: any) => g.sportType))] as string[];
  const [tab, setTab] = useState('');
  useEffect(() => { if (sports.length && !tab) setTab(sports[0]); }, [sports.length]);
  const filtered = tab ? groups.filter((g: any) => g.sportType === tab) : groups;
  return (
    <section id="horarios" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{content?.title}</h2>
          <p className="text-xl text-gray-500">{content?.subtitle}</p>
        </div>
        {sports.length > 1 && (
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {sports.map(s => (
              <button key={s} onClick={() => setTab(s)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === s ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={tab === s ? { backgroundColor: primaryColor } : {}}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((g: any) => (
            <div key={g.id} className="rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{g.name}</h3>
                  {g.minAge && g.maxAge && <span className="text-xs text-gray-400">{g.minAge}-{g.maxAge} años</span>}
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ backgroundColor: primaryColor }}>{g.sportType}</span>
              </div>
              {g.scheduleSummary && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2"><Clock size={14} className="mt-0.5 flex-shrink-0" /><span>{g.scheduleSummary}</span></div>
              )}
              {g.trainer && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>{g.trainer.name[0]}</div>
                  {g.trainer.name}
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs text-gray-400"><Users size={12} />{g._count?.students}/{g.capacity}</span>
                <span className="text-sm font-bold" style={{ color: primaryColor }}>${parseFloat(g.monthlyPrice).toFixed(0)}/mes</span>
              </div>
            </div>
          ))}
        </div>
        {!groups.length && <p className="text-center text-gray-400 py-10">No hay grupos disponibles en este momento.</p>}
      </div>
    </section>
  );
}

/* ── Trainers ─────────────────────────────────────────────────── */
function TrainersSection({ content, trainers, primaryColor }: any) {
  return (
    <section id="entrenadores" className="py-20 px-6" style={{ background: `linear-gradient(135deg,${primaryColor}08 0%,${primaryColor}04 100%)` }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{content?.title}</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">{content?.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((t: any) => (
            <div key={t.id} className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg overflow-hidden" style={{ background: `linear-gradient(135deg,${primaryColor},${primaryColor}88)` }}>
                {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : t.name[0]}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t.name}</h3>
              {t.specialty && <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mb-3" style={{ backgroundColor: primaryColor }}>{t.specialty}</span>}
              {t.bio && <p className="text-sm text-gray-500 leading-relaxed">{t.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────────── */
function TestimonialsSection({ content, primaryColor }: any) {
  const list = content?.testimonials || [];
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => setCur(c => (c + 1) % list.length), 4500);
    return () => clearInterval(t);
  }, [list.length]);
  if (!list.length) return null;
  const item = list[cur];
  return (
    <section id="testimonios" className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{content?.title}</h2>
        <p className="text-xl text-gray-500 mb-12">{content?.subtitle}</p>
        <div className="relative">
          <div className="bg-gray-50 rounded-3xl p-10 shadow-sm min-h-[200px] flex flex-col items-center justify-center">
            <StarRating n={item.rating} />
            <blockquote className="text-xl text-gray-700 italic leading-relaxed my-6">"{item.text}"</blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: primaryColor }}>{item.name[0]}</div>
              <div className="text-left">
                <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                {item.role && <div className="text-xs text-gray-400">{item.role}</div>}
              </div>
            </div>
          </div>
          {list.length > 1 && <>
            <button onClick={() => setCur(c => (c - 1 + list.length) % list.length)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={() => setCur(c => (c + 1) % list.length)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"><ChevronRight size={18} /></button>
          </>}
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {list.map((_: any, i: number) => (
            <button key={i} onClick={() => setCur(i)} className="h-2 rounded-full transition-all" style={{ backgroundColor: i === cur ? primaryColor : '#d1d5db', width: i === cur ? '24px' : '8px' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Gallery ──────────────────────────────────────────────────── */
function GallerySection({ content, media, primaryColor }: any) {
  const [box, setBox] = useState<string | null>(null);
  if (!media?.length) return null;
  return (
    <section id="galeria" className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{content?.title}</h2>
          <p className="text-xl text-gray-500">{content?.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((m: any, i: number) => (
            <button key={m.id} onClick={() => setBox(m.url)} className="aspect-square overflow-hidden rounded-2xl group relative">
              <img src={m.url} alt={m.altText || `Foto ${i+1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors rounded-2xl" />
            </button>
          ))}
        </div>
      </div>
      {box && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setBox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"><X size={28} /></button>
          <img src={box} alt="Galería" className="max-w-full max-h-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────────── */
function CTASection({ content, primaryColor }: any) {
  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg,${primaryColor} 0%,${primaryColor}cc 100%)` }}>
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white" />
      </div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">{content?.title}</h2>
        <p className="text-xl text-white/85 mb-10">{content?.subtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contacto" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow" style={{ color: primaryColor }}>
            <Heart size={18} fill="currentColor" />{content?.ctaText || 'Inscribirse Ahora'}
          </a>
          {content?.whatsapp && (
            <a href={`https://wa.me/${content.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-bold text-lg shadow-xl transition-colors">
              <MessageCircle size={18} />{content?.whatsappText || 'WhatsApp'}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Contact Form ─────────────────────────────────────────────── */
function ContactSection({ slug, primaryColor }: { slug: string; primaryColor: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', sportInterest: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) { setErr('Nombre y teléfono son obligatorios'); return; }
    setLoading(true); setErr('');
    try { await publicApi.post(`/landing/public/${slug}/lead`, form); setSent(true); }
    catch { setErr('Error al enviar. Inténtalo de nuevo.'); }
    finally { setLoading(false); }
  };
  return (
    <section id="contacto" className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">¡Inscribe a tu hijo!</h2>
          <p className="text-lg text-gray-500">Déjanos tus datos y te contactamos a la brevedad.</p>
        </div>
        {sent ? (
          <div className="rounded-3xl p-10 text-center border-2" style={{ background: `${primaryColor}10`, borderColor: `${primaryColor}30` }}>
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: primaryColor }} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Mensaje recibido!</h3>
            <p className="text-gray-500">Te contactaremos pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 rounded-3xl p-8 shadow-sm">
            {err && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{err}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre *</label>
                <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': primaryColor } as any} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tu nombre" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono *</label>
                <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': primaryColor } as any} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555 0000" required />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deporte de interés</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none text-sm bg-white" value={form.sportInterest} onChange={e => setForm(f => ({ ...f, sportInterest: e.target.value }))}>
                  <option value="">Seleccionar...</option>
                  <option>Fútbol</option><option>Natación</option><option>Tenis</option><option>Otro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mensaje (opcional)</label>
              <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none resize-none text-sm" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Cuéntanos sobre tu hijo..." />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: primaryColor }}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : <><ChevronRight size={20} />Enviar solicitud</>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────── */
function FooterSection({ content, academy, primaryColor }: any) {
  const c = content || {};
  return (
    <footer className="bg-gray-900 text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="text-2xl font-extrabold mb-3" style={{ color: primaryColor }}>{academy?.name}</div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Formando campeones dentro y fuera del campo.</p>
            <div className="flex gap-3">
              {c.instagram && c.instagram !== '#' && <a href={c.instagram} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Instagram size={16} /></a>}
              {c.facebook && c.facebook !== '#' && <a href={c.facebook} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Facebook size={16} /></a>}
              {c.youtube && c.youtube !== '#' && <a href={c.youtube} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><Youtube size={16} /></a>}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[['#inicio','Inicio'],['#programas','Programas'],['#horarios','Horarios'],['#entrenadores','Entrenadores'],['#testimonios','Testimonios'],['#contacto','Contacto']].map(([h,l]) => (
                <li key={h}><a href={h} className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Contacto</h4>
            <div className="space-y-3 text-sm text-gray-400">
              {(c.address || academy?.address) && <div className="flex items-start gap-2.5"><MapPin size={14} className="mt-0.5 flex-shrink-0" /><span>{c.address || academy?.address}</span></div>}
              {(c.phone || academy?.phone) && <a href={`tel:${c.phone || academy?.phone}`} className="flex items-center gap-2.5 hover:text-white transition-colors"><Phone size={14} />{c.phone || academy?.phone}</a>}
              {(c.email || academy?.email) && <a href={`mailto:${c.email || academy?.email}`} className="flex items-center gap-2.5 hover:text-white transition-colors"><Mail size={14} />{c.email || academy?.email}</a>}
            </div>
          </div>
        </div>
        {c.mapEmbedUrl && (
          <div className="rounded-2xl overflow-hidden mb-8 h-48">
            <iframe src={c.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Ubicación" />
          </div>
        )}
        <div className="border-t border-white/10 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} {academy?.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

/* ── Main ─────────────────────────────────────────────────────── */
export default function PublicLanding() {
  const { slug } = useParams<{ slug?: string }>();
  const resolvedSlug = slug || import.meta.env.VITE_ACADEMY_SLUG || 'academia-elite';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-landing', resolvedSlug],
    queryFn: () => publicApi.get(`/landing/public/${resolvedSlug}`).then(r => r.data.data),
    enabled: !!resolvedSlug,
    retry: 1,
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-gray-400" size={40} />
    </div>
  );

  if (isError || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <div className="text-6xl mb-6">⚽</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Academia no encontrada</h1>
        <p className="text-gray-500">Verifica la URL e inténtalo de nuevo</p>
      </div>
    </div>
  );

  const { academy, sections, trainers, groups } = data;
  const pc = academy?.primaryColor || '#3b82f6';
  const sec = (type: string) => sections.find((s: any) => s.type === type);
  const has = (type: string) => !!sec(type);

  return (
    <div className="min-h-screen bg-white">
      <Navbar academy={academy} primaryColor={pc} />
      {has('hero') && <HeroSection content={sec('hero')?.content} media={sec('hero')?.media} primaryColor={pc} />}
      {has('programs') && <ProgramsSection content={sec('programs')?.content} primaryColor={pc} />}
      {has('schedules') && groups.length > 0 && <SchedulesSection content={sec('schedules')?.content} groups={groups} primaryColor={pc} />}
      {has('trainers') && trainers.length > 0 && <TrainersSection content={sec('trainers')?.content} trainers={trainers} primaryColor={pc} />}
      {has('testimonials') && <TestimonialsSection content={sec('testimonials')?.content} primaryColor={pc} />}
      {has('gallery') && <GallerySection content={sec('gallery')?.content} media={sec('gallery')?.media} primaryColor={pc} />}
      {has('cta') && <CTASection content={sec('cta')?.content} primaryColor={pc} />}
      <ContactSection slug={resolvedSlug} primaryColor={pc} />
      {has('footer') && <FooterSection content={sec('footer')?.content} academy={academy} primaryColor={pc} />}
    </div>
  );
}
