"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const badgeUrl = "/badges/bickri-verified-badge.svg";

type Organization = {
  id: string;
  name: string;
  country: string | null;
  category: string | null;
  slug: string | null;
};

export default function HomePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadOrganizations() {
      if (!supabase) return;
      const { data } = await supabase
        .from("organizations")
        .select("id,name,country,category,slug")
        .eq("status", "approved")
        .order("name");
      setOrganizations((data as Organization[]) ?? []);
    }
    loadOrganizations();
  }, []);

  const filtered = useMemo(() => organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || (org.category ?? "autre").toLowerCase() === category;
    return matchesSearch && matchesCategory;
  }), [organizations, search, category]);

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Envoi en cours…");
    const form = new FormData(event.currentTarget);
    const payload = {
      applicant_name: String(form.get("applicant_name") ?? ""),
      applicant_email: String(form.get("applicant_email") ?? ""),
      evidence_url: String(form.get("evidence_url") ?? "") || null,
      impact_summary: String(form.get("impact_summary") ?? ""),
    };

    if (!supabase) {
      setStatus("Supabase n’est pas configuré sur ce déploiement.");
      return;
    }

    const { error } = await supabase.from("badge_applications").insert(payload);
    setStatus(error ? "Impossible d’envoyer la candidature." : "Candidature envoyée avec succès.");
    if (!error) event.currentTarget.reset();
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#accueil"><span className="brand-mark">✓</span><span>Bickri <span className="brand-accent">Verified</span></span></a>
        <nav className="main-nav"><a href="#annuaire">Annuaire</a><a href="#fonctionnement">Processus</a><a href="#criteres">Critères</a></nav>
        <a className="button button-dark button-small" href="#obtenir">Obtenir le badge ↗</a>
      </header>

      <section id="accueil" className="hero section-wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> L&apos;Afrique qui agit</p>
          <h1>Le <em>Badge Vert</em><br />de l&apos;Afrique.</h1>
          <p className="hero-text">Bickri Verified met en lumière les organisations, entrepreneurs et projets africains dont l&apos;engagement positif peut être documenté et vérifié.</p>
          <div className="hero-actions"><a className="button button-primary" href="#annuaire">Explorer l&apos;annuaire →</a><a className="text-link" href="#fonctionnement">Comprendre la vérification ↘</a></div>
          <div className="hero-proof"><span className="proof-badge"><img src={badgeUrl} alt="Badge Vert Africain" /></span><span><strong>{organizations.length}</strong><br />organisations visibles</span></div>
        </div>
        <div className="hero-art"><div className="sun" /><div className="leaf leaf-one" /><div className="leaf leaf-two" /><div className="leaf leaf-three" /><div className="art-badge"><img src={badgeUrl} alt="Bickri Verified — Badge Vert Africain" /><span className="art-label">Confiance · Impact · Afrique</span></div></div>
      </section>

      <section id="annuaire" className="directory section-light">
        <div className="section-wrap">
          <div className="section-heading"><div><p className="eyebrow">L&apos;annuaire</p><h2>Les acteurs vérifiés</h2></div><p className="section-intro">Recherchez les organisations africaines reconnues par le programme.</p></div>
          <div className="directory-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une organisation" /></label><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Toutes les catégories</option><option value="agriculture">Agriculture</option><option value="énergie">Énergie</option><option value="déchets">Déchets</option><option value="eau">Eau</option><option value="mobilité">Mobilité</option><option value="autre">Autre</option></select></div>
          <div className="organization-grid">{filtered.map((org) => <article className="org-card" key={org.id}><div className="org-top"><span className="org-logo">BV</span><span className="verified">✓ Vérifié</span></div><h3>{org.name}</h3><p>{org.country ?? "Afrique"}</p><div className="org-meta"><span className="tag">{org.category ?? "Autre"}</span></div></article>)}</div>
          {filtered.length === 0 && <p className="empty-state">Aucune organisation ne correspond à votre recherche.</p>}
        </div>
      </section>

      <section id="fonctionnement" className="process section-wrap"><p className="eyebrow">Le processus</p><div className="process-heading"><h2>Un badge fondé<br /><em>sur des preuves.</em></h2><p>La reconnaissance repose sur une candidature, une évaluation documentée et une décision de validation.</p></div><div className="steps"><article><span>01</span><h3>Candidature</h3><p>L&apos;organisation présente ses actions, ses résultats et ses preuves.</p></article><article><span>02</span><h3>Évaluation</h3><p>Les éléments sont examinés selon des critères publics et mesurables.</p></article><article><span>03</span><h3>Vérification</h3><p>Après validation, le badge et la fiche publique sont publiés.</p></article></div></section>

      <section id="criteres" className="criteria section-wrap"><div className="criteria-card"><div><p className="eyebrow">Critères</p><h2>Mesurer ce qui<br /><em>compte vraiment.</em></h2></div><div className="criteria-list"><div><span>01</span><strong>Réduction de l&apos;impact</strong><p>Actions mesurables pour préserver les ressources et réduire les impacts.</p></div><div><span>02</span><strong>Économie circulaire</strong><p>Réemploi, valorisation et solutions locales qui prolongent la vie des ressources.</p></div><div><span>03</span><strong>Impact collectif</strong><p>Effets positifs, inclusion et bénéfices durables pour les communautés.</p></div></div></div></section>

      <section id="obtenir" className="cta section-wrap"><p className="eyebrow">Rejoindre le programme</p><h2>Votre impact mérite<br /><em>d&apos;être reconnu.</em></h2><a className="button button-light" href="#candidature">Déposer une candidature ↗</a></section>

      <section id="candidature" className="apply"><div className="section-wrap"><p className="eyebrow">Candidature</p><h2>Demander le Badge Vert Africain</h2><form onSubmit={submitApplication}><div className="form-grid"><label>Nom de l&apos;organisation<input name="applicant_name" required maxLength={160} /></label><label>Email<input name="applicant_email" type="email" required /></label></div><label>Lien vers une preuve ou votre site<input name="evidence_url" type="url" placeholder="https://..." /></label><label>Présentez votre impact<textarea name="impact_summary" required maxLength={5000} /></label><button className="button button-primary" type="submit">Envoyer la candidature ↗</button><p className="status" role="status">{status}</p></form></div></section>

      <footer className="site-footer"><span className="brand"><span className="brand-mark">✓</span>Bickri <span className="brand-accent">Verified</span></span><p>© 2026 Bickri Verified. Badge Vert Africain.</p></footer>
    </main>
  );
}
