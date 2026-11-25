import { useEffect, useMemo, useState } from 'react';
import { BookOpen, BriefcaseMedical, Check, Clock3, Heart, ListTodo, Plus, Search, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/activities';
const areas = {
  professional: { label: 'Profesional', icon: BriefcaseMedical, color: 'bg-[#e9efe9] text-[#587763]' },
  academic: { label: 'Académico', icon: BookOpen, color: 'bg-[#f3ebe4] text-[#a57557]' },
  personal: { label: 'Familia y personal', icon: Heart, color: 'bg-[#eeeaf2] text-[#837495]' },
};
const localIsoDate = () => {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
};
const blankForm = () => ({ description: '', category: 'professional', date: localIsoDate(), topic: '', due_date: '' });

function prettyDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

export default function App() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [apiState, setApiState] = useState('loading');
  const [message, setMessage] = useState('');

  async function loadActivities() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('No se pudo consultar la API');
      setActivities(await response.json());
      setApiState('online');
    } catch {
      setApiState('offline');
    }
  }

  useEffect(() => { loadActivities(); }, []);

  const filteredActivities = useMemo(() => activities
    .filter((item) => category === 'all' || item.category === category)
    .filter((item) => status === 'all' || (status === 'done' ? item.done : !item.done))
    .filter((item) => `${item.description} ${item.topic || ''}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es').trim()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id), [activities, category, status, query]);

  async function createActivity(event) {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, due_date: form.due_date || null, topic: form.topic || null }) });
      if (!response.ok) throw new Error('No se pudo guardar. Revisa la conexión con el servicio local.');
      setForm(blankForm());
      setMessage('Actividad guardada.');
      await loadActivities();
    } catch (error) { setMessage(error.message); }
  }

  async function updateActivity(id, patch) {
    const response = await fetch(`${API_URL}/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
    if (response.ok) await loadActivities();
    else setMessage('No se pudo actualizar la actividad.');
  }

  async function deleteActivity(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (response.ok) await loadActivities();
    else setMessage('No se pudo eliminar la actividad.');
  }

  const today = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

  return <div className="min-h-screen bg-[#f7f6f2] text-[#263b36]">
    <aside className="fixed inset-y-0 left-0 flex w-[238px] flex-col border-r border-[#e7e8e0] bg-[#f0f1eb] px-[22px] py-[30px]">
      <a className="flex items-center gap-3 text-inherit no-underline" href="#inicio">
        <span className="grid h-[37px] w-[37px] place-items-center rounded-[13px_13px_13px_4px] bg-[#587763] font-serif text-[22px] text-white">B</span>
        <span><strong className="block font-serif text-[21px] tracking-tight">brújula</strong><small className="block text-[10px] tracking-wide text-[#75817b]">asistente personal</small></span>
      </a>
      <p className="mb-3 ml-2.5 mt-[58px] text-[9px] font-bold tracking-[.16em] text-[#89928b]">TU ESPACIO</p>
      <a className="flex items-center gap-3 rounded-lg bg-[#e2e9e0] px-3 py-3 text-[13px] font-semibold text-[#385944] no-underline" href="#actividades"><ListTodo size={17}/> Actividades</a>
      <div className="mt-auto rounded-xl bg-[#e9ece5] p-4 text-[#52635a]"><Sparkles size={18} className="text-[#ce855d]"/><p className="mb-0 mt-2 font-serif text-[15px] leading-relaxed">Un lugar tranquilo para ordenar lo que ocupa tu día.</p></div>
      <div className="mt-5 flex items-center gap-2 px-2 text-[11px] text-[#7d8980]"><span className={`h-[7px] w-[7px] rounded-full ${apiState === 'online' ? 'bg-[#7c9a77]' : 'bg-[#ce855d]'}`}/>{apiState === 'online' ? 'API local conectada' : apiState === 'loading' ? 'Conectando con la API…' : 'API local desconectada'}</div>
    </aside>

    <main id="inicio" className="ml-[238px] min-h-screen max-w-[1050px] px-[58px] pb-[60px]">
      <header className="flex h-[76px] items-center justify-between border-b border-[#e9e8e1]"><span className="text-[11px] capitalize text-[#7c8780]">{today}</span><span className="grid h-[31px] w-[31px] place-items-center rounded-full bg-[#e6ddd2] font-serif text-[#735e4d]">P</span></header>
      <section className="pb-6 pt-9"><p className="mb-3 text-[9px] font-bold tracking-[.16em] text-[#a17a60]">TU DÍA, CON MÁS CLARIDAD</p><h1 className="m-0 font-serif text-[40px] font-medium leading-[1.14] tracking-tight">Hola, ¿qué quieres<br/><em className="text-[#66816d]">dejar organizado?</em></h1><p className="mt-3 text-[13px] text-[#75817b]">Registra una actividad ahora y vuelve a ella cuando la necesites.</p></section>

      <section className="rounded-[13px] border border-[#eeede7] bg-white px-6 py-6 shadow-[0_8px_24px_#32443708]">
        <div className="mb-5 flex items-start justify-between"><div><span className="text-[9px] font-bold tracking-[.16em] text-[#a17a60]">NUEVA ENTRADA</span><h2 className="mb-0 mt-1 font-serif text-[21px] font-medium">Anota algo de tu día</h2></div><Sparkles size={20} className="text-[#be896d]"/></div>
        <form onSubmit={createActivity}>
          <label className="mb-2 block text-[11px] font-semibold" htmlFor="description">¿Qué pasó o qué necesitas recordar?</label>
          <textarea id="description" required maxLength={500} rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ej. Preparar lectura para el seminario del viernes…" className="w-full resize-y rounded-md border border-[#e9e9e3] bg-[#fdfdfb] p-3 text-xs outline-none focus:border-[#9aaf9b]"/>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-[10px] font-semibold text-[#59675f]">
            <label className="flex flex-col gap-1.5">Área<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-9 rounded-md border border-[#e9e9e3] bg-[#fdfdfb] px-2.5 text-[11px]"><option value="professional">Profesional</option><option value="academic">Académico</option><option value="personal">Familia y personal</option></select></label>
            <label className="flex flex-col gap-1.5">Fecha<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="h-9 rounded-md border border-[#e9e9e3] bg-[#fdfdfb] px-2.5 text-[11px]"/></label>
            <label className="col-span-2 flex flex-col gap-1.5">Tema o referencia <span className="font-normal text-[#9aa29c]">Opcional; no incluyas datos de pacientes</span><input maxLength={100} value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} placeholder="Ej. Seminario de neurociencias" className="h-9 rounded-md border border-[#e9e9e3] bg-[#fdfdfb] px-2.5 text-[11px]"/></label>
            <label className="col-span-2 flex flex-col gap-1.5">Compromiso / fecha límite <span className="font-normal text-[#9aa29c]">Opcional</span><input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} className="h-9 rounded-md border border-[#e9e9e3] bg-[#fdfdfb] px-2.5 text-[11px]"/></label>
          </div>
          <div className="mt-4 flex items-center justify-between"><span className="text-[10px] text-[#9aa29c]">Por ahora se guarda localmente en este equipo.</span><button className="flex h-9 items-center gap-1 rounded-md bg-[#55745e] px-4 text-[11px] font-semibold text-white hover:bg-[#3f614a]"><Plus size={15}/> Guardar actividad</button></div>
          {message && <p role="status" className="mb-0 mt-3 text-[11px] text-[#587763]">{message}</p>}
        </form>
      </section>

      <section id="actividades" className="mt-8">
        <div><span className="text-[9px] font-bold tracking-[.16em] text-[#a17a60]">TU REGISTRO</span><h2 className="mb-0 mt-1 font-serif text-[22px] font-medium">Actividades recientes <span className="ml-1 inline-grid h-[21px] w-[21px] place-items-center rounded-full bg-[#e8ece5] align-[3px] font-sans text-[10px] font-semibold text-[#5b745f]">{filteredActivities.length}</span></h2></div>
        <div className="my-4 flex gap-2">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-md border border-[#e9e8e1] bg-white px-2.5 text-[#879188]"><Search size={16}/><input aria-label="Buscar" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por tema o descripción" className="w-full border-0 bg-transparent text-[11px] text-[#263b36] outline-none"/></label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 min-w-[135px] rounded-md border border-[#e9e8e1] bg-white px-2.5 text-[11px]"><option value="all">Todas las áreas</option><option value="professional">Profesional</option><option value="academic">Maestría</option><option value="personal">Familia y personal</option></select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 min-w-[135px] rounded-md border border-[#e9e8e1] bg-white px-2.5 text-[11px]"><option value="all">Cualquier estado</option><option value="pending">Pendientes</option><option value="done">Completadas</option></select>
        </div>
        <div className="grid gap-2">
          {apiState === 'offline' && <div className="rounded-lg border border-[#eadbcf] bg-[#fbf3ec] p-5 text-xs text-[#8c654c]">No hay conexión con la API. Inicia primero el backend de Python.</div>}
          {apiState === 'online' && filteredActivities.length === 0 && <div className="rounded-lg border border-dashed border-[#dcded5] p-7 text-center text-xs text-[#929b94]"><strong className="mb-1 block font-serif text-[17px] font-medium text-[#68776c]">{activities.length ? 'No hay coincidencias' : 'Tu espacio empieza aquí'}</strong>{activities.length ? 'Prueba con otra búsqueda o cambia los filtros.' : 'Cuando registres una actividad, aparecerá en esta lista.'}</div>}
          {filteredActivities.map((item) => {
            const area = areas[item.category] || areas.professional;
            const Icon = area.icon;
            return <article key={item.id} className={`grid grid-cols-[34px_1fr_auto] items-start gap-3 rounded-lg border border-[#eeede7] bg-white p-4 ${item.done ? 'opacity-65' : ''}`}>
              <span className={`grid h-8 w-8 place-items-center rounded-lg ${area.color}`}><Icon size={15}/></span>
              <div><div className="mb-1 flex items-center gap-2"><span className="text-[9px] font-bold uppercase tracking-wide text-[#66806c]">{area.label}</span><span className="text-[10px] text-[#98a099]">{prettyDate(item.date)}</span></div><p className={`m-0 text-xs leading-relaxed ${item.done ? 'line-through text-[#98a099]' : ''}`}>{item.description}</p>{item.topic && <p className="mb-0 mt-1 text-[10px] text-[#858f88]">Tema: {item.topic}</p>}{item.due_date && <span className="mt-2 inline-flex items-center gap-1 rounded bg-[#f8f1e9] px-2 py-1 text-[9px] text-[#a27351]"><Clock3 size={11}/>{item.done ? 'Compromiso' : 'Para'} {prettyDate(item.due_date)}</span>}</div>
              <div className="flex gap-1"><button onClick={() => updateActivity(item.id, { done: !item.done })} aria-label={item.done ? 'Marcar pendiente' : 'Marcar completada'} title={item.done ? 'Marcar pendiente' : 'Marcar completada'} className="grid h-7 w-7 place-items-center rounded-md text-[#89938b] hover:bg-[#f1f3ef]"><Check size={15}/></button><button onClick={() => deleteActivity(item.id)} aria-label="Eliminar actividad" title="Eliminar" className="grid h-7 w-7 place-items-center rounded-md text-[#89938b] hover:bg-[#fbefed] hover:text-[#b46356]"><Trash2 size={14}/></button></div>
            </article>;
          })}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[10px] text-[#9ba29c]"><ShieldCheck size={13}/> No registres nombres, notas clínicas ni datos que identifiquen a pacientes.</p>
      </section>
    </main>
  </div>;
}
