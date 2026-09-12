"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const badgeUrl = "/badges/bickri-verified-badge.svg";

const COUNTRIES = [
  "Algérie","Angola","Bénin","Botswana","Burkina Faso","Burundi","Cap-Vert","Cameroun","République centrafricaine","Tchad","Comores","République du Congo","République démocratique du Congo","Côte d’Ivoire","Djibouti","Égypte","Guinée équatoriale","Érythrée","Eswatini","Éthiopie","Gabon","Gambie","Ghana","Guinée","Guinée-Bissau","Kenya","Lesotho","Libéria","Libye","Madagascar","Malawi","Mali","Mauritanie","Maurice","Maroc","Mozambique","Namibie","Niger","Nigéria","Rwanda","São Tomé-et-Príncipe","Sénégal","Seychelles","Sierra Leone","Somalie","Afrique du Sud","Soudan du Sud","Soudan","Tanzanie","Togo","Tunisie","Ouganda","Zambie","Zimbabwe"
];

type Country = { name: string; code?: string; position?: number; [key: string]: unknown };

type Organization = { id: string; name: string; country?: string; badge_serial?: string; verification_score?: number };

function flag(code?: string) {
  if (!code || code.length !== 2) return "🌍";
  return code.toUpperCase().replace(/[A-Z]/g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}

function label(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());
}

