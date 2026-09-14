"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type RequestRow = {
  id: string;
  applicant_name: string;
  applicant_email: string | null;
  country_code: string | null;
  website: string | null;
  reason: string | null;
  status: string;
  submitted_at: string;
  badge_serial: string | null;
  rejection_reason: string | null;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) { setAdmin(false); return; }
    setAdmin(true);
    const { data, error } = await supabase
      .from("verification_requests")
      .select("id,applicant_name,applicant_email,country_code,website,reason,status,submitted_at,badge_serial,rejection_reason")
      .order("submitted_at", { ascending: false });
    if (error) setMessage(error.message);
    else setRequests((data || []) as RequestRow[]);
  }

  useEffect(() => { load(); }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return setMessage("Supabase n’est pas configuré.");
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else await load();
    setLoading(false);
  }

  async function approve(id: string) {
    if (!supabase || !userId) return;
    setLoading(true); setMessage("");
    const { error } = await supabase.rpc("approve_verification_request", { p_request_id: id, p_reviewed_by: userId });
    if (error) setMessage(error.message); else await load();
    setLoading(false);
  }

  async function reject(id: string) {
    if (!supabase || !userId) return;
    const reason = window.prompt("Motif du refus :", "Les éléments fournis ne permettent pas encore de valider la demande.");
    if (!reason) return;
    setLoading(true); setMessage("");
    const { error } = await supabase.rpc("reject_verification_request", { p_request_id: id, p_reason: reason, p_reviewed_by: userId });
    if (error) setMessage(error.message); else await load();
    setLoading(false);
  }

  if (!admin) return (
    <main className="auth">
      <div className="authCard">
        <img src="/badges/bickri-verified-badge.svg" alt="Bickri Verified" />
        <span>ESPACE ADMINISTRATION</span>
        <h1>Bickri Verified</h1>
        <p>Connectez-vous avec le compte administrateur existant pour examiner les demandes.</p>
        <form onSubmit={login}>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" />
          <button disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button>
        </form>
        {message && <div className="error">{message}</div>}
        <a href="/">← Retour à la plateforme</a>
      </div>
      <style jsx>{css}</style>
    </main>
  );

  return (
    <main className="dashboard">
      <header><a href="/">Bickri <b>Verified</b></a><button onClick={async () => { await supabase?.auth.signOut(); setAdmin(false); }}>Se déconnecter</button></header>
      <section>
        <div className="title"><div><span>ADMINISTRATION</span><h1>Demandes de vérification</h1><p>Chaque approbation attribue un identifiant de badge unique et active une page publique de vérification.</p></div><a href="/">Voir la plateforme →</a></div>
        {message && <div className="notice">{message}</div>}
        <div className="list">
          {!requests.length && <div className="empty">Aucune demande pour le moment.</div>}
          {requests.map(r => (
            <article key={r.id}>
              <div className="row"><div><span className={`status ${r.status}`}>{r.status}</span><h2>{r.applicant_name}</h2><small>{r.applicant_email || "E-mail non fourni"} · {r.country_code || "Pays non indiqué"}</small></div><small>{new Date(r.submitted_at).toLocaleString("fr-FR")}</small></div>
              {r.website && <a href={r.website} target="_blank" rel="noreferrer">{r.website}</a>}
              {r.reason && <p>{r.reason}</p>}
              {r.badge_serial && <code>Badge : {r.badge_serial}</code>}
              {r.rejection_reason && <p className="error">Refus : {r.rejection_reason}</p>}
              {r.status !== "approved" && r.status !== "rejected" && <div className="actions"><button className="approve" disabled={loading} onClick={() => approve(r.id)}>✓ Approuver et attribuer le badge</button><button className="reject" disabled={loading} onClick={() => reject(r.id)}>Refuser</button></div>}
            </article>
          ))}
        </div>
      </section>
      <style jsx>{dashboardCss}</style>
    </main>
  );
}

const css = `*{box-sizing:border-box}body{margin:0;background:#f4faf7;font-family:Inter,Arial,sans-serif;color:#10271d}.auth{min-height:100vh;display:grid;place-items:center;padding:20px}.authCard{width:min(420px,100%);background:#fff;border:1px solid #dce9e1;border-radius:20px;padding:30px;box-shadow:0 20px 60px #103b2612}.authCard img{width:62px}.authCard span{display:block;color:#0a9d45;font-size:9px;font-weight:900;margin-top:20px}.authCard h1{margin:8px 0;font-size:30px}.authCard p{font-size:12px;color:#6c7c74;line-height:1.6}.authCard form{display:grid;gap:10px;margin:20px 0}.authCard input{padding:13px;border:1px solid #d4e1da;border-radius:9px}.authCard button{padding:13px;border:0;border-radius:9px;background:#10b84b;color:#fff;font-weight:900}.authCard a{font-size:11px;color:#557168}.error{margin-top:12px;background:#fff0f0;color:#a12d2d;padding:10px;border-radius:8px;font-size:11px}`;
const dashboardCss = `*{box-sizing:border-box}body{margin:0;background:#f4faf7;font-family:Inter,Arial,sans-serif;color:#10271d}.dashboard header{height:70px;background:#fff;border-bottom:1px solid #e2ebe6;padding:0 6%;display:flex;align-items:center;justify-content:space-between}.dashboard header a{font-weight:900;color:#10271d;text-decoration:none}.dashboard header b{color:#10ad49}.dashboard header button{border:1px solid #cfe0d7;background:#fff;border-radius:8px;padding:9px 13px}.dashboard section{width:min(1000px,90%);margin:45px auto}.title{display:flex;justify-content:space-between;gap:20px;align-items:end}.title span{font-size:9px;color:#0a9d45;font-weight:900}.title h1{font-size:36px;margin:8px 0}.title p{font-size:12px;color:#687970}.title>a{font-size:11px;color:#0a9d45;font-weight:800}.notice{margin:18px 0;background:#e9f7ee;padding:12px;border-radius:9px;font-size:11px}.list{display:grid;gap:14px;margin-top:25px}.list article{background:#fff;border:1px solid #dce9e2;border-radius:15px;padding:20px}.row{display:flex;justify-content:space-between;gap:15px}.row h2{margin:8px 0 4px;font-size:18px}.row small,article>small{color:#728179;font-size:10px}.status{font-size:8px;font-weight:900;text-transform:uppercase;padding:5px 8px;border-radius:15px;background:#eef2ef}.status.pending,.status.submitted,.status.under_review{background:#fff6dc;color:#946d08}.status.approved{background:#e6f8ed;color:#078d3c}.status.rejected{background:#fff0f0;color:#a12d2d}.list article>a{display:block;color:#0a9d45;font-size:10px;margin:10px 0}.list article p{font-size:11px;color:#53655d;line-height:1.6}.list code{font-size:9px;color:#0a9d45}.actions{display:flex;gap:9px;margin-top:15px}.actions button{border:0;border-radius:8px;padding:10px 13px;font-size:10px;font-weight:900;cursor:pointer}.approve{background:#10b84b;color:#fff}.reject{background:#fff0f0;color:#a12d2d}.empty{background:#fff;border:1px dashed #cbdad2;border-radius:12px;padding:35px;text-align:center;color:#74837b;font-size:12px}@media(max-width:600px){.title{display:block}.title>a{display:inline-block;margin-top:12px}.row{display:block}.actions{flex-direction:column}.title h1{font-size:29px}}`;
