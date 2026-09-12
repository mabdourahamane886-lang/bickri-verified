"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const badgeUrl = "/badges/bickri-verified-badge.svg";
const heroPhoto = "https://images.unsplash.com/photo-1644043350898-2f4ff1e17912?auto=format&fit=crop&fm=jpg&q=85&w=1600";

type Country = { code: string; name: string; position: number };
type Organization = { id: string; name: string; country: string | null; category: string | null; slug: string | null };

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/[A-Z]/g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}

const categories = [
  ["agriculture", "Agriculture"], ["énergie", "Énergie"], ["eau", "Eau"], ["mobilité", "Mobilité"],
  ["notoriété", "Notoriété"], ["artiste", "Artiste"], ["auteur", "Auteur"], ["entrepreneur", "Entrepreneur"],
  ["expert", "Expert"], ["formateur", "Formateur"], ["créateur de contenu", "Créateur de contenu"],
  ["personnalité publique", "Personnalité publique"], ["autre profil humain", "Autre profil humain"], ["autre", "Autre"],
] as const;

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
    return (!q || org.name.toLowerCase().includes(q) || (org.country ?? "").toLowerCase().includes(q))
      && (country === "all" || (org.country ?? "") === country)
      && (category === "all" || (org.category ?? "autre").toLowerCase() === category);
  }), [organizations, search, country, category]);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Envoi en cours…");
    const form = new FormData(event.currentTarget);
    const payload = {
      applicant_name: String(form.get("applicant_name") ?? ""),
      applicant_email: String(form.get("applicant_email") ?? ""),
      applicant_country: String(form.get("applicant_country") ?? ""),
      applicant_category: String(form.get("applicant_category") ?? ""),
      evidence_url: String(form.get("evidence_url") ?? "") || null,
      impact_summary: String(form.get("impact_summary") ?? ""),
    };
    if (!supabase) { setStatus("Supabase n’est pas configuré."); return; }
    const { error } = await supabase.from("badge_applications").insert(payload);
    setStatus(error ? "Impossible d’envoyer la candidature." : "Candidature envoyée avec succès.");
    if (!error) event.currentTarget.reset();
  }

  return (
    <main>
      <header className="site-header"><a className="brand" href="#accueil"><span className="brand-mark"><img src={badgeUrl} alt="" /></span><span>Bickri <span className="brand-accent">Verified</span></span></a><nav className="main-nav"><a href="#badge">Le badge</a><a href="#annuaire">Annuaire</a><a href="#pays">54 pays</a><a href="#ceo">CEO</a></nav><a className="button button-dark button-small" href="#obtenir">Obtenir le badge ↗</a></header>

      <section id="accueil" className="hero section-wrap"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot" /> Une confiance pensée pour l’Afrique</p><h1>Le <em>Badge Vert</em><br />qui inspire confiance.</h1><p className="hero-text">Bickri Verified valorise les personnes, entreprises, associations et projets africains dont l’identité, l’engagement et les preuves peuvent être examinés et reconnus.</p><div className="hero-actions"><a className="button button-primary" href="#annuaire">Explorer l’annuaire →</a><a className="text-link" href="#badge">Découvrir le badge ↘</a></div><div className="hero-proof"><span className="proof-badge"><img src={badgeUrl} alt="Badge Vert Africain" /></span><span><strong>{countries.length || 54} pays</strong><br />une identité panafricaine</span></div></div><div className="hero-photo-wrap"><img className="hero-photo" src={heroPhoto} alt="Un homme et une femme africains souriants regardant un téléphone ensemble à Lagos" /><div className="photo-caption"><img src={badgeUrl} alt="Badge Bickri Verified" /><div><strong>Confiance vérifiée</strong><span>Un repère numérique panafricain</span></div></div></div></section>

      <section id="badge" className="badge-story section-light"><div className="section-wrap two-col"><div><p className="eyebrow">Le Badge Vert Africain</p><h2>Plus qu’un symbole.<br /><em>Une preuve de confiance.</em></h2></div><div className="story-copy"><p>Le badge sert de repère de confiance pour découvrir des profils africains dont les informations et les preuves sont structurées dans un système de vérification.</p><div className="feature-row"><div><b>01</b><strong>Identité claire</strong><span>Profil public et informations structurées.</span></div><div><b>02</b><strong>Preuves</strong><span>Liens, résultats et éléments vérifiables.</span></div><div><b>03</b><strong>Historique</strong><span>Émission, statut et évolution du badge.</span></div></div></div></div></section>

      <section id="annuaire" className="directory section-wrap"><div className="section-heading"><div><p className="eyebrow">L’annuaire panafricain</p><h2>Les acteurs vérifiés</h2></div><p className="section-intro">Filtrez par nom, catégorie ou pays.</p></div><div className="directory-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une organisation ou un profil" /></label><select value={country} onChange={(e) => setCountry(e.target.value)}><option value="all">Tous les pays d’Afrique</option>{countries.map((item) => <option key={item.code} value={item.name}>{flagEmoji(item.code)} {item.name}</option>)}</select><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Toutes les catégories</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="category-cloud">{categories.filter(([value]) => value !== "autre").map(([value, label]) => <button type="button" key={value} className={category === value ? "category-chip active" : "category-chip"} onClick={() => setCategory(category === value ? "all" : value)}>{label}</button>)}</div><div className="organization-grid">{filtered.map((org) => <article className="org-card" key={org.id}><div className="org-top"><span className="org-logo"><img src={badgeUrl} alt="" /></span><span className="verified">✓ Vérifié</span></div><h3>{org.name}</h3><p>{org.country ?? "Afrique"}</p><div className="org-meta"><span className="tag">{categories.find(([value]) => value === (org.category ?? "autre"))?.[1] ?? org.category ?? "Autre"}</span></div></article>)}</div>{filtered.length === 0 && <p className="empty-state">Aucun profil ne correspond à votre recherche.</p>}</section>

      <section id="pays" className="countries section-light"><div className="section-wrap"><div className="section-heading"><div><p className="eyebrow">Couverture panafricaine</p><h2>Les 54 pays d’Afrique</h2></div><p className="section-intro">Tous les pays apparaissent avec leur drapeau et sont sélectionnables.</p></div><div className="country-grid">{countries.map((item) => <button type="button" key={item.code} className={country === item.name ? "country-pill active" : "country-pill"} onClick={() => { setCountry(item.name); document.getElementById("annuaire")?.scrollIntoView({ behavior: "smooth" }); }}><span className="flag">{flagEmoji(item.code)}</span><span>{String(item.position).padStart(2,"0")}. {item.name}</span></button>)}</div></div></section>

      <section id="fonctionnement" className="process section-wrap"><p className="eyebrow">Comment ça marche</p><div className="process-heading"><h2>Une reconnaissance<br /><em>fondée sur les faits.</em></h2><p>Candidature, examen des preuves, décision de validation et publication du statut.</p></div><div className="steps"><article><span>01</span><h3>Candidature</h3><p>Présentez votre identité, votre pays, votre catégorie et vos preuves.</p></article><article><span>02</span><h3>Évaluation</h3><p>Les éléments sont étudiés selon des critères transparents.</p></article><article><span>03</span><h3>Vérification</h3><p>Après validation, votre profil et votre badge sont publiés.</p></article></div></section>

      <section className="criteria section-wrap"><div className="criteria-card"><div><p className="eyebrow">Nos critères</p><h2>Mesurer ce qui<br /><em>compte vraiment.</em></h2></div><div className="criteria-list"><div><span>01</span><strong>Impact positif</strong><p>Actions concrètes, résultats documentés et bénéfices durables.</p></div><div><span>02</span><strong>Fiabilité</strong><p>Informations cohérentes, preuves accessibles et identité claire.</p></div><div><span>03</span><strong>Impact collectif</strong><p>Inclusion, emploi, innovation et valeur créée pour les communautés.</p></div></div></div></section>

      <section id="ceo" className="ceo section-wrap"><div className="ceo-card"><div className="ceo-avatar">MBJ</div><div><p className="eyebrow">Direction</p><h2>Mohamed Bickri Jr.</h2><p className="ceo-role">Fondateur & CEO — Bickri Verified</p><p className="ceo-text">Une vision panafricaine : développer un repère numérique moderne et crédible pour mettre en avant les personnes et organisations qui construisent des solutions utiles en Afrique.</p></div><img className="ceo-badge" src={badgeUrl} alt="Badge Bickri Verified" /></div></section>

      <section id="obtenir" className="cta"><div className="section-wrap"><p className="eyebrow">Rejoindre le programme</p><h2>Votre identité et votre impact méritent<br /><em>d’être reconnus.</em></h2><a className="button button-light" href="#candidature">Déposer une candidature ↗</a></div></section>

      <section id="candidature" className="apply"><div className="section-wrap"><p className="eyebrow">Candidature</p><h2>Demander le Badge Vert Africain</h2><form onSubmit={submitApplication}><div className="form-grid"><label>Nom de l’organisation<input name="applicant_name" required maxLength={160} /></label><label>Email<input name="applicant_email" type="email" required /></label></div><label>Pays<select name="applicant_country" required defaultValue=""><option value="" disabled>Choisir votre pays</option>{countries.map((item) => <option key={item.code} value={item.name}>{flagEmoji(item.code)} {item.name}</option>)}</select></label><label>Catégorie<select name="applicant_category" required defaultValue=""><option value="" disabled>Choisir une catégorie</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Lien vers une preuve ou votre site<input name="evidence_url" type="url" placeholder="https://..." /></label><label>Présentez votre impact<textarea name="impact_summary" required maxLength={5000} /></label><button className="button button-primary" type="submit">Envoyer la candidature ↗</button><p className="status" role="status">{status}</p></form></div></section>

      <footer className="site-footer"><span className="brand"><span className="brand-mark"><img src={badgeUrl} alt="" /></span>Bickri <span className="brand-accent">Verified</span></span><p>© 2026 Bickri Verified · Badge Vert Africain · 54 pays.</p></footer>
    </main>
  );
}
