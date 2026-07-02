import { useState, useEffect } from "react";

const STORAGE_KEY = "boutiqueInventory_v1";
const LICENSE_KEY = "boutiqueInventory_v1_license";
const TRIAL_DAYS = 14;
const VALID_KEYS = ["BOUT-DEMO-TRIAL-0001", "BOUT-AIFARMS-VIP-002"];
const BRAND = { color: "#9333ea", light: "#f3e8ff", dark: "#6b21a8" };

function daysLeft(expiry) { if (!expiry) return 0; return Math.max(0, Math.ceil((new Date(expiry) - new Date()) / 86400000)); }
function isExpired(expiry) { if (!expiry) return true; return new Date(expiry) < new Date(); }
function loadLicense() { try { const r = localStorage.getItem(LICENSE_KEY); if (r) return JSON.parse(r); } catch (_) {} return null; }
function saveLicense(lic) { try { localStorage.setItem(LICENSE_KEY, JSON.stringify(lic)); } catch (_) {} }

// ── INSTITUTION HELPERS (Update 5) ───────────────────────────────────────────
function loadInstitution(key) {
  try { return JSON.parse(localStorage.getItem(key + "_inst")) || { name: "", address: "" }; } catch { return { name: "", address: "" }; }
}
function saveInstitution(key, inst) {
  try { localStorage.setItem(key + "_inst", JSON.stringify(inst)); } catch {}
}


