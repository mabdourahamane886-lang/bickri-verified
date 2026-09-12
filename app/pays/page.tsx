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
    <section className="countries"><p className="eyebrow">BICKRI VERIFIED · AFRIQUE</p><h1>Les 54 pays africains</h1><p>Recherchez un pays puis cliquez sur son nom pour ouvrir sa fiche. Les champs affichés proviennent de Supabase et pourront être enrichis avec les informations nationales.</p>
      <div className="country-search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher parmi les 54 pays…"/></div>
      <div className="country-grid">{filtered.map(c => <button className="country-pill" key={c.name} onClick={() => setSelected(c)}><span className="flag">{c.code ? flag(c.code) : "🌍"}</span><strong>{c.name}</strong><small>{c.code || `#${c.position}`}</small><b>→</b></button>)}</div>
    </section>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><article className="country-modal" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><div className="modal-title"><span className="modal-flag">{selected.code ? flag(selected.code) : "🌍"}</span><div><p className="eyebrow">FICHE PAYS</p><h2>{selected.name}</h2></div></div><div className="info-grid">{Object.entries(selected).map(([key, value]) => <div className="info-item" key={key}><small>{label(key)}</small><strong>{value === null || value === undefined || value === "" ? "À compléter" : typeof value === "object" ? JSON.stringify(value) : String(value)}</strong></div>)}</div><button className="primary full" onClick={() => setSelected(null)}>Fermer</button></article></div>}
  </main>;
}
