"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const badgeUrl = "/badges/bickri-verified-badge.svg";
const heroPhoto = "https://images.unsplash.com/photo-1739286547828-989197737687?auto=format&fit=crop&fm=jpg&q=90&w=1800";

type Country = { code: string; name: string; position: number };
type Organization = {
  id: string; name: string; country: string | null; category: string | null; slug: string | null;
  public_id: string | null; badge_serial: string | null; verification_score: number | null;
  verified_at: string | null; website_url: string | null;
};
type Plan = { id: string; code: string; name: string; duration_months: number; price_xof: number; popular: boolean };
type Criterion = { code: string; name: string; description: string; position: number };

const AFRICA_COUNTRIES: Country[] = [
  ["DZ","Algérie"],["AO","Angola"],["BJ","Bénin"],["BW","Botswana"],["BF","Burkina Faso"],["BI","Burundi"],["CV","Cap-Vert"],["CM","Cameroun"],["CF","République centrafricaine"],["TD","Tchad"],["KM","Comores"],["CG","République du Congo"],["CD","République démocratique du Congo"],["CI","Côte d’Ivoire"],["DJ","Djibouti"],["EG","Égypte"],["GQ","Guinée équatoriale"],["ER","Érythrée"],["SZ","Eswatini"],["ET","Éthiopie"],["GA","Gabon"],["GM","Gambie"],["GH","Ghana"],["GN","Guinée"],["GW","Guinée-Bissau"],["KE","Kenya"],["LS","Lesotho"],["LR","Libéria"],["LY","Libye"],["MG","Madagascar"],["MW","Malawi"],["ML","Mali"],["MR","Mauritanie"],["MU","Maurice"],["MA","Maroc"],["MZ","Mozambique"],["NA","Namibie"],["NE","Niger"],["NG","Nigéria"],["RW","Rwanda"],["ST","São Tomé-et-Príncipe"],["SN","Sénégal"],["SC","Seychelles"],["SL","Sierra Leone"],["SO","Somalie"],["ZA","Afrique du Sud"],["SS","Soudan du Sud"],["SD","Soudan"],["TZ","Tanzanie"],["TG","Togo"],["TN","Tunisie"],["UG","Ouganda"],["ZM","Zambie"],["ZW","Zimbabwe"]
].map(([code,name], i) => ({ code, name, position: i + 1 }));

const CATEGORIES = [
  ["agriculture","Agriculture"],["énergie","Énergie"],["eau","Eau"],["mobilité","Mobilité"],["notoriété","Notoriété"],
  ["artiste","Artiste"],["auteur","Auteur"],["entrepreneur","Entrepreneur"],["expert","Expert"],["formateur","Formateur"],
  ["créateur de contenu","Créateur de contenu"],["personnalité publique","Personnalité publique"],["autre profil humain","Autre profil humain"],
  ["professionnel de santé","Professionnel de santé"],["enseignant","Enseignant"],["chercheur","Chercheur"],["juriste","Juriste"],
  ["avocat","Avocat"],["ingénieur","Ingénieur"],["architecte","Architecte"],["scientifique","Scientifique"],["journaliste","Journaliste"],
  ["sportif","Sportif"],["musicien","Musicien"],["photographe","Photographe"],["réalisateur","Réalisateur"],["auteur-compositeur","Auteur-compositeur"],["autre","Autre"]
] as const;

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/[A-Z]/g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}

function labelForCategory(value: string | null) {
  return CATEGORIES.find(([key]) => key === value)?.[1] ?? value ?? "Autre";
}

