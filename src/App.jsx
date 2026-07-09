import { useState, useEffect } from "react";

const STORAGE_KEY = "wardrobeSelection_v1";
const LICENSE_KEY = "wardrobeSelection_v1_license";
const USERS_KEY = "wardrobeSelection_users";
const SESSION_KEY = "wardrobeSelection_session";
const TRIAL_DAYS = 14;
const VALID_KEYS = ["TWS-DEMO-TRIAL-0001", "TWS-AIFARMS-VIP-002"];
const BRAND = { color: "#7B2D42", light: "#F7E8EC", dark: "#4A1625" };
const LOGO = "/logo.jpg";

// ── UTILITY FUNCTIONS ────────────────────────────────────────────────────────
function daysLeft(expiry) { if (!expiry) return 0; return Math.max(0, Math.ceil((new Date(expiry) - new Date()) / 86400000)); }
function isExpired(expiry) { if (!expiry) return true; return new Date(expiry) < new Date(); }
function loadLicense() { try { const r = localStorage.getItem(LICENSE_KEY); if (r) return JSON.parse(r); } catch (_) {} return null; }
function saveLicense(lic) { try { localStorage.setItem(LICENSE_KEY, JSON.stringify(lic)); } catch (_) {} }
function hashPassword(pwd) { let h = 0; for (let i = 0; i < pwd.length; i++) { h = ((h << 5) - h) + pwd.charCodeAt(i); h = h & h; } return Math.abs(h).toString(16); }
function comparePassword(pwd, hash) { return hashPassword(pwd) === hash; }

// ── USER MANAGEMENT ──────────────────────────────────────────────────────────
function loadUsers() { try { const r = localStorage.getItem(USERS_KEY); if (r) return JSON.parse(r); } catch (_) {} return []; }
function saveUsers(users) { try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (_) {} }
function loadSession() { try { const r = localStorage.getItem(SESSION_KEY); if (r) return JSON.parse(r); } catch (_) {} return null; }
function saveSession(session) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (_) {} }
function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch (_) {} }

// Initialize admin user if no users exist
function initializeAdminIfNeeded() {
  const users = loadUsers();
  if (users.length === 0) {
    const adminUser = {
      id: "admin-" + Math.random().toString(36).slice(2, 9),
      name: "Admin",
      email: "admin@thewardrobe.com",
      passwordHash: hashPassword("admin123"),
      role: "admin",
      sections: ["inventory", "sales", "alerts", "suppliers", "backup", "settings"],
      createdAt: new Date().toISOString(),
      createdBy: "system",
      active: true
    };
    saveUsers([adminUser]);
    return [adminUser];
  }
  return users;
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

function loadData() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (_) {} return { products: sampleProducts, sales: sampleSales }; }

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => `GH₵ ${Number(n).toFixed(2)}`;
const today = () => new Date().toISOString().slice(0, 10);

