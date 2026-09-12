"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const badgeUrl = "/badges/bickri-verified-badge.svg";

type Country = { code: string; name: string; position: number };
type Organization = { id: string; name: string; country: string | null; category: string | null; slug: string | null };

const categoryOptions = [
  ["agriculture", "Agriculture"],
  ["énergie", "Énergie"],
  ["déchets", "Déchets"],
  ["eau", "Eau"],
  ["mobilité", "Mobilité"],
  ["notoriété", "Notoriété"],
  ["artiste", "Artiste"],
  ["auteur", "Auteur"],
  ["entrepreneur", "Entrepreneur"],
  ["expert", "Expert"],
  ["formateur", "Formateur"],
  ["créateur de contenu", "Créateur de contenu"],
  ["personnalité publique", "Personnalité publique"],
  ["autre profil humain", "Autre profil humain"],
  ["autre", "Autre"],
] as const;

function AfricaPeopleIllustration() {
  return (
    <svg className="people-svg" viewBox="0 0 760 620" role="img" aria-label="Deux adultes africains souriants en harmonie, une femme tenant un téléphone pour représenter la confiance et la fiabilité">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#dff7be"/><stop offset="1" stopColor="#b7e486"/></linearGradient>
        <linearGradient id="shirtWoman" x1="0" x2="1"><stop offset="0" stopColor="#e45778"/><stop offset="1" stopColor="#b72e58"/></linearGradient>
        <linearGradient id="shirtMan" x1="0" x2="1"><stop offset="0" stopColor="#f0a43c"/><stop offset="1" stopColor="#c87115"/></linearGradient>
      </defs>
      <rect width="760" height="620" rx="32" fill="url(#bg)"/>
      <circle cx="565" cy="130" r="92" fill="#f5df9b" opacity=".8"/>
      <path d="M0 545 C160 455 280 515 390 548 C520 586 640 520 760 492 V620 H0 Z" fill="#7fb85d"/>
      <path d="M80 520 C130 425 205 385 285 410 L317 575 H45 Z" fill="#4d8f50"/>
      <path d="M545 540 C560 430 650 390 718 424 L760 575 H515 Z" fill="#357b50"/>
      <g transform="translate(120 160)">
        <path d="M80 190 C38 165 22 102 42 63 C68 12 138 4 179 39 C212 66 215 116 194 160 C176 196 128 212 80 190 Z" fill="#6a381f"/>
        <path d="M54 76 C74 42 115 27 151 41 C166 46 184 58 193 79 C169 74 154 70 134 73 C110 78 84 87 54 76 Z" fill="#2a1b17"/>
        <ellipse cx="124" cy="123" rx="58" ry="69" fill="#8b4b29"/>
        <circle cx="103" cy="119" r="7" fill="#251a15"/><circle cx="145" cy="119" r="7" fill="#251a15"/>
        <path d="M98 147 Q124 166 151 146" fill="none" stroke="#3a2019" strokeWidth="7" strokeLinecap="round"/>
        <path d="M72 187 Q125 165 178 191 L212 350 H27 Z" fill="url(#shirtWoman)"/>
        <path d="M91 201 Q124 226 156 201" fill="none" stroke="#f08ca6" strokeWidth="9"/>
        <path d="M47 240 C8 257 0 307 26 323" fill="none" stroke="#8b4b29" strokeWidth="22" strokeLinecap="round"/>
        <path d="M190 218 C212 236 223 250 233 274" fill="none" stroke="#8b4b29" strokeWidth="22" strokeLinecap="round"/>
        <rect x="222" y="255" width="56" height="96" rx="12" transform="rotate(12 222 255)" fill="#1f2730"/>
        <rect x="229" y="264" width="42" height="80" rx="8" transform="rotate(12 229 264)" fill="#cce8ff"/>
        <circle cx="252" cy="333" r="4" fill="#4f6c7a"/>
      </g>
      <g transform="translate(410 120)">
        <path d="M65 198 C30 159 25 92 42 55 C64 7 126 -6 170 23 C212 51 219 112 197 161 C180 201 110 228 65 198 Z" fill="#5f321e"/>
        <path d="M48 81 C55 35 96 7 139 17 C173 25 193 47 201 81 C174 62 157 61 132 64 C101 68 77 82 48 81 Z" fill="#251a16"/>
        <ellipse cx="123" cy="124" rx="57" ry="69" fill="#7f4527"/>
        <circle cx="102" cy="119" r="7" fill="#231914"/><circle cx="143" cy="119" r="7" fill="#231914"/>
        <path d="M97 147 Q124 165 151 146" fill="none" stroke="#3a2019" strokeWidth="7" strokeLinecap="round"/>
        <path d="M69 190 Q125 167 181 191 L226 355 H17 Z" fill="url(#shirtMan)"/>
        <path d="M188 214 C231 225 248 262 255 300" fill="none" stroke="#7f4527" strokeWidth="24" strokeLinecap="round"/>
        <path d="M60 221 C35 246 24 271 17 298" fill="none" stroke="#7f4527" strokeWidth="24" strokeLinecap="round"/>
      </g>
      <g transform="translate(505 468)"><rect width="196" height="54" rx="27" fill="#fff" opacity=".94"/><image href={badgeUrl} width="38" height="38" x="12" y="8"/><text x="60" y="34" fontFamily="Arial" fontSize="16" fontWeight="700" fill="#17352e">Confiance vérifiée</text></g>
    </svg>
  );
}

