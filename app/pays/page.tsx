"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const countries = ["Algérie","Angola","Bénin","Botswana","Burkina Faso","Burundi","Cap-Vert","Cameroun","République centrafricaine","Tchad","Comores","République du Congo","République démocratique du Congo","Côte d’Ivoire","Djibouti","Égypte","Guinée équatoriale","Érythrée","Eswatini","Éthiopie","Gabon","Gambie","Ghana","Guinée","Guinée-Bissau","Kenya","Lesotho","Libéria","Libye","Madagascar","Malawi","Mali","Mauritanie","Maurice","Maroc","Mozambique","Namibie","Niger","Nigéria","Rwanda","São Tomé-et-Príncipe","Sénégal","Seychelles","Sierra Leone","Somalie","Afrique du Sud","Soudan du Sud","Soudan","Tanzanie","Togo","Tunisie","Ouganda","Zambie","Zimbabwe"];

type Country = { code: string; name: string; position: number; [key: string]: unknown };
function flag(code: string) { return code.replace(/[A-Z]/g, l => String.fromCodePoint(127397 + l.charCodeAt(0))); }
function label(k: string) { return k.replace(/_/g, " ").replace(/\b\w/g, x => x.toUpperCase()); }

export default function CountriesPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Country[]>(countries.map((name, i) => ({ name, code: "", position: i + 1 })));
  const [selected, setSelected] = useState<Country | null>(null);
  useEffect(() => { void (async () => { if (!supabase) return; const { data } = await supabase.from("africa_countries").select("*").order("position"); if (data?.length === 54) setData(data as Country[]); })(); }, []);
  const filtered = useMemo(() => data.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())), [data, query]);
  return <main className="countries-page section-wrap">
    <header className="site-header"><a className="brand" href="/">Bickri <b>Verified</b></a><a className="header-button" href="/">Retour à l’accueil</a></header>
    <section className="countries"><p className="eyebrow">BICKRI VERIFIED · AFRIQUE</p><h1>Les 54 pays africains</h1><p>Recherchez un pays puis cliquez sur son nom pour ouvrir sa fiche. Les champs affichés proviennent directement de Supabase.</p>
      <div className="country-search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher parmi les 54 pays…"/></div>
      <div className="country-grid">{filtered.map(c => <button className="country-pill" key={c.name} onClick={() => setSelected(c)}><span className="flag">{c.code ? flag(c.code) : "🌍"}</span><strong>{c.name}</strong><small>{c.code || `#${c.position}`}</small><b>→</b></button>)}</div>
    </section>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><article className="country-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><div className="modal-title"><span className="modal-flag">{selected.code ? flag(selected.code) : "🌍"}</span><div><p className="eyebrow">FICHE PAYS</p><h2>{selected.name}</h2></div></div><div className="info-grid">{Object.entries(selected).map(([key, value]) => <div className="info-item" key={key}><small>{label(key)}</small><strong>{value === null || value === undefined || value === "" ? "À compléter" : typeof value === "object" ? JSON.stringify(value) : String(value)}</strong></div>)}</div><button className="primary full" onClick={() => setSelected(null)}>Fermer</button></article></div>}
    <style jsx>{`.countries-page{min-height:100vh}.countries-page .site-header{max-width:none;margin:0 -32px}.countries-page h1{font-size:clamp(3rem,7vw,6rem);line-height:.95;letter-spacing:-.07em;margin:0 0 20px}.countries-page .countries>p:not(.eyebrow){max-width:700px;color:var(--muted)}.header-button{background:var(--ink);color:#fff;padding:10px 15px;border-radius:10px;font-weight:700;font-size:.8rem}.modal-backdrop{position:fixed;inset:0;z-index:100;background:rgba(10,25,20,.68);display:grid;place-items:center;padding:20px}.country-modal{position:relative;width:min(850px,100%);max-height:90vh;overflow:auto;background:var(--paper);border-radius:24px;padding:38px;box-shadow:0 30px 100px rgba(0,0,0,.25)}.close{position:absolute;right:18px;top:18px;border:0;background:#edf4eb;border-radius:50%;width:38px;height:38px;font-size:25px;cursor:pointer}.modal-title{display:flex;align-items:center;gap:20px;border-bottom:1px solid var(--line);padding-bottom:25px}.modal-title h2{font-size:clamp(2rem,5vw,4rem);margin:0;letter-spacing:-.06em}.modal-title .eyebrow{margin-bottom:7px}.modal-flag{font-size:4rem}.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:25px 0}.info-item{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px}.info-item small{display:block;color:var(--muted);font-size:.65rem;text-transform:uppercase;letter-spacing:.08em}.info-item strong{display:block;margin-top:5px;word-break:break-word}.primary{border:0;background:var(--green);color:var(--ink);padding:13px 18px;border-radius:10px;font-weight:800;cursor:pointer}.full{width:100%}@media(max-width:600px){.countries-page .site-header{margin:0 -20px}.country-modal{padding:25px}.info-grid{grid-template-columns:1fr}.modal-flag{font-size:3rem}}`}</style>
  </main>;
}