const CATEGORIES = ["Dresses", "Tops", "Bottoms", "Skirts", "Outerwear", "Accessories", "Shoes", "Bags", "Other"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size", "6", "8", "10", "12", "14", "36", "38", "40", "42"];
const SECTION_PRESETS = {
  inventory_manager: { label: "Inventory Manager", sections: ["inventory", "alerts", "suppliers"] },
  sales_clerk: { label: "Sales Clerk", sections: ["sales", "inventory", "alerts"] },
  supplier_manager: { label: "Supplier Manager", sections: ["suppliers", "alerts"] },
  report_viewer: { label: "Report Viewer", sections: ["sales", "backup"] },
};

const iStyle = { width: "100%", padding: "8px 10px", border: "1.5px solid #E8C9D1", borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", background: "#fff" };

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
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4A1625", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

// ── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    if (!email || !password) { setErr("Enter email and password."); return; }
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.active);
    if (!user) { setErr("User not found or inactive."); return; }
    if (!comparePassword(password, user.passwordHash)) { setErr("Invalid password."); return; }
    const session = { id: user.id, name: user.name, email: user.email, role: user.role, sections: user.sections };
    saveSession(session);
    onLogin(session);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${BRAND.color} 0%, #5C1A2B 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 30px", width: "min(94vw,420px)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src={LOGO} alt="The Wardrobe Selection" style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 12, borderRadius: 10 }} />
          <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.dark, letterSpacing: -0.3 }}>The Wardrobe Selection</div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Employee Login</div>
        </div>

        <Row label="Email"><input style={iStyle} type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} placeholder="you@boutique.com" /></Row>
        <Row label="Password"><input style={iStyle} type="password" value={password} onChange={e => { setPassword(e.target.value); setErr(""); }} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} /></Row>
        
        {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12, padding: "8px 10px", background: "#fee2e2", borderRadius: 6 }}>{err}</div>}
        
        <button onClick={handleLogin} style={{ width: "100%", padding: "13px 0", background: `linear-gradient(135deg, ${BRAND.color}, #5C1A2B)`, color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer", marginBottom: 14 }}>
          Sign In
        </button>

        <div style={{ background: "#F7E8EC", borderRadius: 8, padding: 12, fontSize: 12, color: "#6b7280", lineHeight: 1.6, textAlign: "center" }}>
          <strong>Demo Credentials:</strong><br/>Email: <code style={{ color: "#4A1625", fontWeight: 600 }}>admin@thewardrobe.com</code><br/>Password: <code style={{ color: "#4A1625", fontWeight: 600 }}>admin123</code>
        </div>
      </div>
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
    const validFormat = /^TWS-[A-Z0-9]{2,8}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(k) || VALID_KEYS.includes(k);
    if (!validFormat) { setErr("Invalid license key. Format: TWS-XXXX-XXXX-XXXX"); return; }
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

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${BRAND.color} 0%, #5C1A2B 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "32px 30px", width: "min(94vw,420px)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img src={LOGO} alt="The Wardrobe Selection" style={{ width: 76, height: 76, objectFit: "contain", marginBottom: 8, borderRadius: 10 }} />
          <div style={{ fontSize: 20, fontWeight: 900, color: BRAND.dark, letterSpacing: -0.3 }}>The Wardrobe Selection</div>
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>Boutique Inventory Manager</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button onClick={() => { setMode("trial"); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "2px solid #E8C9D1", background: mode === "trial" ? BRAND.color : "#fff", color: mode === "trial" ? "#fff" : "#374151", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Free Trial</button>
          <button onClick={() => { setMode("activate"); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "2px solid #E8C9D1", background: mode === "activate" ? BRAND.color : "#fff", color: mode === "activate" ? "#fff" : "#374151", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Activate License</button>
        </div>

        {mode === "trial" && (
          <div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: "0 0 14px" }}>
              Start a <strong>{TRIAL_DAYS}-day free trial</strong>. All features unlocked — inventory, sales, restock, and reports. No card required.
            </p>
            <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "#92400e" }}>
              Trial includes full access. Purchase a license before expiry to keep your data.
            </div>
            <button onClick={startTrial} style={{ width: "100%", padding: "13px 0", background: `linear-gradient(135deg, ${BRAND.color}, #5C1A2B)`, color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Start Free Trial
            </button>
          </div>
        )}

        {mode === "activate" && (
          <div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px" }}>Enter your license key to activate.</p>
            <input value={key} onChange={e => { setKey(e.target.value.toUpperCase()); setErr(""); }} onKeyDown={e => e.key === "Enter" && activateKey()}
              placeholder="TWS-XXXX-XXXX-XXXX"
              style={{ width: "100%", padding: 11, border: "2px solid #E8C9D1", borderRadius: 8, fontSize: 14, textAlign: "center", boxSizing: "border-box", letterSpacing: 2, marginBottom: 8, fontFamily: "monospace" }} />
            {err && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{err}</div>}
            <button onClick={activateKey} style={{ width: "100%", padding: "13px 0", background: `linear-gradient(135deg, ${BRAND.color}, #5C1A2B)`, color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
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
          Activate a new license key to keep using The Wardrobe Selection.
        </p>
        <button onClick={onRenew} style={{ width: "100%", padding: "13px 0", background: "#991b1b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
          Activate License
        </button>
      </div>
    </div>
  );
}

// ── USER MANAGEMENT MODAL (ADMIN ONLY) ────────────────────────────────────────
function UserManagementModal({ users, onClose, onSave }) {
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "sales_clerk", preset: "sales_clerk" });
  const [editingId, setEditingId] = useState(null);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) { alert("All fields required."); return; }
    const exists = users.some(u => u.email === newUser.email);
    if (exists) { alert("Email already in use."); return; }
    const user = {
      id: "user-" + uid(),
      name: newUser.name,
      email: newUser.email,
      passwordHash: hashPassword(newUser.password),
      role: newUser.preset,
      sections: SECTION_PRESETS[newUser.preset]?.sections || [],
      createdAt: new Date().toISOString(),
      createdBy: "admin",
      active: true
    };
    onSave([...users, user]);
    setNewUser({ name: "", email: "", password: "", role: "sales_clerk", preset: "sales_clerk" });
  };

  const handleToggleUser = (id) => {
    onSave(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Delete this user? This cannot be undone.")) {
      onSave(users.filter(u => u.id !== id));
    }
  };

  return (
    <Modal title="👥 User Management" onClose={onClose}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.dark, marginBottom: 12 }}>➕ Add New Employee</div>
        <Row label="Full Name"><input style={iStyle} type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" /></Row>
        <Row label="Email"><input style={iStyle} type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@example.com" /></Row>
        <Row label="Password"><input style={iStyle} type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" /></Row>
        <Row label="Role / Access Level">
          <select style={iStyle} value={newUser.preset} onChange={e => { setNewUser({ ...newUser, preset: e.target.value, role: e.target.value }); }}>
            <option value="sales_clerk">Sales Clerk (Sales, Inventory, Alerts)</option>
            <option value="inventory_manager">Inventory Manager (Inventory, Alerts, Suppliers)</option>
            <option value="supplier_manager">Supplier Manager (Suppliers, Alerts)</option>
            <option value="report_viewer">Report Viewer (Sales, Backup)</option>
          </select>
        </Row>
        <button onClick={handleAddUser} style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
          + Add Employee
        </button>
      </div>

      <div style={{ borderTop: "1px solid #E8C9D1", paddingTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: BRAND.dark, marginBottom: 12 }}>👤 Active Employees</div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {users.filter(u => u.id !== "admin-" + (users[0]?.id || "")).length === 0 ? (
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>No employees added yet.</p>
          ) : (
            users.filter(u => u.role !== "admin").map(user => (
              <div key={user.id} style={{ background: "#F7E8EC", borderRadius: 8, padding: 12, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: BRAND.dark }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{user.email} • {SECTION_PRESETS[user.role]?.label || user.role}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>Sections: {user.sections.join(", ")}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                  <button onClick={() => handleToggleUser(user.id)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 5, background: user.active ? "#dcfce7" : "#fee2e2", color: user.active ? "#166534" : "#dc2626", cursor: "pointer" }}>
                    {user.active ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => handleDeleteUser(user.id)} style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, border: "none", borderRadius: 5, background: "#fee2e2", color: "#dc2626", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function App() {
  const [license, setLicense] = useState(loadLicense);
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [db, setDb] = useState(loadData);
  const [view, setView] = useState("inventory");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState(() => initializeAdminIfNeeded());
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [fileError, setFileError] = useState(null);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_) {} }, [db]);

  // Gate: License check
  if (!license) return <LicenseScreen onActivate={setLicense} />;
  if (isExpired(license.expiry)) return <LicenseExpiredScreen license={license} onRenew={() => setLicense(null)} />;

  // Gate: Login check
  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} />;

  // Gate: Section access check
  const canAccess = (sectionId) => currentUser.sections.includes(sectionId) || currentUser.role === "admin";
  const isAdmin = currentUser.role === "admin";

  const products = db.products;
  const sales = db.sales;
  const lowStock = products.filter(p => p.qty <= p.lowStockThreshold);
  const outOfStock = products.filter(p => p.qty === 0);

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); };
  const close = () => { setModal(null); setEditing(null); setForm({}); };
  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const cats = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.size?.toLowerCase().includes(search.toLowerCase()) || p.color?.toLowerCase().includes(search.toLowerCase());
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

  const toastColors = { ok: "#7B2D42", warn: "#f59e0b", err: "#ef4444" };

  const navItems = [
    { id: "inventory", label: "👗 Inventory" },
    { id: "sales", label: "🧾 Sales" },
    { id: "alerts", label: `⚠️ Alerts${lowStock.length ? ` (${lowStock.length})` : ""}` },
    { id: "suppliers", label: "🚚 Suppliers" },
    { id: "backup", label: "💾 Backup" },
    ...(isAdmin ? [{ id: "settings", label: "⚙️ Settings" }] : []),
  ].filter(item => canAccess(item.id));

  const handleLogout = () => {
    if (window.confirm("Logout from The Wardrobe Selection?")) {
      clearSession();
      setCurrentUser(null);
    }
  };

  const handleUserSave = (updatedUsers) => {
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    showToast("Users updated.");
  };

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: "#FBF1F3", minHeight: "100vh", color: "#111827" }}>

      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toastColors[toast.type], color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #7B2D42 0%, #5C1A2B 100%)", padding: "22px 22px 0", color: "#fff" }}>
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={LOGO} alt="The Wardrobe Selection" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 8, background: "#fff" }} />
            <div>
              <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 600, letterSpacing: 1.5 }}>THE WARDROBE SELECTION</div>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>Boutique Inventory</div>
            </div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, textAlign: "right" }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{currentUser.name}</div>
            <div style={{ opacity: 0.7, fontSize: 11 }}>{SECTION_PRESETS[currentUser.role]?.label || currentUser.role}</div>
            {license.type === "trial" && <div style={{ fontSize: 10, marginTop: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, padding: "2px 6px", display: "inline-block" }}>Trial: {daysLeft(license.expiry)}d</div>}
          </div>
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
        <div style={{ display: "flex", gap: 2, marginTop: 8, justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 2 }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setView(n.id)}
                style={{ background: view === n.id ? "#fff" : "transparent", color: view === n.id ? BRAND.color : "rgba(255,255,255,0.85)", border: "none", borderRadius: "8px 8px 0 0", padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {n.label}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: "8px 8px 0 0", padding: "7px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: 0.8 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 22px", maxWidth: 1100, margin: "0 auto" }}>

        {/* INVENTORY */}
        {view === "inventory" && (() => {
          return (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "center" }}>
                <input style={iStyle} type="text" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
                <select style={iStyle} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={() => { setModal("addProduct"); setForm({}); setEditing(null); }} style={{ background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>+ Add Item</button>
              </div>

              {/* Card grid view for boutique */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                {filtered.map(p => (
                  <div key={p.id} style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #E8C9D1", overflow: "hidden" }}>
                    <div style={{ fontSize: 11, color: BRAND.color, fontWeight: 700, marginBottom: 4 }}>{p.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2, minHeight: "2.4em" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{p.size} • {p.color}</div>
                    <div style={{ marginBottom: 10 }}>
                      <StockBar qty={p.qty} threshold={p.lowStockThreshold} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: BRAND.dark, marginTop: 4 }}>{p.qty} in stock</div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: BRAND.color }}>{fmt(p.sellPrice)}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>Cost: {fmt(p.costPrice)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {canAccess("alerts") && <button onClick={() => { setModal("restock"); setEditing(p); setForm({ addQty: "", supplier: p.supplier, supplierPhone: p.supplierPhone }); }} style={{ flex: 1, background: "#F7E8EC", color: BRAND.color, border: "none", borderRadius: 7, padding: "6px 0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+Stock</button>}
                      <button onClick={() => { setModal("editProduct"); setEditing(p); setForm(p); }} style={{ flex: 1, background: "#F7E8EC", color: BRAND.color, border: "none", borderRadius: 7, padding: "6px 0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* SALES */}
        {view === "sales" && canAccess("sales") && (() => {
          return (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>Total revenue: <b style={{ color: BRAND.color }}>{fmt(totalSalesValue)}</b> · {sales.length} transactions</div>
                <button onClick={() => { setModal("recordSale"); setForm({ date: today(), qty: 1 }); }} style={{ background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>🧾 Record Sale</button>
              </div>

              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E8C9D1", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F7E8EC" }}>
                      {["Date", "Item", "Size/Color", "Qty", "Price", "Total", "Note"].map(h => (
                        <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: BRAND.dark }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s, i) => (
                      <tr key={s.id} style={{ borderTop: "1px solid #F7E8EC", background: i % 2 === 0 ? "#fff" : "#FBF1F3" }}>
                        <td style={{ padding: "9px 12px", fontSize: 12 }}>{s.date}</td>
                        <td style={{ padding: "9px 12px", fontSize: 12, fontWeight: 600 }}>{s.productName}</td>
                        <td style={{ padding: "9px 12px", fontSize: 12 }}>{s.size}/{s.color}</td>
                        <td style={{ padding: "9px 12px", fontSize: 12 }}>{s.qty}</td>
                        <td style={{ padding: "9px 12px", fontSize: 12 }}>{fmt(s.sellPrice)}</td>
                        <td style={{ padding: "9px 12px", fontWeight: 800, color: BRAND.color, fontSize: 13 }}>{fmt(s.total)}</td>
                        <td style={{ padding: "9px 12px", fontSize: 12, color: "#6b7280" }}>{s.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}

        {/* ALERTS */}
        {view === "alerts" && canAccess("alerts") && (() => {
          return (
            <div style={{ display: "grid", gap: 14 }}>
              {lowStock.length > 0 && (
                <div style={{ background: "#FEF3C7", borderRadius: 12, padding: 16, border: "1px solid #f59e0b" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: "#92400e" }}>⚠️ Low Stock Items ({lowStock.length})</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                    {lowStock.map(p => (
                      <div key={p.id} style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{p.qty} left · Threshold: {p.lowStockThreshold}</div>
                        <button onClick={() => { setView("inventory"); setTimeout(() => { setModal("restock"); setEditing(p); setForm({ addQty: "", supplier: p.supplier, supplierPhone: p.supplierPhone }); }, 100); }} style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Restock Now</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outOfStock.length > 0 && (
                <div style={{ background: "#FEE2E2", borderRadius: 12, padding: 16, border: "1px solid #ef4444" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, color: "#991b1b" }}>🚨 Out of Stock ({outOfStock.length})</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                    {outOfStock.map(p => (
                      <div key={p.id} style={{ background: "#fff", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{p.supplier}</div>
                        <button onClick={() => { setView("inventory"); setTimeout(() => { setModal("restock"); setEditing(p); setForm({ addQty: "", supplier: p.supplier, supplierPhone: p.supplierPhone }); }, 100); }} style={{ width: "100%", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Restock Urgently</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lowStock.length === 0 && outOfStock.length === 0 && (
                <div style={{ background: "#DCFCE7", borderRadius: 12, padding: 20, textAlign: "center", border: "1px solid #22c55e" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>✓ All stock levels healthy!</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* SUPPLIERS */}
        {view === "suppliers" && canAccess("suppliers") && (() => {
          const supplierData = Array.from(new Set(products.map(p => p.supplier))).map(name => ({
            name,
            phone: products.find(p => p.supplier === name)?.supplierPhone,
            itemsCount: products.filter(p => p.supplier === name).length,
          }));
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {supplierData.map(s => (
                <div key={s.name} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #E8C9D1" }}>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8, color: BRAND.dark }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                    <div>📞 <code style={{ fontFamily: "monospace", color: "#4A1625" }}>{s.phone}</code></div>
                    <div style={{ marginTop: 8 }}>{s.itemsCount} item{s.itemsCount !== 1 ? "s" : ""} supplied</div>
                  </div>
                  <div style={{ background: "#F7E8EC", borderRadius: 8, padding: 8, marginTop: 12, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: BRAND.dark, marginBottom: 4 }}>Items from {s.name}:</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {products.filter(p => p.supplier === s.name).map(p => p.name).join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* BACKUP */}
        {view === "backup" && canAccess("backup") && (() => {
          const download = () => {
            const blob = new Blob([JSON.stringify({ app: "The Wardrobe Selection", exportedAt: new Date().toISOString(), version: 1, data: db }, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `TheWardrobeSelection-backup-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            showToast("Backup downloaded.");
          };
          const onFile = (e) => {
            const file = e.target.files?.[0]; if (!file) return; setFileError(null);
            const reader = new FileReader();
            reader.onload = (evt) => {
              try { const imported = JSON.parse(evt.target?.result); if (!imported.data) throw new Error("Invalid backup file."); setConfirmRestore(imported); } catch (e) { setFileError("Invalid backup file: " + e.message); }
            };
            reader.readAsText(file); e.target.value = "";
          };
          const stats2 = [["Products", db.products.length], ["Sales", db.sales.length]];
          return (
            <>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: BRAND.dark }}>💾 Backup & Restore</div>
              <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 20, maxWidth: 560, lineHeight: 1.6 }}>All data lives only in this browser. Download a backup regularly and store it in Google Drive, email, or a USB drive.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #E8C9D1" }}>
                  <div style={{ fontWeight: 800, marginBottom: 12, color: BRAND.dark }}>⬇️ Export Backup</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>{stats2.map(([l,v]) => <div key={l} style={{ background: "#FBF1F3", borderRadius: 7, padding: "8px 12px" }}><div style={{ fontSize: 10, color: "#6b7280" }}>{l}</div><div style={{ fontSize: 15, fontWeight: 700, color: BRAND.dark }}>{v}</div></div>)}</div>
                  <button onClick={download} style={{ background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", width: "100%" }}>⬇️ Download Backup File</button>
                </div>
                <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #E8C9D1" }}>
                  <div style={{ fontWeight: 800, marginBottom: 10, color: BRAND.dark }}>⬆️ Restore from Backup</div>
                  <div style={{ background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: "#92400e" }}>⚠️ Restoring overwrites all data. Export first if needed.</div>
                  <label style={{ display: "block", textAlign: "center", padding: "9px 16px", borderRadius: 8, border: "1px solid #E8C9D1", color: "#6b7280", cursor: "pointer", fontWeight: 600 }}>Choose Backup File… <input type="file" accept="application/json" onChange={onFile} style={{ display: "none" }} /></label>
                  {fileError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{fileError}</div>}
                </div>
              </div>
              {confirmRestore && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={() => setConfirmRestore(null)}>
                  <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "min(94vw,400px)" }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ color: BRAND.dark, margin: "0 0 12px" }}>Confirm Restore</h3>
                    <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Backup from <strong>{new Date(confirmRestore.exportedAt).toLocaleString()}</strong>. This replaces all current data and cannot be undone.</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setConfirmRestore(null)} style={{ flex: 1, background: "transparent", border: "1px solid #E8C9D1", borderRadius: 8, padding: "10px 0", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => { setDb(confirmRestore.data); setConfirmRestore(null); showToast("Data restored", "ok"); }} style={{ flex: 1, background: "#991b1b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Yes, Restore</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* SETTINGS (ADMIN ONLY) */}
        {view === "settings" && isAdmin && (() => {
          return (
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color: BRAND.dark }}>⚙️ Settings & Admin</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginTop: 16 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #E8C9D1" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: BRAND.dark }}>👥 Manage Team</div>
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>Add, edit, or deactivate employee access. Control which sections each team member can access.</p>
                  <button onClick={() => setModal("userManagement")} style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                    👥 Manage Employees
                  </button>
                </div>

                <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #E8C9D1" }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12, color: BRAND.dark }}>📊 System Info</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.8, marginBottom: 14 }}>
                    <div>Active Employees: <strong>{users.filter(u => u.active && u.role !== "admin").length}</strong></div>
                    <div>Total Users: <strong>{users.length}</strong></div>
                    <div>License: <strong>{license.type === "trial" ? `Trial (${daysLeft(license.expiry)}d left)` : "Licensed"}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

      {/* ADD / EDIT */}
      {(modal === "addProduct" || modal === "editProduct") && canAccess("inventory") && (
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
      {modal === "recordSale" && canAccess("sales") && (
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
            <div style={{ background: "#F7E8EC", borderRadius: 8, padding: "9px 14px", marginBottom: 12, fontWeight: 700, fontSize: 14, color: BRAND.dark }}>Total: {fmt(Number(form.qty) * Number(form.sellPrice))}</div>
          )}
          <button onClick={recordSale} style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Save Sale</button>
        </Modal>
      )}

      {/* RESTOCK */}
      {modal === "restock" && editing && canAccess("alerts") && (
        <Modal title={`Restock — ${editing.name}`} onClose={close}>
          <div style={{ background: "#F7E8EC", borderRadius: 8, padding: "9px 14px", marginBottom: 14, fontSize: 14, color: BRAND.dark }}>
            Current stock: <b>{editing.qty} pieces</b> · Size {editing.size} · {editing.color}
          </div>
          <Row label="Add Quantity"><input style={iStyle} type="number" min="1" value={form.addQty || ""} onChange={f("addQty")} /></Row>
          <Row label="Supplier"><input style={iStyle} type="text" value={form.supplier || ""} onChange={f("supplier")} /></Row>
          <Row label="Supplier Phone"><input style={iStyle} type="text" value={form.supplierPhone || ""} onChange={f("supplierPhone")} /></Row>
          <button onClick={restock} style={{ width: "100%", background: BRAND.color, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Confirm Restock</button>
        </Modal>
      )}

      {/* USER MANAGEMENT */}
      {modal === "userManagement" && isAdmin && (
        <UserManagementModal users={users} onClose={close} onSave={handleUserSave} />
      )}
    </div>
  );
}