// ── LICENCE EXPIRY BANNER (Update 8) ─────────────────────────────────────────
function ExpiryBanner({ expiry, phone }) {
  if (!expiry || expiry === "—") return null;
  const days = Math.ceil((new Date(expiry) - new Date()) / 86400000);
  if (days > 30) return null;
  const bg  = days <= 7 ? "#dc2626" : "#d97706";
  const msg = days <= 0
    ? `Licence has expired — contact ${phone||"0597147460"} to renew`
    : days <= 7
      ? `⚠ Licence expires in ${days} day${days!==1?"s":""} — renew immediately`
      : `Licence expires in ${days} day${days!==1?"s":""} — contact ${phone||"0597147460"} to renew`;
  return (
    <div style={{ background: bg, color: "#fff", textAlign: "center", padding: "7px 16px", fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
      {msg}
    </div>
  );
}


// ── RESET MODAL (Update 1) ───────────────────────────────────────────────────
function ResetModal({ onConfirm, onCancel, adminPin, accent, cardBg }) {
  const [pin,  setPin]  = useState("");
  const [err,  setErr]  = useState("");
  const [step, setStep] = useState(1);
  const check = () => { if (pin !== String(adminPin)) { setErr("Incorrect PIN."); return; } setStep(2); };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:20 }}>
      <div style={{ background: cardBg||"#1f2330", border:"1px solid #ef444455", borderRadius:14, padding:28, width:"min(94vw,400px)" }}>
        {step === 1 ? (<>
          <div style={{ fontSize:18, fontWeight:800, color:"#ef4444", marginBottom:8 }}>🔐 Admin PIN Required</div>
          <p style={{ fontSize:13, color:"#94a3b8", marginBottom:16 }}>Enter your admin PIN to access the reset function.</p>
          <input type="password" inputMode="numeric" maxLength={6} value={pin}
            onChange={e=>{setPin(e.target.value.replace(/\D/g,""));setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&check()} placeholder="••••" autoFocus
            style={{ width:"100%", padding:12, background:"rgba(255,255,255,0.06)", border:`1.5px solid ${err?"#ef4444":"rgba(255,255,255,0.15)"}`, borderRadius:8, color:"#fff", fontSize:20, textAlign:"center", letterSpacing:6, outline:"none", boxSizing:"border-box", marginBottom:8, fontFamily:"inherit" }} />
          {err && <div style={{ color:"#fca5a5", fontSize:12, marginBottom:8 }}>{err}</div>}
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <button onClick={onCancel} style={{ flex:1, padding:"10px 0", background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"#94a3b8", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={check}    style={{ flex:1, padding:"10px 0", background:accent||"#2E86AB", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Verify PIN</button>
          </div>
        </>) : (<>
          <div style={{ fontSize:18, fontWeight:800, color:"#ef4444", marginBottom:8 }}>⚠️ Confirm Full Reset</div>
          <p style={{ fontSize:13, color:"#94a3b8", marginBottom:6, lineHeight:1.7 }}>This will <strong style={{ color:"#ef4444" }}>permanently delete ALL data</strong> in this app — records, settings, everything.</p>
          <p style={{ fontSize:13, color:"#ef4444", fontWeight:700, marginBottom:20 }}>This cannot be undone.</p>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onCancel}  style={{ flex:1, padding:"10px 0", background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"#94a3b8", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button onClick={onConfirm} style={{ flex:1, padding:"10px 0", background:"#dc2626", color:"#fff", border:"none", borderRadius:8, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>Delete All Data</button>
          </div>
        </>)}
      </div>
    </div>
  );
}



const sampleProducts = [
  { id: "b1", name: "Ankara Wrap Dress", category: "Dresses", size: "M", color: "Multi", qty: 5, unit: "piece", costPrice: 120, sellPrice: 200, lowStockThreshold: 3, supplier: "Accra Fabric House", supplierPhone: "020-000-0031", lastRestocked: "2026-06-10" },
  { id: "b2", name: "Lace Blouse", category: "Tops", size: "L", color: "White", qty: 2, unit: "piece", costPrice: 75, sellPrice: 130, lowStockThreshold: 3, supplier: "Accra Fabric House", supplierPhone: "020-000-0031", lastRestocked: "2026-06-08" },
  { id: "b3", name: "Kente Skirt", category: "Skirts", size: "S", color: "Gold/Black", qty: 8, unit: "piece", costPrice: 90, sellPrice: 160, lowStockThreshold: 3, supplier: "Kumasi Kente Works", supplierPhone: "020-000-0032", lastRestocked: "2026-06-12" },
  { id: "b4", name: "Denim Jacket", category: "Outerwear", size: "XL", color: "Blue", qty: 1, unit: "piece", costPrice: 180, sellPrice: 290, lowStockThreshold: 2, supplier: "TrendLine Imports", supplierPhone: "020-000-0033", lastRestocked: "2026-05-30" },
  { id: "b5", name: "Silk Scarf", category: "Accessories", size: "One Size", color: "Red", qty: 12, unit: "piece", costPrice: 35, sellPrice: 65, lowStockThreshold: 4, supplier: "Accra Fabric House", supplierPhone: "020-000-0031", lastRestocked: "2026-06-15" },
  { id: "b6", name: "Wide-Leg Trousers", category: "Bottoms", size: "M", color: "Camel", qty: 4, unit: "piece", costPrice: 110, sellPrice: 185, lowStockThreshold: 3, supplier: "TrendLine Imports", supplierPhone: "020-000-0033", lastRestocked: "2026-06-11" },
];

const sampleSales = [
  { id: "s1", productId: "b1", productName: "Ankara Wrap Dress", size: "M", color: "Multi", qty: 1, sellPrice: 200, total: 200, date: "2026-06-25", note: "Walk-in customer" },
  { id: "s2", productId: "b3", productName: "Kente Skirt", size: "S", color: "Gold/Black", qty: 2, sellPrice: 160, total: 320, date: "2026-06-26", note: "Online order" },
  { id: "s3", productId: "b5", productName: "Silk Scarf", size: "One Size", color: "Red", qty: 3, sellPrice: 65, total: 195, date: "2026-06-24", note: "" },
];

function loadData() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (r) return JSON.parse(r);
  } catch (_) {}
  return { products: sampleProducts, sales: sampleSales };
}

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => `GH₵ ${Number(n).toFixed(2)}`;
const today = () => new Date().toISOString().slice(0, 10);

const CATEGORIES = ["Dresses", "Tops", "Bottoms", "Skirts", "Outerwear", "Accessories", "Shoes", "Bags", "Other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size", "6", "8", "10", "12", "14", "36", "38", "40", "42"];

const iStyle = { width: "100%", padding: "8px 10px", border: "1.5px solid #e9d5ff", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", background: "#fff" };

function Badge({ bg, text, children }) {
  return <span style={{ background: bg, color: text, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

function StockBar({ qty, threshold }) {
  const pct = Math.min(100, threshold > 0 ? (qty / (threshold * 3)) * 100 : 100);
  const color = qty === 0 ? "#ef4444" : qty <= threshold ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", width: 64, display: "inline-block" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color }} />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "24px 26px", width: "min(94vw,490px)", maxHeight: "88vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: BRAND.dark }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b21a8", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

// ── LICENSE SCREEN ───────────────────────────────────────────────────────────
function LicenseScreen({ onActivate }) {
  const [mode, setMode] = useState("trial");
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  const startTrial = () => {
    const expiry = new Date(); expiry.setDate(expiry.getDate() + TRIAL_DAYS);
    const lic = { type: "trial", key: null, expiry: expiry.toISOString(), issued: new Date().toISOString() };
    saveLicense(lic); onActivate(lic);
  };

  const activateKey = () => {
    const k = key.toUpperCase().trim();
    if (!k) { setErr("Enter a license key."); return; }
    const validFormat = /^BOUT-[A-Z0-9]{2,8}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(k) || VALID_KEYS.includes(k);
    if (!validFormat) { setErr("Invalid license key. Format: BOUT-XXXX-XXXX-XXXX"); return; }
    const planSeg = k.split("-")[1] || "";
    let days = 365;
    if (planSeg === "TRIAL") days = TRIAL_DAYS;
    else if (planSeg === "1M") days = 30;
    else if (planSeg === "6M") days = 182;
    else if (planSeg === "12M") days = 365;
    else if (/^\d+Y$/.test(planSeg)) days = Math.round(parseInt(planSeg) * 365);
    const expiry = new Date(); expiry.setDate(expiry.getDate() + days);
    const lic = { type: "licensed", key: k, expiry: expiry.toISOString(), issued: new Date().toISOString() };
    saveLicense(lic); onActivate(lic);
  };

  const saveInst = (inst) => { setInstitution(inst); saveInstitution(LICENSE_KEY, inst); };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${BRAND.color} 0%, #6b21a8 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 30px", width: "min(94vw,420px)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👗</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: BRAND.dark }}>My Boutique</div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>Boutique Inventory Manager</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button onClick={() => { setMode("trial"); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "2px solid #e9d5ff", background: mode === "trial" ? BRAND.color : "#fff", color: mode === "trial" ? "#fff" : "#374151", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Free Trial</button>
          <button onClick={() => { setMode("activate"); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "2px solid #e9d5ff", background: mode === "activate" ? BRAND.color : "#fff", color: mode === "activate" ? "#fff" : "#374151", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Activate License</button>
        </div>

        {mode === "trial" && (
          <div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "0 0 14px" }}>
              Start a <strong>{TRIAL_DAYS}-day free trial</strong>. All features unlocked — inventory, sales, restock, and reports. No card required.
            </p>
            <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "#92400e" }}>
              Trial includes full access. Purchase a license before expiry to keep your data.
            </div>
            <button onClick={startTrial} style={{ width: "100%", padding: "13px 0", background: `linear-gradient(135deg, ${BRAND.color}, ${BRAND.dark})`, color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Start Free Trial
            </button>
          </div>
        )}

        {mode === "activate" && (
          <div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px" }}>Enter your license key to activate.</p>
            <input value={key} onChange={e => { setKey(e.target.value.toUpperCase()); setErr(""); }} onKeyDown={e => e.key === "Enter" && activateKey()}
              placeholder="BOUT-XXXX-XXXX-XXXX"
              style={{ width: "100%", padding: 11, border: "2px solid #e9d5ff", borderRadius: 8, fontSize: 14, textAlign: "center", boxSizing: "border-box", letterSpacing: 2, marginBottom: 8, fontFamily: "monospace" }} />
            {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{err}</div>}
            <button onClick={activateKey} style={{ width: "100%", padding: "13px 0", background: `linear-gradient(135deg, ${BRAND.color}, ${BRAND.dark})`, color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Activate
            </button>
            <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 12, textAlign: "center" }}>
              To purchase a license, contact: gilbert@aifarms.gh
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LicenseExpiredScreen({ license, onRenew }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 30px", width: "min(94vw,420px)", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⏰</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#991b1b", marginBottom: 6 }}>
          {license.type === "trial" ? "Trial Expired" : "License Expired"}
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 20 }}>
          Your {license.type === "trial" ? "free trial" : "license"} ended on {new Date(license.expiry).toLocaleDateString()}.
          Activate a new license key to keep using My Boutique.
        </p>
        <button onClick={onRenew} style={{ width: "100%", padding: "13px 0", background: "#991b1b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
          Activate License
        </button>
      </div>
    </div>
  );
}

// ── BACKUP COMPONENT ─────────────────────────────────────────────────────────
function BoutiqueBackup({ db, setDb, products, sales, showToast }) {
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [fileError, setFileError]           = useState("");

  const download = () => {
    const blob = new Blob([JSON.stringify({ app: "My Boutique", exportedAt: new Date().toISOString(), version: 1, data: db }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `Boutique-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast("Backup downloaded", "success");
  };

  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return; setFileError("");
    const reader = new FileReader();
    reader.onload = () => { try {
      const p = JSON.parse(reader.result);
      if (!p.data) { setFileError("Not a valid backup file."); return; }
      setConfirmRestore(p);
    } catch { setFileError("Could not read file."); } };
    reader.readAsText(file); e.target.value = "";
  };

  const exportCSV = () => {
    const rows = [["Name","Category","Size","Colour","Cost (GH₵)","Price (GH₵)","Qty","Supplier"]];
    (db.products||[]).forEach(p => rows.push([p.name,p.category||"",p.size||"",p.colour||"",p.cost||"",p.price||"",p.qty||0,p.supplier||""]));
    const csv = rows.map(r => r.map(c => `"${String(c||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download = `Boutique-products-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    showToast("CSV exported", "success");
  };

  return (
    <>
      <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: BRAND.dark }}>💾 Backup & Restore</div>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20, maxWidth: 560, lineHeight: 1.6 }}>
        All data lives only in this browser. Download a backup regularly and store it in Google Drive, email, or a USB drive — so you never lose years of records.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Download */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e9d5ff" }}>
          <div style={{ fontWeight: 800, marginBottom: 12, color: BRAND.dark }}>⬇️ Export Backup</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[["Products", products.length], ["Sales", sales.length]].map(([l,v]) => (
              <div key={l} style={{ background: "#fdf4ff", borderRadius: 7, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: BRAND.dark }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={download} style={{ background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 8 }}>
            ⬇️ Download Backup (.json)
          </button>
          <button onClick={exportCSV} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", width: "100%" }}>
            📊 Export Products CSV
          </button>
        </div>
        {/* Restore */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e9d5ff" }}>
          <div style={{ fontWeight: 800, marginBottom: 10, color: BRAND.dark }}>⬆️ Restore from Backup</div>
          <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: "#92400e" }}>
            ⚠️ Restoring overwrites all current data. Export a backup first if needed.
          </div>
          <label style={{ display: "block", textAlign: "center", padding: "10px 16px", borderRadius: 8, border: "1px solid #e9d5ff", color: "#6b7280", cursor: "pointer", fontWeight: 600, background: "#fdf4ff" }}>
            📂 Choose Backup File…
            <input type="file" accept="application/json" onChange={onFile} style={{ display: "none" }} />
          </label>
          {fileError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{fileError}</div>}
        </div>
      </div>

      {confirmRestore && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={() => setConfirmRestore(null)}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "min(94vw,400px)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: BRAND.dark, margin: "0 0 12px" }}>⚠️ Confirm Restore</h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Backup from <strong>{new Date(confirmRestore.exportedAt).toLocaleString()}</strong>.<br/>
              This replaces ALL current data and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmRestore(null)} style={{ flex: 1, background: "transparent", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 0", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setDb(confirmRestore.data); setConfirmRestore(null); showToast("Data restored successfully", "success"); }} style={{ flex: 1, background: "#991b1b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>✅ Yes, Restore</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [license, setLicense] = useState(loadLicense);
  const [institution, setInstitution] = useState(() => loadInstitution(LICENSE_KEY));
  const [showReset, setShowReset] = useState(false);
  const [db, setDb] = useState(loadData);
  const [view, setView] = useState("inventory");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_) {} }, [db]);

  if (!license) return <LicenseScreen onActivate={setLicense} />;
  if (isExpired(license.expiry)) return <LicenseExpiredScreen license={license} onRenew={() => setLicense(null)} />;


  const products = db.products;
  const sales = db.sales;
  const lowStock = products.filter(p => p.qty <= p.lowStockThreshold);
  const outOfStock = products.filter(p => p.qty === 0);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const close = () => { setModal(null); setEditing(null); setForm({}); };
  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const cats = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.size?.toLowerCase().includes(search.toLowerCase()) ||
      p.color?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const totalValue = products.reduce((s, p) => s + p.qty * p.costPrice, 0);
  const totalSalesValue = sales.reduce((s, x) => s + x.total, 0);
  const todaySales = sales.filter(x => x.date === today()).reduce((s, x) => s + x.total, 0);

  const saveProduct = () => {
    const p = {
      id: editing ? editing.id : uid(),
      name: form.name || "Unnamed",
      category: form.category || "Other",
      size: form.size || "",
      color: form.color || "",
      qty: Number(form.qty) || 0,
      unit: "piece",
      costPrice: Number(form.costPrice) || 0,
      sellPrice: Number(form.sellPrice) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 3,
      supplier: form.supplier || "",
      supplierPhone: form.supplierPhone || "",
      lastRestocked: form.lastRestocked || today(),
    };
    setDb(prev => ({
      ...prev,
      products: editing ? prev.products.map(x => x.id === editing.id ? p : x) : [...prev.products, p],
    }));
    showToast(editing ? "Item updated." : "Item added.");
    close();
  };

  const deleteProduct = (id) => {
    setDb(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
    showToast("Item removed.", "warn");
    close();
  };

  const recordSale = () => {
    const product = products.find(p => p.id === form.productId);
    if (!product) return;
    const qty = Number(form.qty) || 1;
    if (qty > product.qty) { showToast("Not enough stock!", "err"); return; }
    const sale = { id: uid(), productId: product.id, productName: product.name, size: product.size, color: product.color, qty, sellPrice: Number(form.sellPrice) || product.sellPrice, total: qty * (Number(form.sellPrice) || product.sellPrice), date: form.date || today(), note: form.note || "" };
    setDb(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? { ...p, qty: p.qty - qty } : p),
      sales: [...prev.sales, sale],
    }));
    showToast(`Sale saved — ${fmt(sale.total)}`);
    close();
  };

  const restock = () => {
    const add = Number(form.addQty) || 0;
    setDb(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === editing.id
        ? { ...p, qty: p.qty + add, lastRestocked: today(), supplier: form.supplier || p.supplier, supplierPhone: form.supplierPhone || p.supplierPhone }
        : p),
    }));
    showToast(`Restocked +${add} pieces`);
    close();
  };

  const toastColors = { ok: "#9333ea", warn: "#f59e0b", err: "#ef4444" };

  const navItems = [
    { id: "inventory", label: "👗 Inventory" },
    { id: "sales", label: "🧾 Sales" },
    { id: "alerts", label: `⚠️ Alerts${lowStock.length ? ` (${lowStock.length})` : ""}` },
    { id: "suppliers", label: "🚚 Suppliers" },
    { id: "backup", label: "💾 Backup" },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#fdf4ff", minHeight: "100vh", color: "#111827" }}>

      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toastColors[toast.type], color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)", padding: "22px 22px 0", color: "#fff" }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 600, letterSpacing: 1.5 }}>BOUTIQUE INVENTORY</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>👗 My Boutique</div>
          {license.type === "trial" && <div style={{ fontSize: 11, marginTop: 4, background: "rgba(255,255,255,0.2)", borderRadius: 6, padding: "2px 8px", display: "inline-block" }}>Trial: {daysLeft(license.expiry)} days left</div>}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 0 }}>
          {[
            { l: "Items", v: products.length },
            { l: "Stock Value", v: fmt(totalValue) },
            { l: "Today's Sales", v: fmt(todaySales) },
            { l: "Low Stock", v: lowStock.length, warn: lowStock.length > 0 },
            { l: "Out of Stock", v: outOfStock.length, warn: outOfStock.length > 0 },
          ].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px 8px 0 0", padding: "8px 14px" }}>
              <div style={{ fontSize: 11, opacity: 0.8 }}>{s.l}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: s.warn ? "#fde68a" : "#fff" }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div style={{ display: "flex", gap: 2, marginTop: 8 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{ background: view === n.id ? "#fff" : "transparent", color: view === n.id ? BRAND.color : "rgba(255,255,255,0.85)", border: "none", borderRadius: "8px 8px 0 0", padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "18px 22px", maxWidth: 1100, margin: "0 auto" }}>

        {/* INVENTORY */}
        {view === "inventory" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, size, color…" style={{ ...iStyle, maxWidth: 260, flex: 1 }} />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...iStyle, maxWidth: 160, width: "auto" }}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => { setForm({ category: "Dresses", size: "M" }); setModal("addProduct"); }}
                style={{ background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ Add Item</button>
              <button onClick={() => { setForm({ productId: products[0]?.id, sellPrice: products[0]?.sellPrice, date: today() }); setModal("recordSale"); }}
                style={{ background: "#fff", color: BRAND.color, border: `2px solid ${BRAND.color}`, borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>🧾 Record Sale</button>
            </div>

            {/* Card grid view for boutique */}
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))" }}>
              {filtered.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 36, color: "#9ca3af", fontSize: 14 }}>No items found. Add your first item above.</div>
              )}
              {filtered.map(p => {
                const isLow = p.qty <= p.lowStockThreshold;
                const isOut = p.qty === 0;
                return (
                  <div key={p.id} style={{
                    background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(147,51,234,0.08)",
                    border: isOut ? "1.5px solid #fecaca" : isLow ? "1.5px solid #fde68a" : "1.5px solid #e9d5ff",
                    position: "relative"
                  }}>
                    {isOut && <div style={{ position: "absolute", top: 10, right: 10 }}><Badge bg="#fef2f2" text="#ef4444">OUT</Badge></div>}
                    {!isOut && isLow && <div style={{ position: "absolute", top: 10, right: 10 }}><Badge bg="#fffbeb" text="#d97706">LOW</Badge></div>}

                    <div style={{ fontSize: 11, color: BRAND.color, fontWeight: 700, marginBottom: 4 }}>{p.category}</div>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2, paddingRight: 40 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
                      {p.size && <span style={{ marginRight: 8 }}>📏 {p.size}</span>}
                      {p.color && <span>🎨 {p.color}</span>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: isOut ? "#ef4444" : isLow ? "#f59e0b" : "#111" }}>{p.qty}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>in stock</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: BRAND.color }}>{fmt(p.sellPrice)}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>cost {fmt(p.costPrice)}</div>
                      </div>
                    </div>

                    <StockBar qty={p.qty} threshold={p.lowStockThreshold} />

                    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                      <button onClick={() => { setEditing(p); setForm({ ...p }); setModal("restock"); }}
                        style={{ flex: 1, background: "#f3e8ff", color: BRAND.color, border: "none", borderRadius: 7, padding: "6px 0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+Stock</button>
                      <button onClick={() => { setEditing(p); setForm({ ...p }); setModal("editProduct"); }}
                        style={{ flex: 1, background: "#f3e8ff", color: BRAND.color, border: "none", borderRadius: 7, padding: "6px 0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Edit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* SALES */}
        {view === "sales" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>Sales History</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>Total revenue: <b style={{ color: BRAND.color }}>{fmt(totalSalesValue)}</b> · {sales.length} transactions</div>
              </div>
              <button onClick={() => { setForm({ productId: products[0]?.id, sellPrice: products[0]?.sellPrice, date: today() }); setModal("recordSale"); }}
                style={{ background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>🧾 Record Sale</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(147,51,234,0.08)" }}>
                <thead>
                  <tr style={{ background: "#f3e8ff" }}>
                    {["Date", "Item", "Size", "Color", "Qty", "Price", "Total", "Note"].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: BRAND.dark }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 && <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: "#9ca3af" }}>No sales yet.</td></tr>}
                  {[...sales].reverse().map((s, i) => (
                    <tr key={s.id} style={{ borderTop: "1px solid #f3e8ff", background: i % 2 === 0 ? "#fff" : "#fdf4ff" }}>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#6b7280" }}>{s.date}</td>
                      <td style={{ padding: "9px 12px", fontWeight: 600, fontSize: 13 }}>{s.productName}</td>
                      <td style={{ padding: "9px 12px", fontSize: 13 }}>{s.size || "—"}</td>
                      <td style={{ padding: "9px 12px", fontSize: 13 }}>{s.color || "—"}</td>
                      <td style={{ padding: "9px 12px", fontSize: 13 }}>{s.qty}</td>
                      <td style={{ padding: "9px 12px", fontSize: 13 }}>{fmt(s.sellPrice)}</td>
                      <td style={{ padding: "9px 12px", fontWeight: 800, color: BRAND.color, fontSize: 13 }}>{fmt(s.total)}</td>
                      <td style={{ padding: "9px 12px", fontSize: 12, color: "#9ca3af" }}>{s.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ALERTS */}
        {view === "alerts" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>⚠️ Stock Alerts</div>
            {lowStock.length === 0
              ? <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: 24, color: "#166534", fontWeight: 600, textAlign: "center" }}>✅ All items are well stocked!</div>
              : (
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))" }}>
                  {lowStock.map(p => (
                    <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(147,51,234,0.08)", borderLeft: `4px solid ${p.qty === 0 ? "#ef4444" : "#f59e0b"}` }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{p.category} · Size {p.size} · {p.color}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <span style={{ fontSize: 26, fontWeight: 900, color: p.qty === 0 ? "#ef4444" : "#f59e0b" }}>{p.qty}</span>
                          <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 3 }}>left</span>
                        </div>
                        <div style={{ textAlign: "right", fontSize: 11, color: "#6b7280" }}>
                          <div>Alert at: {p.lowStockThreshold}</div>
                          <div>{p.supplier || "No supplier"}</div>
                        </div>
                      </div>
                      <button onClick={() => { setEditing(p); setForm({ ...p }); setModal("restock"); }}
                        style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "7px 0", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Restock Now</button>
                    </div>
                  ))}
                </div>
              )
            }
          </>
        )}

        {/* SUPPLIERS */}
        {view === "suppliers" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>🚚 Suppliers</div>
            {/* Group by supplier */}
            {(() => {
              const grouped = {};
              products.filter(p => p.supplier).forEach(p => {
                if (!grouped[p.supplier]) grouped[p.supplier] = { phone: p.supplierPhone, items: [] };
                grouped[p.supplier].items.push(p);
              });
              return Object.entries(grouped).map(([name, data]) => (
                <div key={name} style={{ background: "#fff", borderRadius: 12, padding: 18, marginBottom: 12, boxShadow: "0 2px 8px rgba(147,51,234,0.08)", border: "1px solid #e9d5ff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>🏢 {name}</div>
                      <div style={{ fontSize: 13, color: "#6b7280" }}>📞 {data.phone || "—"}</div>
                    </div>
                    <Badge bg="#f3e8ff" text={BRAND.color}>{data.items.length} item{data.items.length !== 1 ? "s" : ""}</Badge>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {data.items.map(p => (
                      <div key={p.id} style={{ background: "#fdf4ff", borderRadius: 8, padding: "6px 12px", fontSize: 12 }}>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        {p.size && <span style={{ color: "#6b7280" }}> · {p.size}</span>}
                        <span style={{ marginLeft: 6 }}>
                          <Badge bg={p.qty <= p.lowStockThreshold ? "#fffbeb" : "#f0fdf4"} text={p.qty <= p.lowStockThreshold ? "#d97706" : "#16a34a"}>{p.qty} left</Badge>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
            {products.filter(p => p.supplier).length === 0 && <div style={{ color: "#9ca3af", textAlign: "center", padding: 28 }}>No supplier info yet.</div>}
          </>
        )}

        {view === "backup" && <BoutiqueBackup db={db} setDb={setDb} products={products} sales={sales} showToast={showToast} />}
      </div>

      {/* ADD / EDIT */}
      {(modal === "addProduct" || modal === "editProduct") && (
        <Modal title={modal === "addProduct" ? "Add Item" : "Edit Item"} onClose={close}>
          <Row label="Item Name"><input style={iStyle} type="text" value={form.name || ""} onChange={f("name")} /></Row>
          <Row label="Category">
            <select style={iStyle} value={form.category || ""} onChange={f("category")}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Row>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Row label="Size">
              <select style={iStyle} value={form.size || ""} onChange={f("size")}>
                <option value="">Select</option>
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Row>
            <Row label="Color"><input style={iStyle} type="text" placeholder="e.g. Red" value={form.color || ""} onChange={f("color")} /></Row>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Row label="Qty"><input style={iStyle} type="number" value={form.qty ?? ""} onChange={f("qty")} /></Row>
            <Row label="Low Stock Alert"><input style={iStyle} type="number" value={form.lowStockThreshold ?? 3} onChange={f("lowStockThreshold")} /></Row>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Row label="Cost (GH₵)"><input style={iStyle} type="number" value={form.costPrice ?? ""} onChange={f("costPrice")} /></Row>
            <Row label="Sell (GH₵)"><input style={iStyle} type="number" value={form.sellPrice ?? ""} onChange={f("sellPrice")} /></Row>
          </div>
          <Row label="Supplier Name"><input style={iStyle} type="text" value={form.supplier || ""} onChange={f("supplier")} /></Row>
          <Row label="Supplier Phone"><input style={iStyle} type="text" value={form.supplierPhone || ""} onChange={f("supplierPhone")} /></Row>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={saveProduct} style={{ flex: 1, background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>
              {modal === "addProduct" ? "Add Item" : "Save Changes"}
            </button>
            {modal === "editProduct" && (
              <button onClick={() => { if (window.confirm("Delete this item?")) deleteProduct(editing.id); }} style={{ background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Delete</button>
            )}
          </div>
        </Modal>
      )}

      {/* RECORD SALE */}
      {modal === "recordSale" && (
        <Modal title="Record a Sale" onClose={close}>
          <Row label="Item">
            <select style={iStyle} value={form.productId || ""} onChange={e => { const p = products.find(x => x.id === e.target.value); setForm(prev => ({ ...prev, productId: e.target.value, sellPrice: p?.sellPrice || 0 })); }}>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.size}/{p.color}) — {p.qty} left</option>)}
            </select>
          </Row>
          <Row label="Qty"><input style={iStyle} type="number" min="1" value={form.qty ?? 1} onChange={f("qty")} /></Row>
          <Row label="Selling Price (GH₵)"><input style={iStyle} type="number" value={form.sellPrice ?? ""} onChange={f("sellPrice")} /></Row>
          <Row label="Date"><input style={iStyle} type="date" value={form.date || today()} onChange={f("date")} /></Row>
          <Row label="Note (optional)"><input style={iStyle} type="text" placeholder="e.g. customer name, online order" value={form.note || ""} onChange={f("note")} /></Row>
          {form.qty && form.sellPrice && (
            <div style={{ background: "#f3e8ff", borderRadius: 8, padding: "9px 14px", marginBottom: 12, fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Total: {fmt(Number(form.qty) * Number(form.sellPrice))}</div>
          )}
          <button onClick={recordSale} style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Save Sale</button>
        </Modal>
      )}

      {/* RESTOCK */}
      {modal === "restock" && editing && (
        <Modal title={`Restock — ${editing.name}`} onClose={close}>
          <div style={{ background: "#f3e8ff", borderRadius: 8, padding: "9px 14px", marginBottom: 14, fontSize: 14, color: BRAND.dark }}>
            Current stock: <b>{editing.qty} pieces</b> · Size {editing.size} · {editing.color}
          </div>
          <Row label="Add Quantity"><input style={iStyle} type="number" min="1" value={form.addQty || ""} onChange={f("addQty")} /></Row>
          <Row label="Supplier"><input style={iStyle} type="text" value={form.supplier || ""} onChange={f("supplier")} /></Row>
          <Row label="Supplier Phone"><input style={iStyle} type="text" value={form.supplierPhone || ""} onChange={f("supplierPhone")} /></Row>
          <button onClick={restock} style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Confirm Restock</button>
        </Modal>
      )}
    </div>
  );
}
