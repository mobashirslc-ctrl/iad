import { FormEvent, ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
// Provided Cloudinary Official EduAimers Logo URL
const EDUAIMERS_LOGO_URL = "https://res.cloudinary.com/ddziennkh/image/upload/v1794215144/Artboard_1_gwsk5n.png";

type AdminView = "overview" | "partners" | "qr" | "payouts" | "support" | "settings" | "students_control";
type PartnerView = "dashboard" | "students" | "payouts" | "qr" | "support";
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
    building: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2M10 21v-3h4v3" /></>,
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
    students: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 1 0 7.75" /></>,
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
    <div className="brand-mark" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <img src={EDUAIMERS_LOGO_URL} alt="EduAimers Logo" style={{ height: compact ? "26px" : "34px", objectFit: "contain" }} />
    </div>
  );
}

function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "red" | "amber" | "blue" | "gray" }) {
  return <span className={`badge badge-${tone}`}><i />{children}</span>;
}

function QrCode({ value }: { value: string }) {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}`;
  return (
    <div style={{ background: "#fff", padding: "10px", borderRadius: "8px", display: "inline-block", border: "1px solid #ddd" }}>
      <img src={qrImageUrl} alt="Dynamic QR Standee" style={{ width: "160px", height: "160px", display: "block" }} />
    </div>
  );
}

function AdminPanel({ onPortal, activePartner, setActivePartner, setPartnerLogo }: { onPortal: (partnerName?: string) => void; activePartner: string; setActivePartner: (name: string) => void; setPartnerLogo: (logo: string | null) => void }) {
  const [currentAdminView, setCurrentAdminView] = useState<AdminView>("overview");
  const [showForm, setShowForm] = useState(false);
  const [provisioned, setProvisioned] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  const [orgName, setOrgName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [contact, setContact] = useState("");
  const [nid, setNid] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [defaultFileFee, setDefaultFileFee] = useState("2000");
  const [defaultVisaFee, setDefaultVisaFee] = useState("5000");
  const [logoFile, setLogoFile] = useState<string | null>(null);

  const [selectedStudentForAction, setSelectedStudentForAction] = useState<any | null>(null);
  const [selectedPartnerForEdit, setSelectedPartnerForEdit] = useState<any | null>(null);
  
  const [assessmentResultText, setAssessmentResultText] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState("");
  const [fileOpeningFee, setFileOpeningFee] = useState("2000");
  const [afterVisaFee, setAfterVisaFee] = useState("5000");
  const [downloadingStandee, setDownloadingStandee] = useState(false);
  const newStandeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "partners"), orderBy("createdAt", "desc"));
    const unsubPartners = onSnapshot(q, (snapshot) => {
      setPartnersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qStudents = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsubStudents = onSnapshot(qStudents, (snapshot) => {
      setStudentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPartners();
      unsubStudents();
    };
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
        fileOpeningFee: defaultFileFee,
        afterVisaFee: defaultVisaFee,
        initials: orgName ? orgName.slice(0, 2).toUpperCase() : "BS",
        students: 0,
        earned: "৳ 0",
        status: "Active",
        logo: logoFile || null,
        createdAt: new Date()
      };
      await addDoc(collection(db, "partners"), newPartner);
      setActivePartner(orgName);
      setPartnerLogo(logoFile);
      setProvisioned(true);
    } catch (error) {
      console.error("Error adding partner: ", error);
      setActivePartner(orgName);
      setPartnerLogo(logoFile);
      setProvisioned(true);
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateStudentDetails = async (studentId: string, fields: any) => {
    try {
      const studentDocRef = doc(db, "students", studentId);
      await updateDoc(studentDocRef, fields);
      alert("Student record & stage updated successfully!");
      setSelectedStudentForAction(null);
    } catch (err) {
      console.error("Error updating student:", err);
    }
  };

  const togglePartnerStatus = async (partnerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await updateDoc(doc(db, "partners", partnerId), { status: nextStatus });
      alert(`Partner status updated to ${nextStatus}`);
    } catch (err) {
      console.error(err);
    }
  };

  const updatePartnerFees = async (partnerId: string) => {
    if (!selectedPartnerForEdit) return;
    try {
      await updateDoc(doc(db, "partners", partnerId), {
        fileOpeningFee: selectedPartnerForEdit.fileOpeningFee || "2000",
        afterVisaFee: selectedPartnerForEdit.afterVisaFee || "5000"
      });
      alert("Partner customized fees saved successfully!");
      setSelectedPartnerForEdit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const partnerDashboardLink = `${window.location.origin}/?partner=${encodeURIComponent(orgName || "British Study Centre")}`;
  const studentQrAssessmentLink = `${window.location.origin}/?partner=${encodeURIComponent(orgName || "British Study Centre")}&assessment=true`;

  const handleDownloadNewStandee = async () => {
    if (!newStandeeRef.current) return;
    try {
      setDownloadingStandee(true);
      const canvas = await html2canvas(newStandeeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${(orgName || "partner").toLowerCase().replace(/\s+/g, '-')}-qr-standee.png`;
      link.click();
    } catch (error) {
      console.error("Failed to generate QR image:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setDownloadingStandee(false);
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo"><BrandMark /></div>
        <nav className="side-nav" aria-label="Admin navigation">
          <p>Workspace</p>
          <button className={currentAdminView === "overview" ? "active" : ""} onClick={() => setCurrentAdminView("overview")}><Icon name="grid" />Overview</button>
          <button className={currentAdminView === "partners" ? "active" : ""} onClick={() => setCurrentAdminView("partners")}><Icon name="building" />Partner Management<span className="nav-count">{partnersList.length}</span></button>
          <button className={currentAdminView === "students_control" ? "active" : ""} onClick={() => setCurrentAdminView("students_control")}><Icon name="students" />Student Tracking & Assessment</button>
          <button className={currentAdminView === "qr" ? "active" : ""} onClick={() => setCurrentAdminView("qr")}><Icon name="qr" />QR Standees</button>
          <button className={currentAdminView === "payouts" ? "active" : ""} onClick={() => setCurrentAdminView("payouts")}><Icon name="wallet" />Global Payouts & History</button>
          <p>System</p>
          <button className={currentAdminView === "support" ? "active" : ""} onClick={() => setCurrentAdminView("support")}><Icon name="headset" />Support</button>
          <button className={currentAdminView === "settings" ? "active" : ""} onClick={() => setCurrentAdminView("settings")}><Icon name="gear" />Settings</button>
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
            <button className="portal-preview" onClick={() => {
              const currentP = partnersList.find(p => p.name === activePartner);
              setPartnerLogo(currentP?.logo || null);
              onPortal(activePartner);
            }}><Icon name="eye" />Preview partner portal</button>
            <button className="primary-button" onClick={() => { setProvisioned(false); setShowForm(true); }}><Icon name="plus" />Add new partner</button>
          </div>
        </header>
        <div className="admin-content">
          {currentAdminView === "overview" && (
            <>
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
                  { label: "Active partners", value: partnersList.filter(p=>p.status!=="Suspended").length.toString(), change: "Live Firestore Sync", icon: "building" as IconName },
                  { label: "Total students", value: studentsList.length.toString(), change: "Live Registrations", icon: "students" as IconName },
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
                    <h3>Active IELTS partners</h3>
                    <p>Manage your white-label partner network & generate live Vercel links</p>
                  </div>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Organization</th>
                        <th>Owner</th>
                        <th>File / Visa Fee</th>
                        <th>Students</th>
                        <th>Status</th>
                        <th>Quick actions & Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnersList.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No partners found. Click "Add new partner" above.</td></tr>
                      ) : (
                        partnersList.map((p, idx) => {
                          const rowLink = `${window.location.origin}/?partner=${encodeURIComponent(p.name)}`;
                          return (
                            <tr key={p.id || idx}>
                              <td>
                                <div className="org-cell" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  {p.logo ? (
                                    <img src={p.logo} alt={p.name} style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid #ddd" }} />
                                  ) : (
                                    <span>{p.initials || "BS"}</span>
                                  )}
                                  <strong>{p.name}</strong>
                                </div>
                              </td>
                              <td>{p.owner || "N/A"}</td>
                              <td><small style={{ color: "#555" }}>File: ৳{p.fileOpeningFee || 2000} | Visa: ৳{p.afterVisaFee || 5000}</small></td>
                              <td>{studentsList.filter(s => s.partnerName?.toLowerCase() === p.name?.toLowerCase()).length}</td>
                              <td><Badge tone={p.status === "Suspended" ? "red" : "green"}>{p.status || "Active"}</Badge></td>
                              <td>
                                <div className="row-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <button className="primary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => { setActivePartner(p.name); setPartnerLogo(p.logo || null); onPortal(p.name); }}>
                                    Open Portal <Icon name="external" size={14} />
                                  </button>
                                  <button className="secondary-button" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={() => {
                                    navigator.clipboard?.writeText(rowLink);
                                    alert(`Dedicated Partner Dashboard Link copied:\n${rowLink}`);
                                  }}>
                                    Copy Partner Link
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {currentAdminView === "partners" && (
            <section className="table-card" style={{ marginTop: "20px" }}>
              <div className="card-heading table-heading">
                <div>
                  <h3>Partner Management & Agreement Customization</h3>
                  <p>Customize negotiable commissions (File Opening Fee & After Visa Fee), suspend or reactivate partner accounts.</p>
                </div>
                <button className="primary-button" onClick={() => { setProvisioned(false); setShowForm(true); }}><Icon name="plus" />Add Partner</button>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr><th>Organization</th><th>Owner</th><th>Custom Agreements</th><th>Bank / MFS</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {partnersList.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {p.logo && <img src={p.logo} alt="" style={{ width: "28px", height: "28px", borderRadius: "4px", objectFit: "cover" }} />}
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td>{p.owner}</td>
                        <td>
                          <small><strong>File:</strong> ৳{p.fileOpeningFee || 2000}</small><br />
                          <small><strong>Visa:</strong> ৳{p.afterVisaFee || 5000}</small>
                        </td>
                        <td><small>{p.bankAccount || "N/A"}</small></td>
                        <td><Badge tone={p.status === "Suspended" ? "red" : "green"}>{p.status || "Active"}</Badge></td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="secondary-button" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={() => setSelectedPartnerForEdit(p)}>
                              Edit Fees
                            </button>
                            <button 
                              style={{ background: p.status === "Suspended" ? "#2b8a3e" : "#d40511", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", cursor: "pointer" }}
                              onClick={() => togglePartnerStatus(p.id, p.status || "Active")}
                            >
                              {p.status === "Suspended" ? "Reactivate" : "Suspend"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {currentAdminView === "students_control" && (
            <section className="table-card" style={{ marginTop: "20px" }}>
              <div className="card-heading table-heading">
                <div>
                  <h3>Student Assessment & Full Workflow Control Center</h3>
                  <p>Review full student profiles, update application stages from Offer Letter to Visa Confirmation, and release commissions.</p>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Phone (ID)</th>
                      <th>Student Profile & Details</th>
                      <th>IELTS Owner / Partner</th>
                      <th>Current Stage</th>
                      <th>Student Choice</th>
                      <th>Full Profile & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No students registered yet via QR scans.</td></tr>
                    ) : (
                      studentsList.map((s) => {
                        const currentP = partnersList.find(p => p.name?.toLowerCase() === s.partnerName?.toLowerCase());
                        return (
                          <tr key={s.id}>
                            <td><strong>{s.phone}</strong></td>
                            <td>
                              <div><strong>{s.fullName}</strong> ({s.email})</div>
                              <small style={{ color: "#444" }}>
                                Country: {s.preferredCountry} | Degree: {s.preferredDegree} | GPA: {s.gpaCgpa} ({s.lastAcademicDegree})
                              </small><br />
                              <small style={{ color: "#666" }}>Univ: {s.preferredUniversity || "N/A"}, {s.preferredCity || "N/A"} | IELTS: {s.ieltsScore || "N/A"} | Budget: {s.budget || "N/A"}</small>
                            </td>
                            <td><strong>{s.partnerName}</strong></td>
                            <td><Badge tone="blue">{s.currentStage || "Assessment Submitted (Waiting)"}</Badge></td>
                            <td><Badge tone={s.studentChoice === "Yes" ? "green" : s.studentChoice === "No" ? "red" : "amber"}>{s.studentChoice || "Pending"}</Badge></td>
                            <td>
                              <button
                                className="primary-button"
                                style={{ padding: "6px 12px", fontSize: "12px" }}
                                onClick={() => {
                                  setSelectedStudentForAction(s);
                                  setAssessmentResultText(s.assessmentResult || "Eligible for UK universities with your current GPA & IELTS.");
                                  setAppointmentDetails(s.appointmentDetails || "Eduaimers Office, Shyamoli, Dhaka. Date: Tomorrow, 3:00 PM.");
                                  setFileOpeningFee(s.fileOpeningFee || currentP?.fileOpeningFee || "2000");
                                  setAfterVisaFee(s.afterVisaFee || currentP?.afterVisaFee || "5000");
                                }}
                              >
                                View Profile & Stages
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {currentAdminView === "payouts" && (
            <div className="partner-content page-content" style={{ padding: "20px" }}>
              <h2>Global Payouts & History Center</h2>
              <p>Process pending withdrawal requests from IELTS partners and change payment statuses.</p>

              <section className="table-card" style={{ marginTop: "20px" }}>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr><th>Partner Name</th><th>Student</th><th>Commission Type</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {studentsList.filter(s => s.fileOpened || s.visaDone).length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No commissions generated yet.</td></tr>
                      ) : (
                        studentsList.filter(s => s.fileOpened || s.visaDone).map((s) => (
                          <tr key={s.id}>
                            <td><strong>{s.partnerName}</strong></td>
                            <td>{s.fullName} ({s.phone})</td>
                            <td>{s.visaDone ? "After Visa Commission" : "File Opening Commission"}</td>
                            <td>৳{s.visaDone ? (s.afterVisaFee || "5000") : (s.fileOpeningFee || "2000")}</td>
                            <td><Badge tone={s.paymentStatus === "Paid" ? "green" : "amber"}>{s.paymentStatus || (s.withdrawRequested ? "Withdrawal Requested" : "Credited")}</Badge></td>
                            <td>
                              {s.paymentStatus !== "Paid" ? (
                                <button 
                                  className="primary-button"
                                  style={{ padding: "4px 8px", fontSize: "12px", background: "#2b8a3e" }}
                                  onClick={async () => {
                                    await updateDoc(doc(db, "students", s.id), { paymentStatus: "Paid" });
                                    alert("Payment marked as PAID successfully!");
                                  }}
                                >
                                  Release Payment (Mark Paid)
                                </button>
                              ) : (
                                <span style={{ color: "green", fontSize: "12px", fontWeight: "bold" }}>● Transaction Complete</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {currentAdminView === "qr" && (
            <div className="partner-content page-content" style={{ padding: "20px" }}>
              <h2>Master QR Standee Hub</h2>
              <p>Generate and audit print kits for all registered partner institutions.</p>
              <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {partnersList.map((p, idx) => (
                  <div key={idx} style={{ background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eaeaea", textAlign: "center" }}>
                    {p.logo && <img src={p.logo} alt="" style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover", margin: "0 auto 10px" }} />}
                    <h3>{p.name}</h3>
                    <p style={{ fontSize: "12px", color: "#666" }}>Owner: {p.owner}</p>
                    <button className="primary-button" style={{ marginTop: "12px", width: "100%" }} onClick={() => { setActivePartner(p.name); setPartnerLogo(p.logo || null); onPortal(p.name); }}>
                      View & Download QR Standee
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal for Provisioning New Partner */}
      {showForm && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <section className="provision-modal" style={{ width: "650px", maxWidth: "95%" }}>
            <div className="modal-header">
              <div>
                <span className="modal-icon"><Icon name={provisioned ? "check" : "building"} /></span>
                <div>
                  <p>{provisioned ? "Partner provisioned" : "Partner provisioning"}</p>
                  <h2>{provisioned ? "Portal & QR Kit is ready to go" : "Add new IELTS partner"}</h2>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} aria-label="Close"><Icon name="close" /></button>
            </div>
            {provisioned ? (
              <div className="success-view" style={{ textAlign: "left" }}>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div className="success-orbit" style={{ margin: "0 auto 10px" }}><span><Icon name="check" size={32} /></span></div>
                  <h3 style={{ margin: 0 }}>Partner Portal & QR Standee Generated</h3>
                  <p style={{ fontSize: "13px", color: "#666" }}>Share the partner dashboard link with the IELTS owner, and download the QR standee below.</p>
                </div>

                {/* Partner Dashboard Link Box */}
                <div className="domain-card" style={{ marginBottom: "12px", background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid #eaeaea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ overflow: "hidden", paddingRight: "10px" }}>
                    <span style={{ display: "block", fontSize: "11px", color: "#555", fontWeight: "bold" }}>1. PARTNER DASHBOARD LINK (For IELTS Owner)</span>
                    <strong style={{ fontSize: "12px", wordBreak: "break-all", color: "#d40511" }}>{partnerDashboardLink}</strong>
                  </div>
                  <button onClick={() => { 
                    navigator.clipboard?.writeText(partnerDashboardLink); 
                    setCopied(true); 
                  }} style={{ whiteSpace: "nowrap" }}>
                    <Icon name={copied ? "check" : "file"} size={14} />{copied ? "Copied" : "Copy Link"}
                  </button>
                </div>

                {/* Student QR Link Box */}
                <div className="domain-card" style={{ marginBottom: "20px", background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid #eaeaea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ overflow: "hidden", paddingRight: "10px" }}>
                    <span style={{ display: "block", fontSize: "11px", color: "#555", fontWeight: "bold" }}>2. STUDENT ASSESSMENT QR LINK (For Standee Scan)</span>
                    <strong style={{ fontSize: "12px", wordBreak: "break-all", color: "#2b8a3e" }}>{studentQrAssessmentLink}</strong>
                  </div>
                  <button onClick={() => { 
                    navigator.clipboard?.writeText(studentQrAssessmentLink); 
                    setCopiedQr(true); 
                  }} style={{ whiteSpace: "nowrap" }}>
                    <Icon name={copiedQr ? "check" : "file"} size={14} />{copiedQr ? "Copied" : "Copy QR Link"}
                  </button>
                </div>

                {/* Perfect Centered Standee Preview Box */}
                <div style={{ background: "#f1f3f5", padding: "16px", borderRadius: "12px", border: "2px dashed #d40511", textAlign: "center", marginBottom: "20px" }}>
                  <p style={{ fontSize: "12px", fontWeight: "bold", color: "#444", marginBottom: "12px" }}>📥 Downloadable Standee QR Image (Centered with EduAimers Logo)</p>
                  
                  {/* Standee Render Card */}
                  <div ref={newStandeeRef} style={{ background: "#fff", padding: "24px 20px", width: "300px", margin: "0 auto", borderRadius: "12px", border: "1px solid #ddd", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #d40511", paddingBottom: "10px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {logoFile ? (
                          <img src={logoFile} alt="" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                        ) : (
                          <span style={{ background: "#d40511", color: "#fff", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontWeight: "bold", fontSize: "14px" }}>
                            {orgName ? orgName.slice(0, 2).toUpperCase() : "BS"}
                          </span>
                        )}
                        <strong style={{ fontSize: "14px", color: "#111" }}>{orgName || "British Study Centre"}</strong>
                      </div>
                      <small style={{ fontWeight: "bold", color: "#666", fontSize: "10px" }}>IELTS PARTNER</small>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                      <p style={{ fontSize: "10px", color: "#d40511", fontWeight: "bold", letterSpacing: "1px", margin: "0 0 4px" }}>GLOBAL STUDY JOURNEY</p>
                      <h4 style={{ fontSize: "16px", margin: "0 0 16px", fontWeight: "800", color: "#111" }}>Scan to Assess.<br /><span style={{ color: "#d40511" }}>Take the first step.</span></h4>
                      
                      {/* Perfectly Centered QR Frame */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px", background: "#fff", border: "2px solid #111", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                        <QrCode value={studentQrAssessmentLink} />
                      </div>

                      <strong style={{ display: "block", fontSize: "12px", marginTop: "12px", letterSpacing: "0.5px", color: "#111" }}>SCAN FOR ASSESSMENT</strong>
                      <small style={{ color: "#666", fontSize: "10px", marginTop: "2px" }}>Fast, secure and free</small>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "12px", marginTop: "16px" }}>
                      <img src={EDUAIMERS_LOGO_URL} alt="EduAimers" style={{ height: "24px", objectFit: "contain" }} />
                      <small style={{ fontSize: "10px", color: "#666", fontWeight: "600" }}>Official Infrastructure</small>
                    </div>
                  </div>

                  <button className="primary-button" style={{ marginTop: "16px", width: "100%", background: "#2b8a3e" }} onClick={handleDownloadNewStandee} disabled={downloadingStandee}>
                    <Icon name="download" size={16} /> {downloadingStandee ? "Generating QR Image..." : "Download Standee QR Image (PNG)"}
                  </button>
                </div>

                <div className="success-links" style={{ display: "flex", gap: "10px" }}>
                  <button className="secondary-button" style={{ flex: 1 }} onClick={() => { setShowForm(false); onPortal(orgName); }}><Icon name="external" size={14} /> Open Partner Portal Now</button>
                  <button className="primary-button" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Done</button>
                </div>
              </div>
            ) : (
              <form className="partner-form" onSubmit={provision}>
                <p className="form-intro">Enter organization details. Dedicated partner dashboard link and QR standee will be generated instantly.</p>
                <div className="form-grid">
                  <label className="full">Organization name<input required value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. British Study Centre" /></label>
                  <label>Owner name<input required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full legal name" /></label>
                  <label>Contact number<input required value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+880 1XXX XXXXXX" /></label>
                  <label>Default File Fee (BDT)<input required value={defaultFileFee} onChange={(e) => setDefaultFileFee(e.target.value)} placeholder="2000" /></label>
                  <label>Default Visa Fee (BDT)<input required value={defaultVisaFee} onChange={(e) => setDefaultVisaFee(e.target.value)} placeholder="5000" /></label>
                  <label className="full">Bank / MFS account<input required value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Account number for payout" /></label>
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
                  <button className="primary-button" type="submit">Provision & Generate Link <Icon name="arrow" /></button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function StudentDashboardView({ studentData, partnerName, partnerLogo, onLogout }: { studentData: any; partnerName: string; partnerLogo: string | null; onLogout: () => void }) {
  const [currentStudent, setCurrentStudent] = useState<any>(studentData);

  useEffect(() => {
    const q = query(collection(db, "students"));
    const unsub = onSnapshot(q, (snapshot) => {
      const found = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).find(
        (s: any) => s.phone === studentData.phone
      );
      if (found) setCurrentStudent(found);
    });
    return () => unsub();
  }, [studentData.phone]);

  const handleStudentChoice = async (choice: "Yes" | "No") => {
    try {
      const docRef = doc(db, "students", currentStudent.id);
      await updateDoc(docRef, { studentChoice: choice });
      alert(`Your response "${choice}" has been submitted successfully!`);
    } catch (err) {
      console.error(err);
    }
  };

  const isWaiting = !currentStudent.assessmentResult;
  const isAssessmentPublished = currentStudent.assessmentResult && currentStudent.currentStage !== "File Opening Done";
  const isFileOpened = currentStudent.currentStage === "File Opening Done" || currentStudent.fileOpened;

  return (
    <div style={{ maxWidth: "650px", margin: "40px auto", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {partnerLogo ? (
            <img src={partnerLogo} alt={partnerName} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid #ddd" }} />
          ) : (
            <span style={{ background: "#d40511", color: "#fff", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontWeight: "bold" }}>{partnerName.slice(0, 2).toUpperCase()}</span>
          )}
          <div>
            <strong>{partnerName}</strong>
            <small style={{ display: "block", color: "#666" }}>Dedicated Student Portal</small>
          </div>
        </div>
        <button className="secondary-button" onClick={onLogout} style={{ fontSize: "12px" }}>Exit Dashboard</button>
      </div>

      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <h3 style={{ color: "#111" }}>Welcome, {currentStudent.fullName}!</h3>
        <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>Dedicated Unique Phone ID: <strong>{currentStudent.phone}</strong></p>
        
        <div style={{ marginTop: "24px", background: "#f8f9fa", padding: "24px", borderRadius: "8px", border: "1px solid #e9ecef", textAlign: "left" }}>
          <h4 style={{ marginBottom: "12px" }}>📊 Application Status & Result</h4>
          
          <div style={{ background: "#e3f2fd", padding: "12px", borderRadius: "6px", marginBottom: "16px", color: "#0d47a1" }}>
            <p style={{ margin: 0, fontSize: "13px" }}><strong>Current Application Stage:</strong> {currentStudent.currentStage || "Assessment Submitted (Waiting)"}</p>
          </div>

          {isWaiting && (
            <div style={{ background: "#fff3cd", padding: "16px", borderRadius: "6px", border: "1px solid #ffeeba", color: "#856404", textAlign: "center" }}>
              <h4 style={{ margin: "0 0 6px" }}>⏳ Waiting for your assessment result...</h4>
              <p style={{ fontSize: "13px", margin: 0 }}>Our expert team is reviewing your academic details and preferences. Please check back shortly.</p>
            </div>
          )}

          {isAssessmentPublished && (
            <div style={{ background: "#fff", padding: "16px", borderRadius: "6px", border: "1px solid #ddd" }}>
              <h4 style={{ color: "#2b8a3e", marginBottom: "8px" }}>✅ Assessment Result Published</h4>
              <p style={{ fontSize: "14px", color: "#333", background: "#f1f3f5", padding: "10px", borderRadius: "6px" }}>{currentStudent.assessmentResult}</p>
              
              <div style={{ marginTop: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>Do you want to proceed with further process (File Opening / Physical Counseling)?</p>
                {currentStudent.studentChoice ? (
                  <Badge tone={currentStudent.studentChoice === "Yes" ? "green" : "red"}>Your Response: {currentStudent.studentChoice}</Badge>
                ) : (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="primary-button" style={{ background: "#2b8a3e" }} onClick={() => handleStudentChoice("Yes")}>Yes, Proceed</button>
                    <button className="secondary-button" style={{ background: "#d40511", color: "#fff" }} onClick={() => handleStudentChoice("No")}>No</button>
                  </div>
                )}
              </div>

              {currentStudent.studentChoice === "Yes" && (
                <div style={{ marginTop: "16px", background: "#e8f5e9", padding: "14px", borderRadius: "6px", border: "1px solid #c8e6c9" }}>
                  <h5 style={{ color: "#2e7d32", margin: "0 0 6px" }}>📅 Appointment Details</h5>
                  <p style={{ fontSize: "13px", margin: 0 }}>{currentStudent.appointmentDetails || "Eduaimers office will assign your appointment date & time within 24 hours."}</p>
                </div>
              )}
            </div>
          )}

          {isFileOpened && (
            <div style={{ background: "#d4edda", padding: "16px", borderRadius: "6px", border: "1px solid #c3e6cb", color: "#155724", textAlign: "center", marginTop: "12px" }}>
              <h4 style={{ margin: "0 0 6px" }}>🎉 File Opening Completed!</h4>
              <p style={{ fontSize: "13px", margin: 0 }}>Your file has been successfully opened at Eduaimers office.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AssessmentFormView({ partnerName, partnerLogo, onAssessmentComplete }: { partnerName: string; partnerLogo: string | null; onAssessmentComplete: (data: any) => void }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  const [preferredUniversity, setPreferredUniversity] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
  const [preferredCountry, setPreferredCountry] = useState("UK");
  const [lastAcademicDegree, setLastAcademicDegree] = useState("");
  const [preferredDegree, setPreferredDegree] = useState("");
  const [gpaCgpa, setGpaCgpa] = useState("");
  const [ieltsScore, setIeltsScore] = useState("");
  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [copiedFormLink, setCopiedFormLink] = useState(false);

  // Student Phone ID Quick Status Search State
  const [searchPhoneInput, setSearchPhoneInput] = useState("");
  const [trackedStudent, setTrackedStudent] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const currentAssessmentUrl = window.location.href;

  useEffect(() => {
    const q = query(collection(db, "partners"));
    const unsub = onSnapshot(q, (snapshot) => {
      const found = snapshot.docs.find(doc => doc.data().name?.toLowerCase() === partnerName.toLowerCase());
      if (found && found.data().status === "Suspended") {
        setIsSuspended(true);
      } else {
        setIsSuspended(false);
      }
    });
    return () => unsub();
  }, [partnerName]);

  const handlePhoneSearchTrack = async (e: FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const q = query(collection(db, "students"));
    onSnapshot(q, (snapshot) => {
      const match = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find((s: any) => s.phone === searchPhoneInput.trim());
      setTrackedStudent(match || null);
    });
  };

  const handleSubmitAssessment = async (e: FormEvent) => {
    e.preventDefault();
    if (isSuspended) {
      alert("This partner account is currently suspended. Submissions are temporarily paused.");
      return;
    }
    setLoading(true);
    const studentPayload = {
      fullName,
      phone,
      email,
      preferredUniversity,
      preferredCity,
      preferredCountry,
      lastAcademicDegree,
      preferredDegree,
      gpaCgpa,
      ieltsScore,
      budget,
      partnerName,
      currentStage: "Assessment Submitted (Waiting)",
      createdAt: new Date()
    };

    try {
      await addDoc(collection(db, "students"), studentPayload);
      onAssessmentComplete(studentPayload);
    } catch (err) {
      console.error("Assessment submission error:", err);
      onAssessmentComplete(studentPayload);
    } finally {
      setLoading(false);
    }
  };

  if (isSuspended) {
    return (
      <div style={{ maxWidth: "500px", margin: "60px auto", background: "#fff", padding: "40px", borderRadius: "12px", textAlign: "center", border: "1px solid #f5c6cb" }}>
        <h2 style={{ color: "#721c24" }}>Partner Suspended</h2>
        <p style={{ color: "#721c24", marginTop: "10px" }}>This IELTS institution's portal is currently suspended. Please contact EduAimers admin.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "680px", margin: "40px auto", background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {/* Top Header without EduAimers Logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {partnerLogo ? (
            <img src={partnerLogo} alt={partnerName} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", border: "1px solid #ddd" }} />
          ) : (
            <span style={{ background: "#d40511", color: "#fff", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontWeight: "bold" }}>{partnerName.slice(0, 2).toUpperCase()}</span>
          )}
          <div>
            <strong>{partnerName}</strong>
            <small style={{ display: "block", color: "#666" }}>Official IELTS Assessment Portal</small>
          </div>
        </div>

        {/* Copy Link Option for Students */}
        <button 
          className="secondary-button" 
          style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
          onClick={() => {
            navigator.clipboard?.writeText(currentAssessmentUrl);
            setCopiedFormLink(true);
            setTimeout(() => setCopiedFormLink(false), 3000);
          }}
        >
          <Icon name={copiedFormLink ? "check" : "file"} size={14} />
          {copiedFormLink ? "Link Copied!" : "Copy Assessment Link"}
        </button>
      </div>

      {/* Student Return User Quick Track Box */}
      <div style={{ background: "#f8f9fa", padding: "16px 20px", borderRadius: "10px", border: "1px solid #e9ecef", marginBottom: "28px" }}>
        <h4 style={{ margin: "0 0 4px", fontSize: "14px", color: "#111" }}>🔍 Already Submitted? Track Application Status</h4>
        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 10px" }}>Enter your registered Phone Number (Unique ID) to view your live assessment result and appointment details.</p>
        
        <form onSubmit={handlePhoneSearchTrack} style={{ display: "flex", gap: "8px" }}>
          <input 
            type="text" 
            required 
            value={searchPhoneInput} 
            onChange={e => setSearchPhoneInput(e.target.value)} 
            placeholder="Enter Phone Number (+8801...)" 
            style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
          />
          <button type="submit" className="primary-button" style={{ padding: "8px 16px", fontSize: "13px", whiteSpace: "nowrap" }}>
            Check Status
          </button>
        </form>

        {hasSearched && (
          <div style={{ marginTop: "14px", background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid #ddd" }}>
            {trackedStudent ? (
              <div>
                <p style={{ margin: 0, fontWeight: "bold", color: "#d40511" }}>Hello {trackedStudent.fullName}!</p>
                <p style={{ fontSize: "13px", margin: "4px 0" }}><strong>Stage:</strong> {trackedStudent.currentStage || "Assessment Submitted (Waiting)"}</p>
                {trackedStudent.assessmentResult && <p style={{ fontSize: "13px", margin: "4px 0", background: "#e8f5e9", padding: "8px", borderRadius: "4px", color: "#1b5e20" }}><strong>Result:</strong> {trackedStudent.assessmentResult}</p>}
                {trackedStudent.appointmentDetails && <p style={{ fontSize: "13px", margin: "4px 0", color: "#0d47a1" }}><strong>Appointment:</strong> {trackedStudent.appointmentDetails}</p>}
                <button 
                  className="primary-button" 
                  style={{ marginTop: "10px", width: "100%", padding: "6px", fontSize: "12px", background: "#333" }}
                  onClick={() => onAssessmentComplete(trackedStudent)}
                >
                  Open Full Dedicated Student Dashboard
                </button>
              </div>
            ) : (
              <p style={{ color: "#d40511", fontSize: "13px", margin: 0 }}>No student record found for phone number "{searchPhoneInput}". Please fill out the assessment form below.</p>
            )}
          </div>
        )}
      </div>

      <h2 style={{ fontSize: "20px", marginBottom: "4px" }}>New Student Assessment Form</h2>
      <p style={{ color: "#666", marginBottom: "20px", fontSize: "13px" }}>Tagging under partner: <strong>{partnerName}</strong></p>

      <form onSubmit={handleSubmitAssessment} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Full Name <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>
        
        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Phone Number (Dedicated Unique ID) <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>
        
        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Email Address <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="student@gmail.com" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>
        
        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Preferred Country <span style={{ color: "red" }}>*</span>
          <select required value={preferredCountry} onChange={e => setPreferredCountry(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }}>
            <option value="UK">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Sweden">Sweden</option>
            <option value="Finland">Finland</option>
            <option value="USA">USA</option>
            <option value="Australia">Australia</option>
          </select>
        </label>

        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Preferred Degree <span style={{ color: "red" }}>*</span> <input required value={preferredDegree} onChange={e => setPreferredDegree(e.target.value)} placeholder="e.g. Masters in Computer Science" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>

        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Last Academic Degree <span style={{ color: "red" }}>*</span> <input required value={lastAcademicDegree} onChange={e => setLastAcademicDegree(e.target.value)} placeholder="e.g. Bachelor of Science in ETE" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>

        <label style={{ fontSize: "13px", fontWeight: "bold" }}>GPA / CGPA (Academic Result) <span style={{ color: "red" }}>*</span> <input required value={gpaCgpa} onChange={e => setGpaCgpa(e.target.value)} placeholder="e.g. 3.50 / 4.00" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>

        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Preferred University <input value={preferredUniversity} onChange={e => setPreferredUniversity(e.target.value)} placeholder="e.g. University of Greenwich" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>

        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Preferred City <input value={preferredCity} onChange={e => setPreferredCity(e.target.value)} placeholder="e.g. London" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>

        <label style={{ fontSize: "13px", fontWeight: "bold" }}>IELTS Score / Status <input value={ieltsScore} onChange={e => setIeltsScore(e.target.value)} placeholder="e.g. Overall 6.5 or Not Taken" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>

        <label style={{ fontSize: "13px", fontWeight: "bold" }}>Budget <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 15 Lakh BDT" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #ddd" }} /></label>

        <button className="primary-button" type="submit" disabled={loading} style={{ marginTop: "12px", padding: "12px", background: "#d40511", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "Submitting..." : "Submit Assessment & Lock Dedicated Dashboard"}
        </button>
      </form>
    </div>
  );
}

function PartnerHeader({ active, onNav, partnerName, partnerLogo, ownerName }: { active: PartnerView; onNav: (v: PartnerView) => void; partnerName: string; partnerLogo: string | null; ownerName: string }) {
  const links: { key: PartnerView; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "students", label: "Students" },
    { key: "payouts", label: "Payouts" },
    { key: "qr", label: "QR Kit" },
    { key: "support", label: "Support" },
  ];
  return (
    <header className="partner-header">
      <button className="partner-brand" onClick={() => onNav("dashboard")} style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", cursor: "pointer" }}>
        {partnerLogo ? (
          <img src={partnerLogo} alt={partnerName} style={{ width: "38px", height: "38px", borderRadius: "6px", objectFit: "cover", border: "1px solid #ddd" }} />
        ) : (
          <span className="partner-logo" style={{ background: "#d40511", color: "#fff", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontWeight: "bold" }}>{partnerName ? partnerName.slice(0, 2).toUpperCase() : "BS"}</span>
        )}
        <div style={{ textAlign: "left" }}>
          <strong>{partnerName || "British Study Centre"}</strong>
          <small style={{ display: "block", color: "#666" }}>Official EduAimers Partner</small>
        </div>
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
        <button className="user-button" style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none" }}>
          <span className="avatar" style={{ background: "#333", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
            {ownerName ? ownerName.slice(0, 2).toUpperCase() : "PO"}
          </span>
          <div style={{ textAlign: "left" }}>
            <strong>{ownerName || "Partner Owner"}</strong>
            <small style={{ display: "block", color: "#666" }}>IELTS Partner Owner</small>
          </div>
        </button>
      </div>
    </header>
  );
}

function StudentTable({ full = false, partnerName }: { full?: boolean; partnerName?: string }) {
  const [queryText, setQueryText] = useState("");
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (partnerName) {
        setStudents(data.filter((s: any) => s.partnerName?.toLowerCase() === partnerName.toLowerCase()));
      } else {
        setStudents(data);
      }
    });
    return () => unsub();
  }, [partnerName]);

  const rows = students.filter((s) => `${s.phone || ""} ${s.fullName || ""} ${s.currentStage || ""}`.toLowerCase().includes(queryText.toLowerCase()));
  return (
    <section className="table-card partner-table-card">
      <div className="card-heading table-heading">
        <div>
          <h3>{full ? "Student directory & Live Tracking" : "Recent registered students"}</h3>
          <p>{full ? "Search and monitor every student's live stage" : "Latest leads captured through QR scan"}</p>
        </div>
        {full && (
          <div className="small-search">
            <Icon name="search" />
            <input value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder="Search by phone or name..." />
          </div>
        )}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr><th>Phone (ID)</th><th>Student name</th><th>Target Country</th><th>Partner</th><th>Current Stage</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No records found. Scan QR code to add students.</td></tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.phone}</strong></td>
                  <td>{s.fullName}</td>
                  <td>{s.preferredCountry || "UK"}</td>
                  <td>{s.partnerName}</td>
                  <td><Badge tone="blue">{s.currentStage || "Assessment Submitted (Waiting)"}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PartnerDashboard({ partnerName, onNav }: { partnerName: string; onNav: (v: PartnerView) => void }) {
  const [trackingQuery, setTrackingQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "students"));
    const unsub = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((s: any) => s.partnerName?.toLowerCase() === partnerName.toLowerCase()));
    });
    return () => unsub();
  }, [partnerName]);

  const handleSearchTracking = async (e: FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const found = students.find((s: any) => s.phone === trackingQuery);
    setSearchResult(found || null);
  };

  const handleRequestWithdrawal = async (studentId: string) => {
    try {
      const docRef = doc(db, "students", studentId);
      await updateDoc(docRef, { withdrawRequested: true });
      alert("Withdrawal request sent to Admin! Payment will be processed within 24 hours.");
    } catch (err) {
      console.error(err);
    }
  };

  const completedCommissions = students.filter((s: any) => s.fileOpened || s.visaDone);
  const totalEarnings = completedCommissions.reduce((acc, curr) => {
    let amt = 0;
    if (curr.fileOpened) amt += Number(curr.fileOpeningFee || 2000);
    if (curr.visaDone) amt += Number(curr.afterVisaFee || 5000);
    return acc + amt;
  }, 0);

  return (
    <>
      <section className="tracking-hero">
        <div className="hero-grid" />
        <div className="hero-stripes" aria-hidden="true"><i /><i /><i /></div>
        <div className="hero-content">
          <p className="eyebrow light"><span />{partnerName} · IELTS Owner Dashboard</p>
          <h1>Track student applications & commissions.</h1>
          <p>Search by registered Phone Number or review transactions below.</p>
          <form className="tracking-search" onSubmit={handleSearchTracking}>
            <Icon name="search" size={24} />
            <input value={trackingQuery} onChange={(e) => setTrackingQuery(e.target.value)} placeholder="Enter Phone Number..." required />
            <button type="submit">Search & Track <Icon name="arrow" /></button>
          </form>
          <div className="secure-note"><Icon name="shield" size={15} />Admin-controlled real-time tracking sync</div>
        </div>
      </section>

      <div className="partner-content" style={{ padding: "30px 20px" }}>
        <section style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #eaeaea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "13px", color: "#666" }}>Total File Opening & Visa Commissions</p>
            <h2 style={{ fontSize: "28px", color: "#d40511", margin: "4px 0 0" }}>৳ {totalEarnings.toLocaleString()}</h2>
            <small style={{ color: "#2b8a3e" }}>● Credited in 2 stages: File Opening & Visa Completion</small>
          </div>
        </section>

        {/* Transactions & Payment History */}
        <section className="table-card" style={{ marginBottom: "24px" }}>
          <div className="card-heading table-heading">
            <div>
              <h3>Transactions & Payment History</h3>
              <p>List of all successful file openings, visa commissions, and payout statuses</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Student Name</th><th>Phone (ID)</th><th>Commission Stage</th><th>Amount</th><th>Status & Actions</th></tr>
              </thead>
              <tbody>
                {completedCommissions.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No completed commissions yet.</td></tr>
                ) : (
                  completedCommissions.map((s: any) => (
                    <tr key={s.id}>
                      <td><strong>{s.fullName}</strong></td>
                      <td>{s.phone}</td>
                      <td>{s.visaDone ? "File Opening + Visa Done" : "File Opening Done"}</td>
                      <td>৳ {(s.fileOpened ? Number(s.fileOpeningFee || 2000) : 0) + (s.visaDone ? Number(s.afterVisaFee || 5000) : 0)}</td>
                      <td>
                        {s.paymentStatus === "Paid" ? (
                          <Badge tone="green">Paid</Badge>
                        ) : s.withdrawRequested ? (
                          <Badge tone="amber">Withdrawal Requested (Processing within 24 hrs)</Badge>
                        ) : (
                          <button 
                            className="primary-button" 
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => handleRequestWithdrawal(s.id)}
                          >
                            Withdraw Request <Icon name="wallet" size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {searched && (
          <section className="tracked-result" style={{ background: "#fff", padding: "24px", borderRadius: "12px", marginBottom: "24px", border: "1px solid #eaeaea" }}>
            <div className="tracked-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><Badge tone="blue">Tracking Result</Badge><h3>{searchResult ? `${searchResult.fullName} (${searchResult.phone})` : "No Student Found"}</h3></div>
              <button onClick={() => setSearched(false)}><Icon name="close" /></button>
            </div>
            {searchResult ? (
              <div style={{ marginTop: "16px" }}>
                <p><strong>Preferred Country:</strong> {searchResult.preferredCountry}</p>
                <div style={{ marginTop: "16px", padding: "12px", background: "#f8f9fa", borderRadius: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#666" }}>Current Live Stage:</p>
                  <h3 style={{ color: "#d40511", marginTop: "4px" }}>{searchResult.currentStage || "Assessment Submitted (Waiting)"}</h3>
                  {searchResult.assessmentResult && <p style={{ marginTop: "8px" }}><strong>Assessment:</strong> {searchResult.assessmentResult}</p>}
                  {searchResult.appointmentDetails && <p style={{ marginTop: "4px" }}><strong>Appointment:</strong> {searchResult.appointmentDetails}</p>}
                </div>
              </div>
            ) : (
              <p style={{ color: "#666", marginTop: "10px" }}>No matching record found for phone number "{trackingQuery}".</p>
            )}
          </section>
        )}
      </div>
    </>
  );
}

function StudentsPage({ partnerName }: { partnerName: string }) {
  return (
    <div className="partner-content page-content">
      <div className="section-heading page-title">
        <div><p className="eyebrow">Student management</p><h1>Student history & tracker</h1><p>Monitor every student application under {partnerName} in real-time.</p></div>
      </div>
      <StudentTable full partnerName={partnerName} />
    </div>
  );
}

function PayoutsPage({ partnerName }: { partnerName: string }) {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "students"));
    const unsub = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((s: any) => s.partnerName?.toLowerCase() === partnerName.toLowerCase()));
    });
    return () => unsub();
  }, [partnerName]);

  const pendingTotal = students.reduce((acc, curr) => {
    let amt = 0;
    if (curr.fileOpened && curr.paymentStatus !== "Paid") amt += Number(curr.fileOpeningFee || 2000);
    if (curr.visaDone && curr.paymentStatus !== "Paid") amt += Number(curr.afterVisaFee || 5000);
    return acc + amt;
  }, 0);

  const paidTotal = students.reduce((acc, curr) => {
    let amt = 0;
    if (curr.paymentStatus === "Paid") {
      if (curr.fileOpened) amt += Number(curr.fileOpeningFee || 2000);
      if (curr.visaDone) amt += Number(curr.afterVisaFee || 5000);
    }
    return acc + amt;
  }, 0);

  const completedCommissions = students.filter((s: any) => s.fileOpened || s.visaDone);

  const handleDownloadSlip = (studentName: string, amount: number) => {
    alert(`Downloading Official EduAimers Paid Slip for ${studentName} (Amount: ৳${amount})...`);
  };

  return (
    <div className="partner-content page-content" style={{ padding: "30px 20px" }}>
      <div className="section-heading page-title" style={{ marginBottom: "24px" }}>
        <div><p className="eyebrow">Financial Center</p><h1>Payouts & Elaborated Transaction History</h1><p>Clear, timestamped records for every student referral under {partnerName}.</p></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <article style={{ background: "#111", color: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>Total Pending Withdrawal / Requested</p>
          <h2 style={{ fontSize: "28px", color: "#ffd43b", margin: "8px 0 4px" }}>৳ {pendingTotal.toLocaleString()}</h2>
          <small style={{ color: "#aaa" }}>Awaiting admin payment processing</small>
        </article>

        <article style={{ background: "#2b8a3e", color: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <p style={{ fontSize: "13px", color: "#e9ecef", margin: 0 }}>Total Paid & Settled Amount</p>
          <h2 style={{ fontSize: "28px", color: "#fff", margin: "8px 0 4px" }}>৳ {paidTotal.toLocaleString()}</h2>
          <small style={{ color: "#d8f5a2" }}>Successfully transferred to agreement account</small>
        </article>
      </div>

      <section className="table-card">
        <div className="card-heading table-heading">
          <div>
            <h3>Elaborated Transaction History</h3>
            <p>Detailed breakdown with dates, times, payment amounts, purposes, statuses, and EduAimers payment slips.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Student Name & Phone (ID)</th>
                <th>Purpose</th>
                <th>Payment Amount</th>
                <th>Status</th>
                <th>Paid Slip</th>
              </tr>
            </thead>
            <tbody>
              {completedCommissions.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#666" }}>No transaction records found yet.</td></tr>
              ) : (
                completedCommissions.map((s: any) => {
                  const dateStr = s.createdAt?.toDate ? s.createdAt.toDate().toLocaleString() : "Recent";
                  const totalAmt = (s.fileOpened ? Number(s.fileOpeningFee || 2000) : 0) + (s.visaDone ? Number(s.afterVisaFee || 5000) : 0);
                  const isPaid = s.paymentStatus === "Paid";
                  const purposeText = s.visaDone ? "File Opening + Visa Commission" : "File Opening Commission";

                  return (
                    <tr key={s.id}>
                      <td><small style={{ color: "#555" }}>{dateStr}</small></td>
                      <td>
                        <strong>{s.fullName}</strong><br />
                        <small style={{ color: "#666" }}>{s.phone}</small>
                      </td>
                      <td>{purposeText}</td>
                      <td><strong>৳ {totalAmt.toLocaleString()}</strong></td>
                      <td>
                        <Badge tone={isPaid ? "green" : s.withdrawRequested ? "amber" : "blue"}>
                          {isPaid ? "Paid" : s.withdrawRequested ? "Withdrawal Requested" : "Credited"}
                        </Badge>
                      </td>
                      <td>
                        {isPaid ? (
                          <button 
                            className="primary-button" 
                            style={{ padding: "6px 12px", fontSize: "12px", background: "#2b8a3e", display: "inline-flex", alignItems: "center", gap: "6px" }}
                            onClick={() => handleDownloadSlip(s.fullName, totalAmt)}
                          >
                            <Icon name="download" size={14} /> Download Slip
                          </button>
                        ) : (
                          <span style={{ color: "#888", fontSize: "12px" }}>Available after Paid</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function QrKitPage({ partnerName, partnerLogo, onOpenAssessment }: { partnerName: string; partnerLogo: string | null; onOpenAssessment: () => void }) {
  const standeeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const shareLink = `${window.location.origin}/?partner=${encodeURIComponent(partnerName)}&assessment=true`;

  const handleDownloadImage = async () => {
    if (!standeeRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(standeeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${partnerName.toLowerCase().replace(/\s+/g, '-')}-qr-standee.png`;
      link.click();
    } catch (error) {
      console.error("Failed to generate QR image:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="partner-content page-content">
      <div className="section-heading page-title">
        <div><p className="eyebrow">Marketing toolkit</p><h1>Your Dynamic QR Standee Kit</h1><p>Scanning this exact QR code directs students straight to the assessment form and tags them under {partnerName}.</p></div>
        <button className="primary-button" onClick={handleDownloadImage} disabled={downloading}>
          <Icon name="download" />{downloading ? "Generating Image..." : "Download Dynamic QR Image (PNG)"}
        </button>
      </div>
      <section className="qr-hub">
        <div className="standee-zone">
          <p className="zone-label">Live print preview · Standee design</p>
          <div className="standee" ref={standeeRef} style={{ background: "#fff", padding: "24px 20px", width: "300px", margin: "0 auto", borderRadius: "12px", border: "1px solid #eaeaea", boxSizing: "border-box", textAlign: "center" }}>
            <div className="standee-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #d40511", paddingBottom: "10px", marginBottom: "16px" }}>
              <div className="standee-brand" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {partnerLogo ? (
                  <img src={partnerLogo} alt="" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid #ddd" }} />
                ) : (
                  <span className="partner-logo" style={{ background: "#d40511", color: "#fff", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontWeight: "bold", fontSize: "14px" }}>{partnerName ? partnerName.slice(0, 2).toUpperCase() : "BS"}</span>
                )}
                <strong style={{ fontSize: "14px", color: "#111" }}>{partnerName || "British Study Centre"}</strong>
              </div>
              <small style={{ fontWeight: "bold", color: "#666", fontSize: "10px" }}>OFFICIAL PARTNER</small>
            </div>
            
            <div className="standee-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: "10px", color: "#d40511", fontWeight: "bold", letterSpacing: "1px", margin: "0 0 4px" }}>YOUR GLOBAL STUDY JOURNEY STARTS HERE</p>
              <h2 style={{ fontSize: "17px", margin: "0 0 16px", fontWeight: "800", color: "#111" }}>Scan to Assess.<br /><span style={{ color: "#d40511" }}>Take the first step.</span></h2>
              
              {/* Perfectly Centered QR Box */}
              <div className="qr-frame" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", background: "#fff", border: "2px solid #111", borderRadius: "10px" }}>
                <QrCode value={shareLink} />
              </div>

              <strong className="scan-copy" style={{ display: "block", fontSize: "12px", marginTop: "12px", letterSpacing: "0.5px", color: "#111" }}>SCAN FOR ASSESSMENT</strong>
              <small style={{ color: "#666", fontSize: "10px", marginTop: "2px" }}>Fast, secure and completely free</small>
            </div>

            {/* Red Footer with Partner Logo */}
            <div className="standee-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#d40511", padding: "10px 12px", borderRadius: "6px", marginTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {partnerLogo ? (
                  <img src={partnerLogo} alt="" style={{ width: "22px", height: "22px", borderRadius: "4px", objectFit: "cover", background: "#fff" }} />
                ) : (
                  <span style={{ background: "#fff", color: "#d40511", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px", fontWeight: "bold", fontSize: "10px" }}>
                    {partnerName ? partnerName.slice(0, 2).toUpperCase() : "BS"}
                  </span>
                )}
                <strong style={{ fontSize: "11px", color: "#fff" }}>{partnerName || "Partner"}</strong>
              </div>
              <small style={{ fontSize: "10px", color: "#fff", fontWeight: "600" }}>Official Partner</small>
            </div>
          </div>
        </div>
        <aside className="kit-panel">
          <div><p className="eyebrow">Ready to print</p><h2>Exact Dynamic QR</h2><p>This QR encodes the precise assessment link for <strong>{partnerName}</strong>.</p></div>
          <button className="primary-button full" onClick={onOpenAssessment}>
            <Icon name="external" /> Test Assessment Form View
          </button>
          <button className="secondary-button full" onClick={() => {
            navigator.clipboard?.writeText(shareLink);
            alert(`Assessment QR Link copied!\n${shareLink}`);
          }}><Icon name="send" />Copy direct assessment link</button>
        </aside>
      </section>
    </div>
  );
}
function PartnerPortal({ partnerName, partnerLogo }: { partnerName: string; partnerLogo: string | null }) {
  const [page, setPage] = useState<PartnerView>("dashboard");
  const [isAssessmentView, setIsAssessmentView] = useState(false);
  const [completedStudent, setCompletedStudent] = useState<any | null>(null);
  const [ownerName, setOwnerName] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("assessment") === "true") {
      setIsAssessmentView(true);
    }

    const q = query(collection(db, "partners"));
    const unsub = onSnapshot(q, (snapshot) => {
      const found = snapshot.docs.find(doc => doc.data().name?.toLowerCase() === partnerName.toLowerCase());
      if (found && found.data().owner) {
        setOwnerName(found.data().owner);
      }
    });
    return () => unsub();
  }, [partnerName]);

  if (completedStudent) {
    return (
      <StudentDashboardView 
        studentData={completedStudent} 
        partnerName={partnerName} 
        partnerLogo={partnerLogo} 
        onLogout={() => setCompletedStudent(null)} 
      />
    );
  }

  if (isAssessmentView) {
    return (
      <AssessmentFormView 
        partnerName={partnerName} 
        partnerLogo={partnerLogo} 
        onAssessmentComplete={(data) => setCompletedStudent(data)} 
      />
    );
  }

  return (
    <div className="partner-shell">
      <PartnerHeader active={page} onNav={setPage} partnerName={partnerName} partnerLogo={partnerLogo} ownerName={ownerName} />
      <main>
        {page === "dashboard" && <PartnerDashboard partnerName={partnerName} onNav={setPage} />}
        {page === "students" && <StudentsPage partnerName={partnerName} />}
        {page === "payouts" && <PayoutsPage partnerName={partnerName} />}
        {page === "qr" && <QrKitPage partnerName={partnerName} partnerLogo={partnerLogo} onOpenAssessment={() => setIsAssessmentView(true)} />}
        {page === "support" && (
          <div className="partner-content page-content support-page" style={{ padding: "40px", textAlign: "center" }}>
            <span><Icon name="headset" size={36} /></span>
            <p className="eyebrow">Partner success desk</p>
            <h1>How can we help?</h1>
            <p>Our support team is available Sunday–Thursday, 9:00 AM–6:00 PM.</p>
            <button className="primary-button" onClick={() => alert("Support ticket opened successfully!")}><Icon name="send" />Start a conversation</button>
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
  const [mode, setMode] = useState<"admin" | "partner">("partner");
  const [activePartner, setActivePartner] = useState("British Study Centre");
  const [partnerLogo, setPartnerLogo] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "true") {
      setMode("admin");
      return;
    }
    const partnerParam = params.get("partner");
    if (partnerParam) {
      const decodedName = decodeURIComponent(partnerParam);
      setActivePartner(decodedName);
      setMode("partner");

      const q = query(collection(db, "partners"));
      onSnapshot(q, (snapshot) => {
        const found = snapshot.docs.find(doc => doc.data().name.toLowerCase() === decodedName.toLowerCase());
        if (found && found.data().logo) {
          setPartnerLogo(found.data().logo);
        }
      });
    }
  }, []);

  return mode === "admin" ? (
    <AdminPanel onPortal={(name) => { if (name) setActivePartner(name); setMode("partner"); }} activePartner={activePartner} setActivePartner={setActivePartner} setPartnerLogo={setPartnerLogo} />
  ) : (
    <PartnerPortal partnerName={activePartner} partnerLogo={partnerLogo} />
  );
}