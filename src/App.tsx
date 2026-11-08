import { FormEvent, ReactNode, useMemo, useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";

type View = "dashboard" | "students" | "payouts" | "qr" | "support";
type IconName =
  | "arrow"
  | "bell"
  | "briefcase"
  | "building"
  | "calendar"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "download"
  | "external"
  | "eye"
  | "file"
  | "gear"
  | "grid"
  | "headset"
  | "home"
  | "more"
  | "plus"
  | "qr"
  | "search"
  | "send"
  | "shield"
  | "students"
  | "upload"
  | "wallet";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 13h6M9 17h6" /></>,
    gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.56 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3v-4h.09A1.7 1.7 0 0 0 4.6 8.56a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V3h4v.09a1.7 1.7 0 0 0 1 1.51 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83-2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.15.61.66 1.08 1.29 1.19H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v6H5a1 1 0 0 1-1-1zM20 14h-3v6h2a1 1 0 0 0 1-1zM17 20c0 1-1 2-3 2" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    qr: <><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM18 13h3M13 20h3" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4zM22 2 11 13" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    students: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></>,
    wallet: <><path d="M4 5h14a2 2 0 0 1 2 2v13H5a2 2 0 0 1-2-2V5.5A2.5 2.5 0 0 1 5.5 3H18" /><path d="M20 11h-5a2 2 0 0 0 0 4h5" /></>,
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark">
      <span className="brand-symbol"><span>e</span></span>
      {!compact && <span className="brand-word">Edu<span>Aimers</span></span>}
    </div>
  );
}

function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "red" | "amber" | "blue" | "gray" }) {
  return <span className={`badge badge-${tone}`}><i />{children}</span>;
}