export default function HomePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [country, setCountry] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const [{ data: orgs }, { data: countryRows }] = await Promise.all([
        supabase.from("organizations").select("id,name,country,category,slug").eq("status", "approved").order("name"),
        supabase.from("africa_countries").select("code,name,position").order("position"),
      ]);
      setOrganizations((orgs as Organization[]) ?? []);
      setCountries((countryRows as Country[]) ?? []);
    }
    loadData();
  }, []);

  const filtered = useMemo(() => organizations.filter((org) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || org.name.toLowerCase().includes(q) || (org.country ?? "").toLowerCase().includes(q);
    const matchesCountry = country === "all" || (org.country ?? "") === country;
    const matchesCategory = category === "all" || (org.category ?? "autre").toLowerCase() === category;
    return matchesSearch && matchesCountry && matchesCategory;
  }), [organizations, search, country, category]);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Envoi en cours…");
    const form = new FormData(event.currentTarget);
    const payload = {
      applicant_name: String(form.get("applicant_name") ?? ""),
      applicant_email: String(form.get("applicant_email") ?? ""),
      applicant_country: String(form.get("applicant_country") ?? ""),
      evidence_url: String(form.get("evidence_url") ?? "") || null,
      impact_summary: String(form.get("impact_summary") ?? ""),
    };
    if (!supabase) { setStatus("Supabase n’est pas configuré sur ce déploiement."); return; }
    const { error } = await supabase.from("badge_applications").insert(payload);
    setStatus(error ? "Impossible d’envoyer la candidature." : "Candidature envoyée avec succès.");
    if (!error) event.currentTarget.reset();
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#accueil"><span className="brand-mark"><img src={badgeUrl} alt="" /></span><span>Bickri <span className="brand-accent">Verified</span></span></a>
        <nav className="main-nav"><a href="#badge">Le badge</a><a href="#annuaire">Annuaire</a><a href="#pays">54 pays</a><a href="#ceo">CEO</a></nav>
        <a className="button button-dark button-small" href="#obtenir">Obtenir le badge ↗</a>
      </header>

      <section id="accueil" className="hero section-wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Une confiance pensée pour l’Afrique</p>
          <h1>Le <em>Badge Vert</em><br />qui inspire confiance.</h1>
          <p className="hero-text">Bickri Verified valorise les personnes, entreprises, associations et projets africains dont l’engagement et l’impact peuvent être documentés, examinés et reconnus.</p>
          <div className="hero-actions"><a className="button button-primary" href="#annuaire">Explorer l’annuaire →</a><a className="text-link" href="#badge">Découvrir le badge ↘</a></div>
          <div className="hero-proof"><span className="proof-badge"><img src={badgeUrl} alt="Badge Vert Africain" /></span><span><strong>54 pays</strong><br />une identité panafricaine</span></div>
        </div>
        <div className="hero-art people-art"><AfricaPeopleIllustration /><div className="floating-card"><img src={badgeUrl} alt="Badge Bickri Verified"/><div><strong>Fiabilité</strong><span>Vérification documentée</span></div></div></div>
      </section>

      <section id="badge" className="badge-story section-light">
        <div className="section-wrap two-col">
          <div><p className="eyebrow">Le Badge Vert Africain</p><h2>Plus qu’un symbole.<br /><em>Une preuve de confiance.</em></h2></div>
          <div className="story-copy"><p>Bickri Verified est conçu comme un repère de confiance pour faciliter la découverte d’acteurs africains sérieux.</p><div className="feature-row"><div><b>01</b><strong>Identité claire</strong><span>Profil public et informations structurées.</span></div><div><b>02</b><strong>Preuves</strong><span>Liens, résultats et éléments vérifiables.</span></div><div><b>03</b><strong>Historique</strong><span>Émission, statut et évolution du badge.</span></div></div></div>
        </div>
      </section>

      <section id="annuaire" className="directory section-wrap">
        <div className="section-heading"><div><p className="eyebrow">L’annuaire panafricain</p><h2>Les acteurs vérifiés</h2></div><p className="section-intro">Filtrez par nom, catégorie ou pays et trouvez rapidement les profils reconnus.</p></div>
        <div className="directory-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une organisation ou un profil" /></label><select value={country} onChange={(e) => setCountry(e.target.value)}><option value="all">Tous les pays d’Afrique</option>{countries.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}</select><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Toutes les catégories</option>{categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="category-cloud">{categoryOptions.filter(([value]) => value !== "autre").map(([value, label]) => <button type="button" key={value} className={category === value ? "category-chip active" : "category-chip"} onClick={() => setCategory(category === value ? "all" : value)}>{label}</button>)}</div>
        <div className="organization-grid">{filtered.map((org) => <article className="org-card" key={org.id}><div className="org-top"><span className="org-logo"><img src={badgeUrl} alt="" /></span><span className="verified">✓ Vérifié</span></div><h3>{org.name}</h3><p>{org.country ?? "Afrique"}</p><div className="org-meta"><span className="tag">{categoryOptions.find(([value]) => value === (org.category ?? "autre"))?.[1] ?? org.category ?? "Autre"}</span></div></article>)}</div>
        {filtered.length === 0 && <p className="empty-state">Aucune organisation ou profil ne correspond à votre recherche.</p>}
      </section>

      <section id="pays" className="countries section-light">
        <div className="section-wrap"><div className="section-heading"><div><p className="eyebrow">Couverture</p><h2>Les 54 pays d’Afrique</h2></div><p className="section-intro">Chaque pays dispose d’une entrée dédiée dans la sélection et dans le parcours de candidature.</p></div><div className="country-grid">{countries.map((item) => <button type="button" key={item.code} className={country === item.name ? "country-pill active" : "country-pill"} onClick={() => { setCountry(item.name); document.getElementById("annuaire")?.scrollIntoView({ behavior: "smooth" }); }}>{String(item.position).padStart(2,"0")} · {item.name}</button>)}</div></div>
      </section>

      <section id="fonctionnement" className="process section-wrap"><p className="eyebrow">Comment ça marche</p><div className="process-heading"><h2>Une reconnaissance<br /><em>fondée sur les faits.</em></h2><p>Le programme combine candidature, examen des preuves, décision de validation et publication du statut.</p></div><div className="steps"><article><span>01</span><h3>Candidature</h3><p>Présentez votre activité, votre pays, vos actions et vos preuves.</p></article><article><span>02</span><h3>Évaluation</h3><p>Les éléments sont étudiés selon des critères transparents et documentés.</p></article><article><span>03</span><h3>Vérification</h3><p>Après validation, votre profil et votre badge sont publiés dans l’annuaire.</p></article></div></section>

      <section className="criteria section-wrap"><div className="criteria-card"><div><p className="eyebrow">Nos critères</p><h2>Mesurer ce qui<br /><em>compte vraiment.</em></h2></div><div className="criteria-list"><div><span>01</span><strong>Impact positif</strong><p>Actions concrètes, résultats documentés et bénéfices durables.</p></div><div><span>02</span><strong>Fiabilité</strong><p>Informations cohérentes, preuves accessibles et identité claire.</p></div><div><span>03</span><strong>Impact collectif</strong><p>Inclusion, emploi, innovation et valeur créée pour les communautés.</p></div></div></div></section>

      <section id="ceo" className="ceo section-wrap"><div className="ceo-card"><div className="ceo-avatar">MBJ</div><div><p className="eyebrow">Direction</p><h2>Mohamed Bickri Jr.</h2><p className="ceo-role">Fondateur & CEO — Bickri Verified</p><p className="ceo-text">Une vision panafricaine : développer un repère numérique simple, moderne et crédible pour mettre en avant les acteurs qui construisent des solutions utiles en Afrique.</p></div><img className="ceo-badge" src={badgeUrl} alt="Badge Bickri Verified" /></div></section>

      <section id="obtenir" className="cta"><div className="section-wrap"><p className="eyebrow">Rejoindre le programme</p><h2>Votre impact mérite<br /><em>d’être reconnu.</em></h2><a className="button button-light" href="#candidature">Déposer une candidature ↗</a></div></section>

      <section id="candidature" className="apply"><div className="section-wrap"><p className="eyebrow">Candidature</p><h2>Demander le Badge Vert Africain</h2><form onSubmit={submitApplication}><div className="form-grid"><label>Nom de l’organisation ou du profil<input name="applicant_name" required maxLength={160} /></label><label>Email<input name="applicant_email" type="email" required /></label></div><label>Pays<select name="applicant_country" required defaultValue=""><option value="" disabled>Choisir votre pays</option>{countries.map((item) => <option key={item.code} value={item.name}>{item.name}</option>)}</select></label><label>Catégorie<select name="category" defaultValue=""><option value="">Choisir votre catégorie</option>{categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Lien vers une preuve ou votre site<input name="evidence_url" type="url" placeholder="https://..." /></label><label>Présentez votre impact<textarea name="impact_summary" required maxLength={5000} /></label><button className="button button-primary" type="submit">Envoyer la candidature ↗</button><p className="status" role="status">{status}</p></form></div></section>

      <footer className="site-footer"><span className="brand"><span className="brand-mark"><img src={badgeUrl} alt="" /></span>Bickri <span className="brand-accent">Verified</span></span><p>© 2026 Bickri Verified · Badge Vert Africain · 54 pays.</p></footer>
    </main>
  );
}
