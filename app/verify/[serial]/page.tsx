import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const badgeUrl = "/badges/bickri-verified-badge.svg";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  const db = getSupabase();
  if (!db) notFound();

  const { data: profile } = await db
    .from("public_verified_profiles")
    .select("display_name,country_code,badge_serial,verification_score,verified_at,public_url_slug,active")
    .eq("badge_serial", serial)
    .eq("active", true)
    .maybeSingle();

  if (!profile) notFound();

  const { data: organization } = await db
    .from("organizations")
    .select("name,country,city,category,website_url,logo_url,description,status,badge_issued_at,badge_expires_at")
    .eq("badge_serial", profile.badge_serial)
    .eq("status", "approved")
    .maybeSingle();

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://bickri-verified.vercel.app";
  const verificationUrl = `${origin}/verify/${encodeURIComponent(profile.badge_serial)}`;
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verificationUrl)}&size=220&margin=2`;
  const verifiedDate = new Date(profile.verified_at).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="page">
      <header className="header">
        <a href="/" className="brand">
          <img src={badgeUrl} alt="Bickri Verified" />
          <span>Bickri <b>Verified</b></span>
        </a>
        <a href="/" className="back">← Retour à Bickri Verified</a>
      </header>

      <section className="verifyWrap">
        <div className="status"><span>✓</span> VÉRIFICATION AUTHENTIQUE</div>
        <h1>Badge vert vérifié</h1>
        <p className="intro">Ce profil est actuellement enregistré comme vérifié dans le registre public Bickri Verified.</p>

        <div className="card">
          <div className="identity">
            {organization?.logo_url ? (
              <img className="avatar" src={organization.logo_url} alt="" />
            ) : (
              <img className="avatar" src={badgeUrl} alt="Badge Bickri Verified" />
            )}
            <div>
              <div className="verifiedLine">✓ Vérifié par Bickri Verified</div>
              <h2>{profile.display_name}</h2>
              <p>{organization?.country || profile.country_code || "Afrique"}{organization?.city ? ` · ${organization.city}` : ""}</p>
            </div>
          </div>

          <div className="grid">
            <div><small>Identifiant du badge</small><strong>{profile.badge_serial}</strong></div>
            <div><small>Date de vérification</small><strong>{verifiedDate}</strong></div>
            <div><small>Score de vérification</small><strong>{profile.verification_score ?? 100}/100</strong></div>
            <div><small>Statut</small><strong className="green">Actif</strong></div>
            {organization?.category && <div><small>Catégorie</small><strong>{organization.category}</strong></div>}
            {organization?.website_url && <div><small>Site officiel déclaré</small><a href={organization.website_url} target="_blank" rel="noreferrer">Ouvrir le site →</a></div>}
          </div>

          {organization?.description && <p className="description">{organization.description}</p>}

          <div className="qrBox">
            <div>
              <h3>Vérifier ce badge</h3>
              <p>Scannez le QR Code pour revenir directement sur cette page publique de vérification.</p>
              <code>{verificationUrl}</code>
            </div>
            <img src={qrUrl} alt="QR Code de vérification Bickri Verified" width={180} height={180} />
          </div>
        </div>

        <p className="notice">Le badge vert Bickri Verified est attribué après examen d'une demande. La présence de cette page confirme uniquement le statut affiché ci-dessus et ne constitue pas une certification gouvernementale.</p>
      </section>

      <footer>© 2026 Bickri Verified · Bickri Service Agency</footer>

      <style>{`
        *{box-sizing:border-box}body{margin:0;background:#f5faf7;color:#10271d;font-family:Inter,Arial,sans-serif}.page{min-height:100vh}.header{height:72px;background:#fff;border-bottom:1px solid #e3ebe6;display:flex;align-items:center;justify-content:space-between;padding:0 6%;gap:20px}.brand{display:flex;align-items:center;gap:10px;color:#10271d;text-decoration:none;font-weight:900}.brand img{width:40px;height:40px}.brand b{color:#10ad49}.back{font-size:12px;color:#587066;text-decoration:none}.verifyWrap{width:min(850px,92%);margin:55px auto 70px}.status{display:inline-flex;align-items:center;gap:7px;background:#e6f8ed;color:#078c3c;border-radius:20px;padding:8px 12px;font-size:10px;font-weight:900;letter-spacing:.05em}.status span{width:17px;height:17px;background:#10b94c;color:#fff;border-radius:50%;display:grid;place-items:center}.verifyWrap h1{font-size:42px;letter-spacing:-1.5px;margin:17px 0 8px}.intro{color:#687a71;line-height:1.6;font-size:13px}.card{margin-top:28px;background:#fff;border:1px solid #dce8e1;border-radius:20px;padding:28px;box-shadow:0 18px 55px #123d2710}.identity{display:flex;align-items:center;gap:18px;border-bottom:1px solid #e8efeb;padding-bottom:24px}.avatar{width:78px;height:78px;border-radius:18px;object-fit:cover}.verifiedLine{font-size:10px;color:#0b9d44;font-weight:900}.identity h2{margin:5px 0;font-size:25px}.identity p{margin:0;color:#74847d;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.grid>div{background:#f5f9f6;border-radius:10px;padding:13px}.grid small{display:block;color:#75857d;font-size:9px;margin-bottom:5px}.grid strong,.grid a{font-size:12px;color:#19372a;text-decoration:none;word-break:break-word}.grid .green{color:#079a42}.description{color:#53665d;font-size:12px;line-height:1.7;margin:22px 0}.qrBox{margin-top:22px;background:#063b2b;color:#fff;border-radius:14px;padding:20px;display:flex;justify-content:space-between;align-items:center;gap:20px}.qrBox h3{margin:0 0 7px;font-size:17px}.qrBox p{color:#c3d8ce;font-size:11px;line-height:1.5;max-width:420px}.qrBox code{display:block;color:#8de5ad;font-size:9px;word-break:break-all}.qrBox img{background:#fff;border-radius:8px;padding:5px;flex:0 0 auto}.notice{font-size:10px;color:#77867f;line-height:1.6;margin-top:18px}footer{background:#022b1d;color:#9fb9ae;padding:28px 6%;font-size:10px}@media(max-width:620px){.header{padding:0 4%}.back{display:none}.verifyWrap{margin-top:35px}.verifyWrap h1{font-size:34px}.card{padding:18px}.identity{align-items:flex-start}.grid{grid-template-columns:1fr}.qrBox{flex-direction:column;align-items:flex-start}.qrBox img{align-self:center}}
      `}</style>
    </main>
  );
}