export default function HomePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [countries, setCountries] = useState<Country[]>(AFRICA_COUNTRIES);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [applicantCountry, setApplicantCountry] = useState("");
  const [verificationQuery, setVerificationQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState<Organization | null>(null);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const [orgRes, countryRes, planRes, criterionRes] = await Promise.all([
        supabase.from("organizations").select("id,name,country,category,slug,public_id,badge_serial,verification_score,verified_at,website_url").eq("status","approved").order("name").limit(200),
        supabase.from("africa_countries").select("code,name,position").order("position"),
        supabase.from("subscription_plans").select("id,code,name,duration_months,price_xof,popular").eq("active",true).order("duration_months"),
        supabase.from("badge_criteria").select("code,name,description,position").eq("active",true).order("position")
      ]);
      setOrganizations((orgRes.data as Organization[]) ?? []);
      if ((countryRes.data ?? []).length === 54) setCountries(countryRes.data as Country[]);
      setPlans((planRes.data as Plan[]) ?? []);
      setCriteria((criterionRes.data as Criterion[]) ?? []);
    }
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return organizations.filter((org) => {
      const searchable = `${org.name} ${org.country ?? ""} ${org.category ?? ""}`.toLowerCase();
      return (!q || searchable.includes(q)) && (country === "all" || org.country === country) && (category === "all" || (org.category ?? "autre") === category);
    });
  }, [organizations, search, country, category]);

  const applicantCountryOptions = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    return countries.filter((item) => !q || item.name.toLowerCase().includes(q));
  }, [countries, countrySearch]);

  function verifyBadge() {
    const q = verificationQuery.trim().toLowerCase();
    if (!q) { setVerificationResult(null); setVerificationMessage("Entrez un numéro de badge ou un identifiant public."); return; }
    const match = organizations.find((org) => [org.badge_serial, org.public_id, org.slug].filter(Boolean).some((value) => value!.toLowerCase() === q));
    if (match) { setVerificationResult(match); setVerificationMessage(""); }
    else { setVerificationResult(null); setVerificationMessage("Aucun badge vérifié trouvé avec cet identifiant."); }
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!applicantCountry) { setStatus("Veuillez sélectionner votre pays."); return; }
    setStatus("Envoi de la candidature…");
    const { data: authData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = authData?.user ?? null;
    const payload = {
      applicant_name: String(form.get("applicant_name") ?? "").trim(),
      applicant_email: String(form.get("applicant_email") ?? "").trim(),
      applicant_country: applicantCountry,
      applicant_category: String(form.get("applicant_category") ?? "autre"),
      evidence_url: String(form.get("evidence_url") ?? "").trim() || null,
      impact_summary: String(form.get("impact_summary") ?? "").trim(),
      applicant_user_id: user?.id ?? null,
      status: "submitted"
    };
    if (!supabase) { setStatus("Supabase n’est pas configuré."); return; }
    const { error } = await supabase.from("badge_applications").insert(payload);
    setStatus(error ? `Candidature non envoyée : ${error.message}` : "Candidature envoyée. Notre équipe pourra maintenant l’examiner.");
    if (!error) { event.currentTarget.reset(); setApplicantCountry(""); setCountrySearch(""); }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#accueil"><span className="brand-mark"><img src={badgeUrl} alt="" /></span><span>Bickri <span className="brand-accent">Verified</span></span></a>
        <nav className="main-nav"><a href="#badge">Badge</a><a href="#verification">Vérifier</a><a href="#annuaire">Annuaire</a><a href="#pays">54 pays</a><a href="#ceo">CEO</a></nav>
        <a className="button button-dark button-small" href="#candidature">Candidater ↗</a>
      </header>

      <section id="accueil" className="hero section-wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Une confiance pensée pour l’Afrique</p>
          <h1>Le <em>Badge Vert</em><br />qui inspire confiance.</h1>
          <p className="hero-text">Bickri Verified crée un repère numérique panafricain pour les personnes, professionnels, entreprises, associations et projets dont l’identité et les preuves peuvent être examinées.</p>
          <div className="hero-actions"><a className="button button-primary" href="#annuaire">Explorer l’annuaire →</a><a className="text-link" href="#verification">Vérifier un badge ↘</a></div>
          <div className="hero-proof"><span className="proof-badge"><img src={badgeUrl} alt="Badge Vert Africain" /></span><span><strong>54 pays africains</strong><br />une plateforme pensée pour toute l’Afrique</span></div>
        </div>
        <div className="hero-photo-wrap"><img className="hero-photo" src={heroPhoto} alt="Deux adultes africains souriants utilisant un téléphone ensemble" /><div className="photo-caption"><img src={badgeUrl} alt="Badge Bickri Verified" /><div><strong>Confiance vérifiée</strong><span>Un repère numérique panafricain</span></div></div></div>
      </section>

      <section id="badge" className="section-light badge-story"><div className="section-wrap two-col"><div><p className="eyebrow">Le Badge Vert Africain</p><h2>Plus qu’un symbole.<br /><em>Une preuve de confiance.</em></h2></div><div className="story-copy"><p>La plateforme structure l’identité, les éléments de preuve, le pays, la catégorie et l’historique de chaque profil validé. Le badge ne remplace pas votre réputation : il rend votre dossier plus lisible.</p><div className="feature-row"><div><b>01</b><strong>Identité</strong><span>Nom, pays, catégorie et profil public.</span></div><div><b>02</b><strong>Preuves</strong><span>Liens et éléments présentés à l’évaluation.</span></div><div><b>03</b><strong>Statut</strong><span>Badge, score et dates de vérification.</span></div></div></div></div></section>

      <section id="verification" className="verify-section section-wrap">
        <div className="verify-card"><div><p className="eyebrow">Vérification publique</p><h2>Vérifier un Badge Vert.</h2><p>Entrez le numéro du badge, l’identifiant public ou le slug du profil.</p></div><div className="verify-box"><div className="verify-input"><input value={verificationQuery} onChange={(e) => setVerificationQuery(e.target.value)} placeholder="Ex. BV-2026-0001" onKeyDown={(e) => { if (e.key === "Enter") verifyBadge(); }} /><button className="button button-primary" type="button" onClick={verifyBadge}>Vérifier</button></div>{verificationMessage && <p className="verify-message">{verificationMessage}</p>}{verificationResult && <article className="verification-result"><div className="verified-icon"><img src={badgeUrl} alt="" /></div><div><div className="result-title"><h3>{verificationResult.name}</h3><span>✓ Vérifié</span></div><p>{verificationResult.country ?? "Afrique"} · {labelForCategory(verificationResult.category)}</p><small>{verificationResult.badge_serial ?? verificationResult.public_id ?? verificationResult.slug}</small></div><div className="score">{verificationResult.verification_score ?? "—"}<span>/100</span></div></article>}</div></div>
      </section>

      <section id="annuaire" className="directory section-wrap"><div className="section-heading"><div><p className="eyebrow">L’annuaire panafricain</p><h2>Les acteurs vérifiés</h2></div><p className="section-intro">Recherchez par nom, pays et catégorie. Seuls les profils approuvés apparaissent publiquement.</p></div>
        <div className="directory-tools"><label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un profil" /></label><select value={country} onChange={(e) => setCountry(e.target.value)}><option value="all">Tous les pays</option>{countries.map((item) => <option key={item.code} value={item.name}>{flagEmoji(item.code)} {item.name}</option>)}</select><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Toutes les catégories</option>{CATEGORIES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="category-cloud">{CATEGORIES.filter(([value]) => value !== "autre").map(([value,label]) => <button type="button" key={value} className={category === value ? "category-chip active" : "category-chip"} onClick={() => setCategory(category === value ? "all" : value)}>{label}</button>)}</div>
        <div className="directory-count"><strong>{filtered.length}</strong> profil{filtered.length > 1 ? "s" : ""} visible{filtered.length > 1 ? "s" : ""}</div>
        <div className="organization-grid">{filtered.map((org) => <article className="org-card" key={org.id}><div className="org-top"><span className="org-logo"><img src={badgeUrl} alt="" /></span><span className="verified">✓ Vérifié</span></div><h3>{org.name}</h3><p>{org.country ?? "Afrique"}</p><div className="org-meta"><span className="tag">{labelForCategory(org.category)}</span>{org.verification_score !== null && <span className="score-mini">Score {org.verification_score}/100</span>}</div>{org.badge_serial && <code>{org.badge_serial}</code>}{org.website_url && <a className="profile-link" href={org.website_url} target="_blank" rel="noreferrer">Site officiel ↗</a>}</article>)}</div>
        {filtered.length === 0 && <p className="empty-state">Aucun profil ne correspond à votre recherche. Consultez les 54 pays ou déposez une candidature.</p>}
      </section>

      <section id="pays" className="countries section-light"><div className="section-wrap"><div className="section-heading"><div><p className="eyebrow">Couverture panafricaine</p><h2>Les 54 pays d’Afrique</h2></div><p className="section-intro">Chaque pays possède son choix, son drapeau et son rang. Le même sélecteur est utilisé dans la candidature.</p></div><div className="country-search"><input value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Rechercher un pays…" /></div><div className="country-grid">{countries.map((item) => <button type="button" key={item.code} className={country === item.name ? "country-pill active" : "country-pill"} onClick={() => { setCountry(item.name); document.getElementById("annuaire")?.scrollIntoView({ behavior: "smooth" }); }}><span className="flag">{flagEmoji(item.code)}</span><span><small>{String(item.position).padStart(2,"0")}</small> {item.name}</span></button>)}</div></div></section>

      <section id="fonctionnement" className="process section-wrap"><p className="eyebrow">Comment ça marche</p><div className="process-heading"><h2>Une reconnaissance<br /><em>fondée sur les faits.</em></h2><p>Un parcours simple pour présenter votre dossier, examiner les preuves et publier un statut vérifié.</p></div><div className="steps"><article><span>01</span><h3>Candidature</h3><p>Identité, pays, catégorie, preuves et résumé d’impact.</p></article><article><span>02</span><h3>Évaluation</h3><p>Les éléments sont examinés selon des critères structurés.</p></article><article><span>03</span><h3>Publication</h3><p>Après validation, le profil apparaît dans l’annuaire avec son badge.</p></article></div></section>

      <section className="criteria section-wrap"><div className="criteria-card"><div><p className="eyebrow">Nos critères</p><h2>Mesurer ce qui<br /><em>compte vraiment.</em></h2></div><div className="criteria-list">{(criteria.length ? criteria : [{code:"impact",name:"Impact positif",description:"Actions concrètes, résultats documentés et bénéfices durables.",position:1},{code:"fiabilite",name:"Fiabilité",description:"Informations cohérentes, preuves accessibles et identité claire.",position:2},{code:"collectif",name:"Impact collectif",description:"Inclusion, emploi, innovation et valeur créée pour les communautés.",position:3}]).map((item) => <div key={item.code}><span>{String(item.position).padStart(2,"0")}</span><strong>{item.name}</strong><p>{item.description}</p></div>)}</div></div></section>

      {plans.length > 0 && <section className="plans section-wrap"><div className="section-heading"><div><p className="eyebrow">Plans de vérification</p><h2>Choisissez votre durée</h2></div><p className="section-intro">Les offres actives enregistrées dans Supabase apparaissent ici automatiquement.</p></div><div className="plans-grid">{plans.map((plan) => <article className={plan.popular ? "plan-card popular" : "plan-card"} key={plan.id}>{plan.popular && <span className="popular-label">Populaire</span>}<h3>{plan.name}</h3><strong>{plan.price_xof.toLocaleString("fr-FR")} F</strong><p>{plan.duration_months} mois</p><a className="button button-dark" href="#candidature">Commencer</a></article>)}</div></section>}

      <section id="ceo" className="ceo section-wrap"><div className="ceo-card"><div className="ceo-avatar">MBJ</div><div><p className="eyebrow">Direction</p><h2>Mohamed Bickri Jr.</h2><p className="ceo-role">Fondateur & CEO — Bickri Verified</p><p className="ceo-text">Une vision panafricaine : développer un repère numérique moderne et crédible pour mettre en avant les personnes et professionnels qui construisent des solutions utiles en Afrique.</p></div><img className="ceo-badge" src={badgeUrl} alt="Badge Bickri Verified" /></div></section>

      <section id="candidature" className="apply"><div className="section-wrap"><p className="eyebrow">Candidature</p><h2>Demander le Badge Vert Africain</h2><p className="form-note">Le formulaire peut être envoyé même sans compte. Si vous êtes connecté, votre candidature est liée à votre compte Supabase.</p><form onSubmit={submitApplication}><div className="form-grid"><label>Nom du profil ou de l’organisation<input name="applicant_name" required maxLength={160} /></label><label>Email<input name="applicant_email" type="email" required /></label></div><label>Catégorie<select name="applicant_category" defaultValue="entrepreneur">{CATEGORIES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="country-picker-field"><label>Pays</label><div className="selected-country"><span>{applicantCountry ? `${flagEmoji(countries.find((item) => item.name === applicantCountry)?.code ?? "")} ${applicantCountry}` : "Aucun pays sélectionné"}</span><strong>{applicantCountry ? "✓ Sélectionné" : "Sélection obligatoire"}</strong></div><input aria-label="Rechercher votre pays" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Rechercher votre pays…" /><div className="mini-country-grid">{applicantCountryOptions.slice(0,12).map((item) => <button type="button" key={item.code} className={applicantCountry === item.name ? "mini-country selected" : "mini-country"} onClick={() => setApplicantCountry(item.name)}>{flagEmoji(item.code)} {item.name}</button>)}</div></div><label>Lien de preuve ou site (facultatif)<input name="evidence_url" type="url" placeholder="https://..." /></label><label>Résumé d’impact<textarea name="impact_summary" required minLength={20} maxLength={3000} placeholder="Présentez brièvement votre activité, vos résultats et ce qui peut être vérifié." /></label><button className="button button-primary submit-button" type="submit">Envoyer la candidature ↗</button><p className="status" role="status">{status}</p></form></div></section>

      <footer className="site-footer"><span className="brand"><span className="brand-mark"><img src={badgeUrl} alt="" /></span>Bickri <span className="brand-accent">Verified</span></span><p>© 2026 Bickri Verified · Badge Vert Africain · 54 pays.</p></footer>
    </main>
  );
}