export default function HomePage() {
  const [countries, setCountries] = useState<Country[]>(COUNTRIES.map((name, i) => ({ name, position: i + 1 })));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Country | null>(null);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [profileSearch, setProfileSearch] = useState("");
  const [form, setForm] = useState({ applicant_name: "", email: "", country_code: "", website: "", social_links: "", reason: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const countryResult = await supabase.from("africa_countries").select("*").order("position");
      if (active && countryResult.data?.length === 54) setCountries(countryResult.data as Country[]);
      const organizationResult = await supabase
        .from("organizations")
        .select("id,name,country,badge_serial,verification_score")
        .eq("status", "approved")
        .order("name")
        .limit(100);
      if (active) setOrgs((organizationResult.data || []) as Organization[]);
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter((country) => country.name.toLowerCase().includes(term) || String(country.code || "").toLowerCase().includes(term));
  }, [countries, search]);

  const profiles = useMemo(() => {
    const term = profileSearch.trim().toLowerCase();
    if (!term) return orgs;
    return orgs.filter((org) => `${org.name} ${org.country || ""}`.toLowerCase().includes(term));
  }, [orgs, profileSearch]);

  async function submitVerification(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    if (!supabase) {
      setMessage("Service Supabase indisponible.");
      setSubmitting(false);
      return;
    }
    const result = await supabase.from("verification_requests").insert({
      applicant_name: form.applicant_name,
      email: form.email || null,
      country_code: form.country_code,
      website: form.website || null,
      social_links: form.social_links ? { links: form.social_links.split(/[,\n]+/).map((x) => x.trim()).filter(Boolean) } : {},
      reason: form.reason || null,
      status: "pending"
    });
    if (result.error) setMessage(`Impossible d’envoyer la demande : ${result.error.message}`);
    else {
      setMessage("Demande envoyée. Elle sera examinée avant l’attribution du badge.");
      setForm({ applicant_name: "", email: "", country_code: "", website: "", social_links: "", reason: "" });
    }
    setSubmitting(false);
  }

  return (
    <main className="bv-page">
      <header className="bv-header">
        <a className="bv-brand" href="#accueil"><img src={badgeUrl} alt="Bickri Verified" /> <span>Bickri <b>Verified</b></span></a>
        <nav className="bv-nav">
          <a href="#accueil">Accueil</a><a href="#pays">54 pays</a><a href="#verification">Vérification</a><a href="#annuaire">Annuaire</a><a href="#ceo">CEO</a>
        </nav>
        <a className="bv-button bv-dark" href="#verification">Demander le badge</a>
      </header>

      <section id="accueil" className="bv-hero bv-wrap">
        <div className="bv-hero-copy">
          <p className="bv-eyebrow">BICKRI VERIFIED · AFRIQUE</p>
          <h1>Une identité.<br /><em>Une confiance.</em><br />Pour toute l’Afrique.</h1>
          <p>Une plateforme panafricaine pour découvrir les 54 pays, consulter leurs informations et accéder aux profils vérifiés.</p>
          <div className="bv-actions"><a className="bv-button bv-primary" href="#pays">Explorer les 54 pays</a><a className="bv-link" href="#verification">Demander une vérification →</a></div>
          <div className="bv-proof"><img src={badgeUrl} alt="Badge Bickri Verified" /><span><b>Vérification panafricaine</b><br />Identité, présence numérique et critères Bickri Verified.</span></div>
        </div>
        <div className="bv-hero-panel"><img src={badgeUrl} alt="Badge Bickri Verified" /><span>54 PAYS</span><strong>Bickri Verified</strong><p>Un espace clair pour explorer l’Afrique et identifier les profils vérifiés.</p></div>
      </section>

      <section id="pays" className="bv-section bv-wrap">
        <div className="bv-heading"><div><p className="bv-eyebrow">EXPLORER L’AFRIQUE</p><h2>Les 54 pays africains</h2></div><p>Cherchez un pays ou cliquez directement sur son nom pour afficher toutes les informations disponibles.</p></div>
        <div className="bv-search"><span>⌕</span><input list="africa-country-names" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher parmi les 54 pays africains…" /><datalist id="africa-country-names">{countries.map((country) => <option key={country.name} value={country.name} />)}</datalist></div>
        <p className="bv-count">{filtered.length} pays affiché{filtered.length > 1 ? "s" : ""} sur 54</p>
        <div className="bv-country-grid">{filtered.map((country) => <button className="bv-country" key={country.name} onClick={() => setSelected(country)}><span className="bv-flag">{flag(country.code)}</span><span><strong>{country.name}</strong><small>{country.code || `Pays ${country.position || ""}`}</small></span><b>Voir les informations →</b></button>)}</div>
      </section>

      <section id="verification" className="bv-section bv-light bv-wrap">
        <div className="bv-heading"><div><p className="bv-eyebrow">VÉRIFICATION PANAFRICAINE</p><h2>Demander le badge Bickri Verified</h2></div><p>Chaque demande suit un processus de contrôle avant l’activation du badge public.</p></div>
        <form className="bv-form" onSubmit={submitVerification}>
          <input required value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} placeholder="Nom complet ou nom de l’organisation" />
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail" />
          <select required value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value })}><option value="">Choisir un pays africain</option>{countries.map((country) => <option key={country.name} value={country.code || country.name}>{country.name}</option>)}</select>
          <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Site web (facultatif)" />
          <textarea rows={3} value={form.social_links} onChange={(e) => setForm({ ...form, social_links: e.target.value })} placeholder="Liens sociaux publics (séparés par des virgules)" />
          <textarea rows={4} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Pourquoi souhaitez-vous être vérifié ?" />
          <button className="bv-button bv-primary" disabled={submitting}>{submitting ? "Envoi…" : "Envoyer la demande de vérification"}</button>
          {message && <p className="bv-message">{message}</p>}
        </form>
        <div className="bv-criteria"><b>Contrôles :</b> identité · activité réelle · présence numérique vérifiable · pays africain sélectionné · respect des critères Bickri Verified.</div>
      </section>

      <section id="annuaire" className="bv-section bv-wrap">
        <div className="bv-heading"><div><p className="bv-eyebrow">ANNUAIRE</p><h2>Profils vérifiés</h2></div><p>Seuls les profils approuvés sont affichés.</p></div>
        <div className="bv-search"><span>⌕</span><input value={profileSearch} onChange={(e) => setProfileSearch(e.target.value)} placeholder="Rechercher un profil vérifié…" /></div>
        <div className="bv-profiles">{profiles.map((profile) => <article className="bv-profile" key={profile.id}><img src={badgeUrl} alt="" /><div><h3>{profile.name}</h3><p>{profile.country || "Afrique"}</p></div><strong>✓ Vérifié</strong></article>)}</div>
        {!profiles.length && <div className="bv-empty">Aucun profil vérifié trouvé.</div>}
      </section>

      <section id="ceo" className="bv-section bv-light bv-wrap"><div className="bv-ceo"><div className="bv-avatar">MB</div><div><p className="bv-eyebrow">DIRECTION</p><h2>Mohamed Bickri Jr.</h2><strong>CEO — Bickri Verified</strong><p>Une vision d’identité numérique claire, fiable et accessible à toute l’Afrique.</p></div><img src={badgeUrl} alt="Badge Bickri Verified" /></div></section>
      <footer className="bv-footer">© 2026 Bickri Verified · Innover et réussir.</footer>

      {selected && <div className="bv-modal-backdrop" onClick={() => setSelected(null)}><article className="bv-modal" onClick={(e) => e.stopPropagation()}><button className="bv-close" onClick={() => setSelected(null)} aria-label="Fermer">×</button><p className="bv-eyebrow">FICHE PAYS · INFORMATIONS DISPONIBLES</p><h2>{flag(selected.code)} {selected.name}</h2><div className="bv-info-grid">{Object.entries(selected).filter(([key]) => key !== "position").map(([key, value]) => <div className="bv-info" key={key}><small>{label(key)}</small><strong>{value === "" || value == null ? "Non renseigné" : Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value)}</strong></div>)}</div><button className="bv-button bv-dark bv-full" onClick={() => setSelected(null)}>Fermer</button></article></div>}

      <style jsx global>{`
        html{scroll-behavior:auto}.bv-page{--ink:#122f28;--forest:#174f3d;--green:#b9ed68;--mint:#eff9e7;--paper:#fbfaf6;--line:#dce8d8;--muted:#667b73;background:var(--paper);color:var(--ink);min-height:100vh;font-family:Arial,sans-serif}.bv-page *{box-sizing:border-box}.bv-wrap{max-width:1240px;margin:0 auto;padding-left:32px;padding-right:32px}.bv-header{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px max(20px,calc((100vw - 1240px)/2));background:#fbfaf6;border-bottom:1px solid var(--line)}.bv-brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:1.2rem}.bv-brand img{width:34px;height:34px}.bv-nav{display:flex;gap:22px;font-size:.82rem}.bv-nav a:hover{text-decoration:underline}.bv-button{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:11px;padding:13px 18px;font-weight:800;cursor:pointer;text-decoration:none}.bv-primary{background:var(--green);color:var(--ink)}.bv-dark{background:var(--ink);color:#fff}.bv-full{width:100%;margin-top:18px}.bv-hero{min-height:650px;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:60px;padding-top:65px;padding-bottom:75px}.bv-eyebrow{font-size:.67rem;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#5b8d57;margin:0 0 17px}.bv-hero h1{font-size:clamp(3rem,6vw,6.3rem);line-height:.94;letter-spacing:-.07em;margin:0}.bv-hero h1 em{font-family:Georgia,serif;font-weight:400}.bv-hero-copy>p:not(.bv-eyebrow){max-width:600px;color:var(--muted);font-size:1.02rem;margin:27px 0}.bv-actions{display:flex;gap:18px;align-items:center;flex-wrap:wrap}.bv-link{font-weight:800;font-size:.84rem}.bv-proof{display:flex;gap:12px;align-items:center;margin-top:38px;color:var(--muted);font-size:.73rem}.bv-proof img{width:48px;height:48px}.bv-hero-panel{min-height:430px;border-radius:28px;background:var(--forest);color:#fff;padding:45px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}.bv-hero-panel img{width:155px;height:155px;margin-bottom:25px}.bv-hero-panel span{color:var(--green);font-size:.72rem;letter-spacing:.16em;font-weight:800}.bv-hero-panel strong{font-size:2rem;margin-top:8px}.bv-hero-panel p{color:#c8d8cf;max-width:350px}.bv-section{padding-top:90px;padding-bottom:100px}.bv-light{background:var(--mint)}.bv-heading{display:flex;justify-content:space-between;align-items:end;gap:45px}.bv-heading h2{font-size:clamp(2.1rem,4.5vw,4.5rem);line-height:1;letter-spacing:-.06em;margin:0}.bv-heading>p{max-width:420px;color:var(--muted);margin:0 0 4px}.bv-search{display:flex;align-items:center;gap:10px;margin-top:32px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px 16px}.bv-search span{font-size:1.2rem}.bv-search input{border:0;outline:0;background:transparent;width:100%;font-size:1rem}.bv-count{font-size:.75rem;color:var(--muted);margin:12px 0}.bv-country-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.bv-country{display:flex;align-items:center;gap:11px;text-align:left;padding:14px;background:#fff;border:1px solid var(--line);border-radius:12px;color:var(--ink);cursor:pointer}.bv-country:hover{border-color:#78aa59}.bv-country .bv-flag{font-size:1.3rem}.bv-country span:nth-child(2){display:grid;min-width:0;flex:1}.bv-country strong{font-size:.88rem}.bv-country small{font-size:.65rem;color:#83948e}.bv-country>b{font-size:.63rem;white-space:nowrap}.bv-form{max-width:820px;margin:35px auto 0;display:grid;gap:12px}.bv-form input,.bv-form select,.bv-form textarea{width:100%;padding:14px;border:1px solid var(--line);border-radius:11px;background:#fff;color:var(--ink);outline:0}.bv-form textarea{resize:vertical}.bv-message{text-align:center;color:var(--muted);font-size:.8rem}.bv-criteria{max-width:820px;margin:25px auto 0;padding:18px;background:#fff;border:1px solid var(--line);border-radius:12px;color:var(--muted);font-size:.78rem}.bv-profiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:25px}.bv-profile{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--line);border-radius:15px;padding:18px}.bv-profile img{width:45px;height:45px}.bv-profile h3{margin:0;font-size:1rem}.bv-profile p{margin:2px 0 0;color:var(--muted);font-size:.72rem}.bv-profile strong{margin-left:auto;color:#57944b;font-size:.65rem}.bv-empty{text-align:center;padding:35px;color:var(--muted)}.bv-ceo{display:grid;grid-template-columns:100px 1fr 120px;gap:28px;align-items:center;background:#fff;border:1px solid var(--line);border-radius:24px;padding:40px}.bv-avatar{width:100px;height:100px;border-radius:50%;display:grid;place-items:center;background:var(--forest);color:var(--green);font-weight:900;font-size:1.4rem}.bv-ceo h2{font-size:clamp(2rem,4vw,3.8rem);letter-spacing:-.05em;margin:0}.bv-ceo p:not(.bv-eyebrow){color:var(--muted)}.bv-ceo>img{width:110px;height:110px;justify-self:end}.bv-footer{padding:25px 32px;text-align:center;color:var(--muted);font-size:.72rem;border-top:1px solid var(--line)}.bv-modal-backdrop{position:fixed;inset:0;z-index:100;background:rgba(8,22,17,.62);display:flex;align-items:center;justify-content:center;padding:20px}.bv-modal{position:relative;background:var(--paper);border-radius:22px;max-width:900px;width:100%;max-height:90vh;overflow:auto;padding:36px}.bv-modal h2{font-size:clamp(2rem,5vw,3.5rem);margin:0 0 25px}.bv-close{position:absolute;right:18px;top:14px;border:0;background:transparent;font-size:2rem;cursor:pointer;color:var(--ink)}.bv-info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.bv-info{background:#fff;border:1px solid var(--line);border-radius:11px;padding:13px;display:grid;gap:5px}.bv-info small{font-size:.64rem;text-transform:uppercase;letter-spacing:.08em;color:#6b847a}.bv-info strong{font-size:.82rem;overflow-wrap:anywhere}@media(max-width:900px){.bv-nav{display:none}.bv-hero{grid-template-columns:1fr;gap:35px}.bv-country-grid,.bv-profiles{grid-template-columns:1fr 1fr}.bv-heading{display:block}.bv-heading>p{margin-top:18px}.bv-ceo{grid-template-columns:78px 1fr}.bv-ceo>img{width:80px;height:80px}}@media(max-width:620px){.bv-wrap{padding-left:18px;padding-right:18px}.bv-header{padding:13px 18px}.bv-header>.bv-button{display:none}.bv-hero{padding-top:45px}.bv-hero-panel{min-height:340px;padding:30px}.bv-country-grid,.bv-profiles,.bv-info-grid{grid-template-columns:1fr}.bv-ceo{grid-template-columns:1fr;text-align:center}.bv-avatar{margin:auto}.bv-ceo>img{justify-self:center}.bv-modal{padding:28px 18px}}
      `}</style>
    </main>
  );
}