function AdminPanel({ onPortal, activePartner, setActivePartner }: { onPortal: (partnerName?: string) => void; activePartner: string; setActivePartner: (name: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [provisioned, setProvisioned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [partnersList, setPartnersList] = useState<any[]>([]);

  const [orgName, setOrgName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contact, setContact] = useState("");
  const [nid, setNid] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [logoFile, setLogoFile] = useState<string | null>(null);

  // Real-time Firestore sync
  useEffect(() => {
    const q = query(collection(db, "partners"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPartnersList(list);
    }, (error) => {
      console.error("Firestore read error: ", error);
    });
    return () => unsubscribe();
  }, []);

  async function provision(event: FormEvent) {
    event.preventDefault();
    try {
      const newPartner = {
        name: orgName,
        owner: ownerName,
        contact: contact,
        nid: nid,
        bankAccount: bankAccount,
        initials: orgName ? orgName.slice(0, 2).toUpperCase() : "BS",
        students: 0,
        earned: "৳ 0",
        status: "Active",
        logo: logoFile || null,
        createdAt: new Date()
      };
      await addDoc(collection(db, "partners"), newPartner);
      setActivePartner(orgName);
      setProvisioned(true);
    } catch (error) {
      console.error("Error adding partner to Firestore: ", error);
      alert("Failed to save to Firestore. Please check your Firebase rules or internet connection.");
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const partnerDomain = orgName ? orgName.toLowerCase().replace(/\s+/g, '') : 'partner';

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo"><BrandMark /></div>
        <nav className="side-nav" aria-label="Admin navigation">
          <p>Workspace</p>
          <button className="active"><Icon name="grid" />Overview</button>
          <button><Icon name="building" />Partners<span className="nav-count">{partnersList.length}</span></button>
          <button><Icon name="qr" />QR Standees</button>
          <button><Icon name="wallet" />Global Payouts</button>
          <p>System</p>
          <button><Icon name="headset" />Support</button>
          <button><Icon name="gear" />Settings</button>
        </nav>
        <div className="admin-profile">
          <span className="avatar dark">SA</span>
          <span><strong>Super Admin</strong><small>admin@eduaimers.com</small></span>
          <Icon name="more" />
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="mobile-brand"><BrandMark compact /></span>
            <p>Master Control</p>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications"><Icon name="bell" /><i /></button>
            <button className="portal-preview" onClick={() => onPortal(activePartner)}><Icon name="eye" />Preview partner portal</button>
            <button className="primary-button" onClick={() => { setProvisioned(false); setShowForm(true); }}><Icon name="plus" />Add new partner</button>
          </div>
        </header>
        <div className="admin-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">Master Control Panel</p>
              <h1>Good morning, Admin.</h1>
              <p>Manage white-label IELTS partner portals and live tracking.</p>
            </div>
            <div className="live-indicator"><span />All systems operational</div>
          </section>
          
          <section className="stat-grid admin-stats">
            {[
              { label: "Active partners", value: partnersList.length.toString(), change: "Live Firestore Sync", icon: "building" as IconName },
              { label: "Total students", value: "2,846", change: "+12.4% vs last month", icon: "students" as IconName },
              { label: "Payouts processed", value: "৳ 42.8L", change: "+8.2% vs last month", icon: "wallet" as IconName },
              { label: "QR scans", value: "8,942", change: "+21.7% vs last month", icon: "qr" as IconName },
            ].map((item) => (
              <article className="stat-card" key={item.label}>
                <div className="stat-top"><span className="stat-icon"><Icon name={item.icon} /></span><Icon name="more" /></div>
                <p>{item.label}</p>
                <h2>{item.value}</h2>
                <small><b>↑</b> {item.change}</small>
              </article>
            ))}
          </section>

          <section className="table-card">
            <div className="card-heading table-heading">
              <div>
                <h3>Active IELTS partners (Firestore Live Data)</h3>
                <p>Manage your white-label partner network & generate dedicated links/QR codes</p>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Owner</th>
                    <th>Students</th>
                    <th>Total earned</th>
                    <th>Status</th>
                    <th>Quick actions & Links</th>
                  </tr>
                </thead>
                <tbody>
                  {partnersList.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No partners found in Firestore. Click "Add new partner" to create one.</td></tr>
                  ) : (
                    partnersList.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td>
                          <div className="org-cell">
                            <span>{p.initials || "BS"}</span>
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td>{p.owner || "N/A"}</td>
                        <td>{p.students || 0}</td>
                        <td className="medium">{p.earned || "৳ 0"}</td>
                        <td><Badge tone="green">{p.status || "Active"}</Badge></td>
                        <td>
                          <div className="row-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <button className="primary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => { setActivePartner(p.name); onPortal(p.name); }}>
                              Open Portal <Icon name="external" size={14} />
                            </button>
                            <button className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => {
                              const link = `https://${p.name.toLowerCase().replace(/\s+/g, '')}.eduaimers.com`;
                              navigator.clipboard?.writeText(link);
                              alert(`Partner Link copied to clipboard:\n${link}`);
                            }}>
                              Copy Link
                            </button>
                            <button className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => {
                              setActivePartner(p.name);
                              onPortal(p.name);
                            }}>
                              Get QR Kit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <section className="provision-modal">
            <div className="modal-header">
              <div>
                <span className="modal-icon"><Icon name={provisioned ? "check" : "building"} /></span>
                <div>
                  <p>{provisioned ? "Partner provisioned" : "Partner provisioning"}</p>
                  <h2>{provisioned ? "Portal is ready to go" : "Add new IELTS partner"}</h2>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} aria-label="Close"><Icon name="close" /></button>
            </div>
            {provisioned ? (
              <div className="success-view">
                <div className="success-orbit"><span><Icon name="check" size={32} /></span></div>
                <h3>Partner Portal is live in Firestore</h3>
                <p>The dedicated partner portal, unique shareable link, and print-ready QR standee kit have been generated successfully.</p>
                <div className="domain-card">
                  <div>
                    <span>Shareable Partner Link</span>
                    <strong>https://{partnerDomain}.eduaimers.com</strong>
                  </div>
                  <button onClick={() => { 
                    navigator.clipboard?.writeText(`https://${partnerDomain}.eduaimers.com`); 
                    setCopied(true); 
                  }}>
                    <Icon name={copied ? "check" : "file"} size={16} />{copied ? "Copied Link" : "Copy link"}
                  </button>
                </div>
                <div className="success-links">
                  <button onClick={() => { setShowForm(false); onPortal(activePartner); }}><Icon name="external" />Open partner portal</button>
                  <button onClick={() => alert("QR Standee kit PDF downloaded successfully!")}><Icon name="download" />Download QR kit</button>
                </div>
                <button className="primary-button full" onClick={() => setShowForm(false)}>Done</button>
              </div>
            ) : (
              <form className="partner-form" onSubmit={provision}>
                <p className="form-intro">Enter organization details. Data will be saved directly to Firestore database instantly.</p>
                <div className="form-grid">
                  <label className="full">Organization name<input required value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. British Study Centre" /></label>
                  <label>Owner name<input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full legal name" /></label>
                  <label>Contact number<input required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+880 1XXX XXXXXX" /></label>
                  <label>NID number<input required value={nid} onChange={(e) => setNid(e.target.value)} placeholder="Enter NID number" /></label>
                  <label>Bank / MFS account<input required value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Account number" /></label>
                  <label className="full">
                    Partner logo upload
                    <div className="upload-box" style={{ border: "2px dashed #d40511", padding: "15px", textAlign: "center", cursor: "pointer", background: "#fff" }}>
                      <span><Icon name="upload" /></span>
                      <div><strong>{logoFile ? "Logo Uploaded Successfully!" : "Click to upload organization logo"}</strong><small>PNG, JPG or SVG · Max 2 MB</small></div>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ marginTop: "8px", width: "100%" }} />
                    </div>
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                  <button className="primary-button" type="submit">Provision & Save to Firestore <Icon name="arrow" /></button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function QrCode({ large = false }: { large?: boolean }) {
  const cells = useMemo(() => {
    const arr: [number, number][] = [];
    for (let y = 0; y < 25; y++)
      for (let x = 0; x < 25; x++) {
        const finder = (x < 7 && y < 7) || (x > 17 && y < 7) || (x < 7 && y > 17);
        if (!finder && (x * 7 + y * 11 + x * y) % 5 < 2) arr.push([x, y]);
      }
    return arr;
  }, []);
  return (
    <svg className={`qr-code ${large ? "qr-large" : ""}`} viewBox="0 0 25 25" shapeRendering="crispEdges" aria-label="Unique partner QR code">
      <rect width="25" height="25" fill="white" />
      {[[0, 0], [18, 0], [0, 18]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" fill="#111" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#111" />
        </g>
      ))}
      {cells.map(([x, y]) => (<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#111" />))}
    </svg>
  );
}

function PartnerHeader({ active, onNav, onAdmin, partnerName }: { active: View; onNav: (v: View) => void; onAdmin: () => void; partnerName: string }) {
  const links: { key: View; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "students", label: "Students" },
    { key: "payouts", label: "Payouts" },
    { key: "qr", label: "QR Kit" },
    { key: "support", label: "Support" },
  ];
  return (
    <header className="partner-header">
      <button className="partner-brand" onClick={() => onNav("dashboard")}>
        <span className="partner-logo">{partnerName ? partnerName.slice(0, 2).toUpperCase() : "BS"}</span>
        <span><strong>{partnerName || "British Study Centre"}</strong><small>Official EduAimers Partner</small></span>
      </button>
      <nav>
        {links.map((link) => (
          <button key={link.key} className={active === link.key ? "active" : ""} onClick={() => onNav(link.key)}>
            {link.label}
          </button>
        ))}
      </nav>
      <div className="partner-user">
        <button className="icon-button" aria-label="Notifications"><Icon name="bell" /><i /></button>
        <button className="user-button">
          <span className="avatar">FR</span>
          <span><strong>Fahim Rahman</strong><small>Partner owner</small></span>
          <Icon name="chevron" size={16} />
        </button>
        <button className="admin-return" onClick={onAdmin} title="Return to master admin"><Icon name="grid" /></button>
      </div>
    </header>
  );
}

function Timeline() {
  const items = [
    ["QR Scan", "Student captured", "check"],
    ["Counseling & Audit", "Profile verified", "check"],
    ["File Open", "৳2,000 unlocked", "check"],
    ["University Application", "In progress", "clock"],
    ["Visa Approved", "৳20,000 bonus", "shield"],
  ];
  return (
    <div className="timeline">
      {items.map(([title, sub, icon], i) => (
        <div className={`timeline-step ${i < 3 ? "complete" : i === 3 ? "current" : ""}`} key={title}>
          <div className="timeline-line" />
          <span className="timeline-dot"><Icon name={icon as IconName} size={16} /></span>
          <div><strong>{title}</strong><small>{sub}</small></div>
        </div>
      ))}
    </div>
  );
}

function StudentTable({ full = false }: { full?: boolean }) {
  const [queryText, setQueryText] = useState("");
  const dynamicStudents = [
    { id: "EA-240184", name: "Mehedi Hasan", reg: "IELTS-008451", date: "12 Jun 2024", status: "Visa approved", tone: "green" as const },
    { id: "EA-240179", name: "Nusrat Jahan", reg: "IELTS-008398", date: "10 Jun 2024", status: "University application", tone: "blue" as const },
    { id: "EA-240163", name: "Arif Chowdhury", reg: "IELTS-008274", date: "08 Jun 2024", status: "File open", tone: "amber" as const },
    { id: "EA-240142", name: "Sumaiya Akter", reg: "IELTS-008119", date: "04 Jun 2024", status: "Counseling & audit", tone: "gray" as const },
    { id: "EA-240121", name: "Abdullah Al Mamun", reg: "IELTS-007986", date: "01 Jun 2024", status: "Visa approved", tone: "green" as const },
  ];
  const rows = dynamicStudents.filter((s) => `${s.id} ${s.name} ${s.reg} ${s.status}`.toLowerCase().includes(queryText.toLowerCase()));
  return (
    <section className="table-card partner-table-card">
      <div className="card-heading table-heading">
        <div>
          <h3>{full ? "Student directory" : "Recent students"}</h3>
          <p>{full ? "Search and manage every student record in real-time" : "Latest records across your referral network"}</p>
        </div>
        {full && (
          <div className="small-search">
            <Icon name="search" />
            <input value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="Search students..." />
          </div>
        )}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr><th>Student ID</th><th>Student name</th><th>IELTS Reg. No</th><th>Submission date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="id-cell">{s.id}</td>
                <td>
                  <div className="student-name">
                    <span>{s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                    <strong>{s.name}</strong>
                  </div>
                </td>
                <td>{s.reg}</td>
                <td>{s.date}</td>
                <td><Badge tone={s.tone}>{s.status}</Badge></td>
                <td><button className="secondary-button" onClick={() => alert(`Opening full tracking profile for ${s.name} (${s.id})`)}>View Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PartnerDashboard({ partnerName, onNav }: { partnerName: string; onNav: (v: View) => void }) {
  const [tracking, setTracking] = useState("");
  const [tracked, setTracked] = useState(false);
  const dynamicTransactions = [
    { id: "TXN-EA-884201", time: "18 Jun 2024 · 02:42 PM", student: "Mehedi Hasan", ref: "EA-240184", amount: "+ ৳20,000", status: "Paid" },
    { id: "TXN-EA-883917", time: "16 Jun 2024 · 11:18 AM", student: "Arif Chowdhury", ref: "EA-240163", amount: "+ ৳2,000", status: "Paid" },
  ];
  return (
    <>
      <section className="tracking-hero">
        <div className="hero-grid" />
        <div className="hero-stripes" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-content">
          <p className="eyebrow light"><span />{partnerName || "British Study Centre"} · Student tracker</p>
          <h1>Track every student journey.<br />From first scan to takeoff.</h1>
          <p>Search by Student ID, passport number, or phone to get a real-time status update.</p>
          <form className="tracking-search" onSubmit={(e) => { e.preventDefault(); setTracked(true); }}>
            <Icon name="search" size={24} />
            <input value={tracking} onChange={(e) => { setTracking(e.target.value); setTracked(false); }} placeholder="Enter Student ID, Passport or Phone Number..." required />
            <button type="submit">Search & Track <Icon name="arrow" /></button>
          </form>
          <div className="secure-note"><Icon name="shield" size={15} />Secure, real-time updates from EduAimers</div>
        </div>
      </section>
      <div className="partner-content">
        {tracked && (
          <section className="tracked-result">
            <div className="tracked-head">
              <div><Badge tone="blue">Live result</Badge><h3>{tracking || "EA-240179"} · Nusrat Jahan</h3></div>
              <button onClick={() => setTracked(false)}><Icon name="close" /></button>
            </div>
            <Timeline />
          </section>
        )}
        <div className="section-heading">
          <div><p className="eyebrow">Business overview</p><h2>Your performance at a glance</h2></div>
          <button className="date-button"><Icon name="calendar" />01–30 June 2024<Icon name="chevron" /></button>
        </div>
        <section className="stat-grid partner-stats">
          {[
            ["Total enrolled students", "348", "12 enrolled this month", "students"],
            ["Active files / File open", "64", "8 need attention", "file"],
            ["Visa confirmed & flown", "27", "4 this month", "shield"],
            ["Total earnings wallet", "৳ 8,42,000", "৳ 62,000 available", "wallet"],
          ].map(([label, value, sub, icon], i) => (
            <article className={`stat-card ${i === 3 ? "wallet-stat" : ""}`} key={label}>
              <div className="stat-top"><span className="stat-icon"><Icon name={icon as IconName} /></span><span className="trend">+{[12, 8, 18, 9][i]}%</span></div>
              <p>{label}</p><h2>{value}</h2><small>{sub}</small>
            </article>
          ))}
        </section>
        <section className="journey-card">
          <div className="card-heading">
            <div><p className="eyebrow">Live case update</p><h3>Mehedi Hasan <span>EA-240184</span></h3><p>Last updated today at 02:42 PM</p></div>
            <Badge tone="green">On track</Badge>
          </div>
          <Timeline />
        </section>
        <section className="recent-grid">
          <article className="recent-panel">
            <div className="card-heading">
              <div><p className="eyebrow">Money in</p><h3>Last transactions</h3><p>Latest referral payments, exact to the minute</p></div>
              <button onClick={() => onNav("payouts")}>View payouts <Icon name="arrow" /></button>
            </div>
            <div className="recent-list">
              {dynamicTransactions.map((transaction) => (
                <div className="transaction-row" key={transaction.id}>
                  <span className="activity-icon"><Icon name="wallet" size={17} /></span>
                  <div><strong>{transaction.student}</strong><small>{transaction.time}</small></div>
                  <div className="transaction-value"><strong>{transaction.amount}</strong><Badge tone="green">{transaction.status}</Badge></div>
                </div>
              ))}
            </div>
          </article>
          <article className="recent-panel">
            <div className="card-heading">
              <div><p className="eyebrow">Case movement</p><h3>Recent file updates</h3><p>New openings and application milestones</p></div>
              <button onClick={() => onNav("students")}>View students <Icon name="arrow" /></button>
            </div>
            <div className="recent-list">
              {[
                ["Nusrat Jahan", "Application submitted", "Today · 03:18 PM", "send"],
                ["Arif Chowdhury", "File opened · ৳2,000 unlocked", "Today · 11:42 AM", "file"],
              ].map(([name, update, time, icon]) => (
                <div className="file-row" key={name}>
                  <span className="activity-icon"><Icon name={icon as IconName} size={17} /></span>
                  <div><strong>{name}</strong><small>{update}</small></div>
                  <time>{time}</time>
                </div>
              ))}
            </div>
          </article>
        </section>
        <StudentTable />
      </div>
    </>
  );
}

function StudentsPage() {
  return (
    <div className="partner-content page-content">
      <div className="section-heading page-title">
        <div><p className="eyebrow">Student management</p><h1>Student history</h1><p>Monitor every application from first scan to visa approval in real-time.</p></div>
        <button className="primary-button" onClick={() => alert("Add student modal opened successfully!")}><Icon name="plus" />Add student</button>
      </div>
      <section className="detail-hero">
        <div><Badge tone="blue">Currently active</Badge><h2>Nusrat Jahan <span>EA-240179</span></h2><p>IELTS-008398 · Submitted 10 June 2024</p></div>
        <button onClick={() => alert("Opening full profile details")}>Open full profile <Icon name="external" /></button>
        <Timeline />
      </section>
      <StudentTable full />
    </div>
  );
}

function PayoutsPage() {
  const dynamicTransactions = [
    { id: "TXN-EA-884201", time: "18 Jun 2024 · 02:42 PM", student: "Mehedi Hasan", ref: "EA-240184", amount: "+ ৳20,000", status: "Paid" },
    { id: "TXN-EA-883917", time: "16 Jun 2024 · 11:18 AM", student: "Arif Chowdhury", ref: "EA-240163", amount: "+ ৳2,000", status: "Paid" },
    { id: "TXN-EA-882654", time: "12 Jun 2024 · 09:06 AM", student: "Nusrat Jahan", ref: "EA-240179", amount: "+ ৳2,000", status: "Paid" },
    { id: "TXN-EA-879342", time: "04 Jun 2024 · 04:31 PM", student: "Sumaiya Akter", ref: "EA-240142", amount: "+ ৳2,000", status: "Pending" },
  ];
  return (
    <div className="partner-content page-content">
      <div className="section-heading page-title">
        <div><p className="eyebrow">Financial center</p><h1>Payouts & transactions</h1><p>Clear, timestamped records for every student referral.</p></div>
        <button className="primary-button" onClick={() => alert("Withdrawal request initiated successfully!")}><Icon name="wallet" />Request withdrawal</button>
      </div>
      <section className="wallet-grid">
        <article className="balance-card primary"><span><Icon name="wallet" /></span><p>Current balance</p><h2>৳ 62,000</h2><small>Available for withdrawal</small></article>
        <article className="balance-card"><span><Icon name="clock" /></span><p>Pending audit clearance</p><h2>৳ 24,000</h2><small>Clears within 7 business days</small></article>
        <article className="balance-card"><span><Icon name="check" /></span><p>Total withdrawn</p><h2>৳ 7,56,000</h2><small>Lifetime partner earnings</small></article>
      </section>
      <section className="table-card partner-table-card">
        <div className="card-heading table-heading">
          <div><h3>Transaction ledger</h3><p>Every payment, exact to the minute</p></div>
          <button className="secondary-button" onClick={() => alert("Financial statement exported successfully as PDF/CSV!")}><Icon name="download" />Export statement</button>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Transaction ID</th><th>Exact timestamp</th><th>Student reference</th><th>Amount (BDT)</th><th>Status</th><th>Invoice</th></tr></thead>
            <tbody>
              {dynamicTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="id-cell">{t.id}</td>
                  <td>{t.time}</td>
                  <td><div className="ref-cell"><strong>{t.student}</strong><small>{t.ref}</small></div></td>
                  <td className="amount-cell">{t.amount}</td>
                  <td><Badge tone="green">{t.status}</Badge></td>
                  <td><button className="invoice-button" onClick={() => alert(`Invoice download started for Transaction ID: ${t.id}`)}><Icon name="download" />Invoice</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function QrKitPage({ partnerName }: { partnerName: string }) {
  return (
    <div className="partner-content page-content">
      <div className="section-heading page-title">
        <div><p className="eyebrow">Marketing toolkit</p><h1>Your QR Standee Kit</h1><p>Turn walk-in interest into trackable student registrations.</p></div>
        <button className="primary-button" onClick={() => alert("A4 Standee PDF downloaded successfully!")}><Icon name="download" />Download A4 PDF</button>
      </div>
      <section className="qr-hub">
        <div className="standee-zone">
          <p className="zone-label">Live print preview · A4 portrait</p>
          <div className="standee">
            <div className="standee-top">
              <div className="standee-brand"><span>{partnerName ? partnerName.slice(0, 2).toUpperCase() : "BS"}</span><strong>{partnerName || "British Study Centre"}</strong></div>
              <small>OFFICIAL PARTNER</small>
            </div>
            <div className="standee-body">
              <p>YOUR GLOBAL STUDY<br />JOURNEY STARTS HERE</p>
              <h2>Scan. Register.<br /><span>Take the first step.</span></h2>
              <div className="qr-frame"><QrCode large /><i className="corner c1" /><i className="corner c2" /><i className="corner c3" /><i className="corner c4" /></div>
              <strong className="scan-copy">SCAN TO REGISTER</strong>
              <small>Fast, secure and completely free</small>
            </div>
            <div className="standee-footer"><BrandMark /><span>Partner ID · BSC-024</span></div>
          </div>
        </div>
        <aside className="kit-panel">
          <div><p className="eyebrow">Ready to print</p><h2>Your branded acquisition kit</h2><p>The QR code is unique to your organization. Every scan and registration is automatically attributed to your account.</p></div>
          <ul>
            <li><span><Icon name="check" /></span><div><strong>High-resolution A4 PDF</strong><small>300 DPI, print-ready with bleed</small></div></li>
            <li><span><Icon name="check" /></span><div><strong>Unique tracking enabled</strong><small>All leads flow directly into your live dashboard</small></div></li>
          </ul>
          <button className="primary-button full" onClick={() => alert("A4 Print PDF Downloaded!")}><Icon name="download" />Download A4 PDF <span>2.4 MB</span></button>
          <button className="secondary-button full" onClick={() => {
            navigator.clipboard?.writeText(`https://${(partnerName || 'britishstudy').toLowerCase().replace(/\s+/g, '')}.eduaimers.com`);
            alert("Digital QR link copied to clipboard!");
          }}><Icon name="send" />Share digital QR link</button>
        </aside>
      </section>
    </div>
  );
}

function PartnerPortal({ onAdmin, partnerName }: { onAdmin: () => void; partnerName: string }) {
  const [page, setPage] = useState<View>("dashboard");
  return (
    <div className="partner-shell">
      <PartnerHeader active={page} onNav={setPage} onAdmin={onAdmin} partnerName={partnerName} />
      <main>
        {page === "dashboard" && <PartnerDashboard partnerName={partnerName} onNav={setPage} />}
        {page === "students" && <StudentsPage />}
        {page === "payouts" && <PayoutsPage />}
        {page === "qr" && <QrKitPage partnerName={partnerName} />}
        {page === "support" && (
          <div className="partner-content page-content support-page" style={{ padding: "40px", textAlign: "center" }}>
            <span><Icon name="headset" size={36} /></span>
            <p className="eyebrow">Partner success desk</p>
            <h1>How can we help?</h1>
            <p>Our support team is available Sunday–Thursday, 9:00 AM–6:00 PM.</p>
            <button className="primary-button" onClick={() => alert("Support ticket opened successfully! Our team will contact you shortly.")}><Icon name="send" />Start a conversation</button>
          </div>
        )}
      </main>
      <footer className="partner-footer">
        <BrandMark />
        <p>© 2026 EduAimers. Secure partner infrastructure.</p>
        <div><a href="#privacy">Privacy</a><a href="#terms">Terms</a><span><i />Systems operational</span></div>
      </footer>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<"admin" | "partner">("admin");
  const [activePartner, setActivePartner] = useState("British Study Centre");

  return mode === "admin" ? (
    <AdminPanel onPortal={(name) => { if (name) setActivePartner(name); setMode("partner"); }} activePartner={activePartner} setActivePartner={setActivePartner} />
  ) : (
    <PartnerPortal onAdmin={() => setMode("admin")} partnerName={activePartner} />
  );
}