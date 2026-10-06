import { useEffect, useMemo, useState } from 'react';

const tabs = ['all', 'pending', 'approved', 'rejected'];
export default function AdminReviews() {
  const [token, setToken] = useState(() => sessionStorage.getItem('ekadanta_admin_token') || '');
  const [reviews, setReviews] = useState([]); const [tab, setTab] = useState('pending'); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const auth = { Authorization: `Bearer ${token}` };
  async function load() { if (!token) return; setLoading(true); setError(''); try { const res=await fetch('/api/admin/reviews',{headers:auth}); const d=await res.json(); if(!res.ok) throw Error(d.error||'Unable to load reviews'); setReviews(d.reviews||[]); sessionStorage.setItem('ekadanta_admin_token',token); } catch(e){setError(e.message);} finally{setLoading(false);} }
  useEffect(()=>{ if(token) load(); },[]);
  async function change(id, action) { const res=await fetch(`/api/admin/reviews/${id}/${action}`,{method:'POST',headers:auth}); const d=await res.json(); if(!res.ok){setError(d.error||'Action failed');return;} setReviews(rs=>rs.map(r=>r.id===id?{...r,status:d.status}:r)); }
  const visible=useMemo(()=>tab==='all'?reviews:reviews.filter(r=>r.status===tab),[reviews,tab]);
  const counts=Object.fromEntries(tabs.map(t=>[t,t==='all'?reviews.length:reviews.filter(r=>r.status===t).length]));
  if(!token) return <main className="min-h-screen bg-navy-950 px-4 py-20"><div className="mx-auto max-w-md glass rounded-2xl p-8"><p className="text-sm uppercase tracking-[0.25em] text-gold-300">EKADANTA TRADERS</p><h1 className="mt-2 text-3xl text-pearl">Admin Reviews</h1><p className="mt-3 text-sm text-pearl/60">Enter the ADMIN_TOKEN configured on your server.</p><form className="mt-6 space-y-4" onSubmit={e=>{e.preventDefault(); if(token.trim()) load();}}><input type="password" value={token} onChange={e=>setToken(e.target.value)} className="w-full rounded-lg border border-gold-500/20 bg-navy-950 px-4 py-3 text-pearl" placeholder="Admin token" required/><button className="btn-gold w-full">Open Reviews</button></form></div></main>;
  return <main className="min-h-screen bg-navy-950 px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-[0.25em] text-gold-300">EKADANTA TRADERS</p><h1 className="mt-2 text-4xl text-pearl">Admin Reviews</h1></div><button onClick={load} className="btn-outline">{loading?'Refreshing…':'Refresh'}</button></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{tabs.slice(1).map(t=><div key={t} className="glass rounded-xl p-4"><p className="text-xs uppercase text-pearl/50">{t}</p><p className="mt-1 text-2xl font-bold text-gold-300">{counts[t]}</p></div>)}</div><div className="mt-8 flex flex-wrap gap-2">{tabs.map(t=><button key={t} onClick={()=>setTab(t)} className={tab===t?'btn-gold':'btn-outline'}>{t[0].toUpperCase()+t.slice(1)} ({counts[t]})</button>)}</div>{error&&<p className="mt-5 text-red-300">{error}</p>}<div className="mt-6 space-y-4">{visible.length===0?<div className="glass rounded-2xl p-8 text-pearl/60">No {tab === 'all' ? '' : tab} reviews.</div>:visible.map(r=><article key={r.id} className="glass rounded-2xl p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-pearl">{r.name}</h2><p className="text-sm text-pearl/50">{new Date(r.created_at).toLocaleString()}</p></div><span className="rounded-full border border-gold-500/30 px-3 py-1 text-xs uppercase text-gold-300">{r.status}</span></div><p className="mt-3 text-xl text-gold-300">
  {'★'.repeat(Math.floor(r.rating))}
  {r.rating % 1 !== 0 && '½'}
  <span className="text-white/20">
    {'★'.repeat(5 - Math.ceil(r.rating))}
  </span>
</p>
