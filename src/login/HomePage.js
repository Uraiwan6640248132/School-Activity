import React, { useState, useEffect } from "react";

export default function HomePage({
    schoolName = "โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย",
    onLogin = () => { },
    onRegister = () => { },
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [news, setNews] = useState([]);

    const heroImageUrl = "https://via.placeholder.com/600x400";
    const API_URL = 'http://localhost:3001/api/publicrelations';

    useEffect(() => {
        const fetchPRData = async () => {
            try {
                const res = await fetch(API_URL);
                if (res.ok) {
                    const data = await res.json();
                    setNews(data);
                }
            } catch (err) {
                console.error("Fetch PR error:", err);
            }
        };
        fetchPRData();
    }, []);

    const displayFormattedDate = (dateStr) => {
        if (!dateStr) return '-';
        const cleanStr = String(dateStr).split('T')[0];
        const parts = cleanStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    const activities = [
        { icon: "🔬", title: "สัปดาห์วิทยาศาสตร์", text: "เรียนรู้ผ่านการทดลองและนิทรรศการสร้างสรรค์" },
        { icon: "⚽", title: "กีฬาสีสัมพันธ์", text: "เติมพลังทีมเวิร์ก สุขภาพ และมิตรภาพ" },
        { icon: "🎨", title: "เวทีแสดงความสามารถ", text: "พื้นที่ให้ทุกความสามารถได้เปล่งประกาย" },
    ];

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setMenuOpen(false);
    };

    const handleRegister = () => { setMenuOpen(false); onRegister(); };
    const handleLogin = () => { setMenuOpen(false); onLogin(); };

    return (
        <div style={styles.page}>
            <style>{responsiveCss}</style>
            <header style={styles.header}>
                <button type="button" style={styles.brand} onClick={() => scrollTo("home")} aria-label="กลับสู่หน้าแรก">
                    <span style={styles.logo}>🎓</span>
                    <span>{schoolName}</span>
                </button>
                <button type="button" className="menu-toggle" style={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
                    ☰
                </button>
                <nav className={menuOpen ? "nav nav-open" : "nav"} style={styles.nav}>
                    <button type="button" onClick={() => scrollTo("about")}>เกี่ยวกับโรงเรียน</button>
                    <button type="button" onClick={() => scrollTo("news")}>ข่าวประชาสัมพันธ์</button>
                    <button type="button" onClick={() => scrollTo("activities")}>กิจกรรม</button>
                    <button type="button" onClick={() => scrollTo("contact")}>ติดต่อสอบถาม</button>
                    <button type="button" style={styles.loginButton} onClick={handleLogin}>เข้าสู่ระบบ</button>
                    <button type="button" style={styles.registerButton} onClick={handleRegister}>ลงทะเบียน</button>
                </nav>
            </header>

            <main>
                <section id="home" style={styles.hero}>
                    <div style={styles.heroContent}>
                        <p style={styles.kicker}>WELCOME TO OUR SCHOOL</p>
                        <h1 style={styles.heroTitle}>เรียนรู้ เติบโต<br /><span>ก้าวไกลไปด้วยกัน</span></h1>
                        <p style={styles.heroText}>พื้นที่แห่งการเรียนรู้ที่อบอุ่น ปลอดภัย และพร้อมสนับสนุนให้นักเรียนทุกคนค้นพบศักยภาพของตนเอง</p>
                        <div style={styles.heroActions}>
                            <button type="button" style={styles.primaryButton} onClick={handleRegister}>ลงทะเบียน <span>→</span></button>
                            <button type="button" style={styles.secondaryButton} onClick={() => scrollTo("about")}>รู้จักโรงเรียน</button>
                        </div>
                    </div>

                    <div style={styles.heroArtImageWrapper}>
                        <img
                            src={heroImageUrl}
                            alt="โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย"
                            style={styles.heroImage}
                        />
                    </div>
                </section>

                {/* ส่วนเกี่ยวกับเรา (ประวัติโรงเรียน) */}
                <section id="about" style={styles.about}>
                    <div style={styles.sectionIntro}>
                        <p style={styles.eyebrow}>ABOUT US</p>
                        <h2 style={styles.sectionTitle}>เกี่ยวกับโรงเรียนสาธิต<br />มหาวิทยาลัยราชภัฏเลย</h2>
                        <p style={styles.sectionText}>
                            จัดตั้งขึ้นเมื่อปี พ.ศ. 2528 เพื่อเป็นโรงเรียนต้นแบบด้านการศึกษา วิจัย และพัฒนาการเรียนรู้
                            เปิดสอนตั้งแต่ระดับบริบาล อนุบาล ถึงประถมศึกษาปีที่ 6 มุ่งเน้นการเรียนรู้ตามพัฒนาการ เสริมสร้างความคิดสร้างสรรค์ และทักษะชีวิต
                            ภายใต้การดูแลของคณาจารย์และผู้เชี่ยวชาญ เพื่อสร้างนักเรียนให้เป็น <strong>"คนดี คนเก่ง และมีความสุข"</strong>
                        </p>
                    </div>

                    <div style={styles.statGrid}>
                        <Stat number="2528" label="ปีที่ก่อตั้ง (พ.ศ.)" />
                        <Stat number="10" label="ผู้อำนวยการ (คนที่ 10)" />
                        <Stat number="ดีมาก" label="มาตรฐาน สมศ. (2557)" />
                        <Stat number="บริบาล - ป.6" label="ระดับชั้นที่เปิดสอน" />
                    </div>
                </section>

                <section id="news" style={styles.newsSection}>
                    <div style={styles.sectionHeading}>
                        <div>
                            <p style={styles.eyebrow}>NEWS & ANNOUNCEMENTS</p>
                            <h2 style={styles.sectionTitle}>ข่าวประชาสัมพันธ์</h2>
                        </div>
                    </div>

                    {news.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#66809b", padding: "40px 0" }}>ไม่มีข้อมูลข่าวประชาสัมพันธ์ในขณะนี้</p>
                    ) : (
                        <div style={styles.newsGrid}>
                            {news.map((item, index) => (
                                <article key={item.PublicRelation_id || item.id || index} style={styles.newsCard}>
                                    <div style={styles.newsImage}>
                                        {item.Image ? (
                                            <img src={item.Image} alt={item.Name_activity || item.Name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ ...styles.newsImagePlaceholder, background: ["#c8e8ff", "#d8f3ec", "#e5e1ff"][index % 3] }}>
                                                {["📚", "🏆", "📅"][index % 3]}
                                            </div>
                                        )}
                                    </div>
                                    <div style={styles.cardBody}>
                                        <span style={styles.badge}>ประชาสัมพันธ์</span>
                                        <p style={styles.date}>{displayFormattedDate(item.Date)}</p>
                                        <h3 style={styles.cardTitle}>{item.Name_activity || item.Name}</h3>
                                        <p style={styles.detailText}>{item.Detail || "-"}</p>
                                        <p style={styles.locationText}>📍 {item.Location || "ไม่ระบุสถานที่"}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <section id="activities" style={styles.activitiesSection}>
                    <div style={styles.sectionIntro}>
                        <p style={styles.eyebrow}>STUDENT LIFE</p>
                        <h2 style={styles.sectionTitle}>ชีวิตที่มากกว่าห้องเรียน</h2>
                        <p style={styles.sectionText}>เราเชื่อว่าประสบการณ์นอกห้องเรียนช่วยสร้างทั้งความสุข ทักษะ และความมั่นใจให้กับนักเรียน</p>
                    </div>
                    <div style={styles.activityGrid}>
                        {activities.map((activity) => (
                            <article key={activity.title} style={styles.activityCard}>
                                <div style={styles.activityIcon}>{activity.icon}</div>
                                <h3 style={styles.activityTitle}>{activity.title}</h3>
                                <p style={styles.activityText}>{activity.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section style={styles.cta}>
                    <div><p style={styles.ctaKicker}>JOIN OUR COMMUNITY</p><h2 style={styles.ctaTitle}>เริ่มต้นเส้นทางการเรียนรู้<br />ไปกับเราในวันนี้</h2></div>
                    <button type="button" style={styles.ctaButton} onClick={handleRegister}>ลงทะเบียน <span>→</span></button>
                </section>
            </main>

            {/* Footer สไตล์ W3Schools Mega Footer */}
            <footer id="contact" style={styles.w3Footer}>
                <div style={styles.footerTopRow}>
                    <div style={styles.footerLogoSection}>
                        <span style={{ fontSize: 28 }}>🎓</span>
                        <span style={styles.footerBrandText}>{schoolName}</span>
                    </div>
                    <div style={styles.footerTopNav}>
                        <button type="button" onClick={() => scrollTo("home")}>หน้าแรก</button>
                        <button type="button" onClick={() => scrollTo("about")}>เกี่ยวกับโรงเรียน</button>
                        <button type="button" onClick={() => scrollTo("news")}>ข่าวสาร</button>
                        <button type="button" onClick={() => scrollTo("activities")}>กิจกรรม</button>
                    </div>
                </div>

                <div style={styles.footerColumns}>
                    <div style={styles.footerCol}>
                        <h4 style={styles.colTitle}>เกี่ยวกับโรงเรียน</h4>
                        <ul style={styles.colList}>
                            <li><a href="#about" onClick={() => scrollTo("about")}>ประวัติความเป็นมา</a></li>
                            <li><a href="#about" onClick={() => scrollTo("about")}>วิสัยทัศน์ & พันธกิจ</a></li>
                            <li><a href="#about" onClick={() => scrollTo("about")}>คณะผู้บริหาร</a></li>
                            <li><a href="#about" onClick={() => scrollTo("about")}>ผลการประเมิน สมศ.</a></li>
                        </ul>
                    </div>

                    <div style={styles.footerCol}>
                        <h4 style={styles.colTitle}>หลักสูตรการศึกษา</h4>
                        <ul style={styles.colList}>
                            <li><a href="#about">ระดับเตรียมบริบาล</a></li>
                            <li><a href="#about">ระดับอนุบาล (ปฐมวัย 2560)</a></li>
                            <li><a href="#about">ระดับประถมศึกษา (ขั้นพื้นฐาน 2551)</a></li>
                            <li><a href="#activities">กิจกรรมพัฒนาผู้เรียน</a></li>
                        </ul>
                    </div>

                    <div style={styles.footerCol}>
                        <h4 style={styles.colTitle}>ติดต่อสอบถาม</h4>
                        <ul style={styles.colList}>
                            <li>📍 234 หมู่ 11 ถ.เลย-เชียงคาน ต.เมือง อ.เมืองเลย จ.เลย 42000</li>
                            <li>📞 โทรศัพท์: <a href="tel:042845009" style={{ color: "#fff" }}>042-845009</a></li>
                            <li>🌐 เว็บไซต์: <a href="https://satit.lru.ac.th/" target="_blank" rel="noopener noreferrer" style={{ color: "#4eb5ff" }}>satit.lru.ac.th ↗</a></li>
                        </ul>
                    </div>

                    <div style={styles.footerCol}>
                        <h4 style={styles.colTitle}>เข้าสู่ระบบ / ลงทะเบียน</h4>
                        <ul style={styles.colList}>
                            <li><button type="button" style={styles.footerLinkBtn} onClick={handleLogin}>เข้าสู่ระบบ</button></li>
                            <li><button type="button" style={styles.footerLinkBtn} onClick={handleRegister}> ลงทะเบียน</button></li>
                        </ul>
                    </div>
                </div>

                <div style={styles.footerBottomBar}>
                    <p style={styles.copyrightText}>
                        Copyright © 2569 {schoolName}. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function Stat({ number, label }) { return <div style={styles.stat}><strong>{number}</strong><span>{label}</span></div>; }

const styles = {
    page: { fontFamily: "'Noto Sans Thai', 'Segoe UI', sans-serif", color: "#163a5f", background: "#fff", lineHeight: 1.55, overflow: "hidden" },
    header: { height: 76, padding: "0 clamp(20px, 6vw, 88px)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,.94)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e8f0f8" },
    brand: { display: "flex", alignItems: "center", gap: 10, border: 0, background: "transparent", color: "#0d5fa8", fontWeight: 800, fontSize: 18, cursor: "pointer" }, logo: { fontSize: 26 },
    nav: { display: "flex", alignItems: "center", gap: 20 }, menuToggle: { display: "none", border: 0, background: "transparent", color: "#075fae", fontSize: 25, cursor: "pointer" },
    loginButton: { padding: "9px 17px", border: "1px solid #1a83d8", color: "#096cbd", background: "white", borderRadius: 9, cursor: "pointer" }, registerButton: { padding: "10px 17px", border: "1px solid #1178ca", color: "white", background: "#1178ca", borderRadius: 9, cursor: "pointer" },
    hero: { minHeight: 540, padding: "70px clamp(20px, 8vw, 120px)", display: "flex", alignItems: "center", gap: 35, position: "relative", background: "linear-gradient(125deg,#eef9ff 0%,#d7efff 54%,#c5e6ff 100%)" }, heroContent: { maxWidth: 620, position: "relative", zIndex: 1 }, kicker: { letterSpacing: 2, fontSize: 12, color: "#1680ce", fontWeight: 800, margin: "0 0 12px" }, heroTitle: { fontSize: "clamp(38px,5vw,64px)", lineHeight: 1.24, margin: 0, letterSpacing: "-.8px", color: "#123a67" }, heroText: { fontSize: 18, color: "#497092", maxWidth: 540, margin: "21px 0 30px" }, heroActions: { display: "flex", gap: 12, flexWrap: "wrap" }, primaryButton: { background: "#087bce", color: "#fff", border: 0, borderRadius: 10, padding: "14px 21px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 18px #1283cf48" }, secondaryButton: { background: "#fff", color: "#096fbe", border: "1px solid #b7daf3", borderRadius: 10, padding: "13px 20px", fontWeight: 700, fontSize: 16, cursor: "pointer" },

    heroArtImageWrapper: { flex: 1, minWidth: 320, height: 360, borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 30px rgba(18, 58, 103, 0.15)", background: "#fff" },
    heroImage: { width: "100%", height: "100%", objectFit: "cover" },

    about: { padding: "72px clamp(20px, 8vw, 120px)", display: "grid", gridTemplateColumns: "1.2fr 1fr", alignItems: "start", gap: 50 },
    eyebrow: { letterSpacing: 1.8, color: "#1680ce", fontSize: 12, fontWeight: 800, margin: "0 0 10px" },
    sectionTitle: { fontSize: "clamp(28px,3.2vw,42px)", lineHeight: 1.34, margin: "0 0 10px 0", color: "#153b62" },
    sectionText: { margin: "0 0 12px 0", color: "#506982", fontSize: 15, lineHeight: 1.6 },
    aboutList: { margin: "0 0 16px 0", paddingLeft: 20, color: "#506982", fontSize: 15, lineHeight: 1.6 },
    statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignSelf: "center" },
    stat: { padding: "23px", borderRadius: 14, background: "#f4faff", border: "1px solid #e2f1fc", display: "flex", flexDirection: "column" },

    newsSection: { padding: "70px clamp(20px, 8vw, 120px)", background: "#f5faff" }, sectionHeading: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, marginBottom: 29 },
    newsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 },
    newsCard: { background: "#fff", borderRadius: 15, overflow: "hidden", boxShadow: "0 7px 24px #4680aa14", border: "1px solid #e6f0f7", display: "flex", flexDirection: "column" },
    newsImage: { height: 180, width: "100%", overflow: "hidden" }, newsImagePlaceholder: { width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 62 },
    cardBody: { padding: "19px 20px 20px", display: "flex", flexDirection: "column", flexGrow: 1 }, badge: { display: "inline-block", width: "fit-content", padding: "3px 10px", color: "#0c75bf", fontSize: 12, fontWeight: 700, borderRadius: 20, background: "#e8f5ff" }, date: { color: "#7f98af", fontSize: 13, margin: "11px 0 5px" }, cardTitle: { fontSize: 18, lineHeight: 1.48, margin: "0 0 8px 0", color: "#24496b", fontWeight: "bold" },
    detailText: { fontSize: 14, color: "#64809d", margin: "0 0 10px 0", flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" },
    locationText: { fontSize: 13, color: "#0875c5", margin: 0, fontWeight: "500" },

    activitiesSection: { padding: "75px clamp(20px, 8vw, 120px)", display: "grid", gridTemplateColumns: ".9fr 1.4fr", gap: 50, alignItems: "center" }, activityGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }, activityCard: { background: "linear-gradient(145deg,#f1faff,#e7f5ff)", padding: "24px 18px", borderRadius: 15, border: "1px solid #dceefa" }, activityIcon: { fontSize: 39 }, activityTitle: { margin: "12px 0 6px", fontSize: 17, color: "#20486e" }, activityText: { margin: 0, color: "#64809d", fontSize: 14 },

    cta: { margin: "0 clamp(20px, 8vw, 120px) 70px", padding: "clamp(32px,5vw,58px)", borderRadius: 20, background: "linear-gradient(115deg,#0c76c5,#15a4e2)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }, ctaKicker: { fontSize: 12, fontWeight: 800, letterSpacing: 1.8, margin: "0 0 10px", opacity: .8 }, ctaTitle: { margin: 0, fontSize: "clamp(27px,3vw,40px)", lineHeight: 1.3 }, ctaButton: { border: 0, background: "#fff", color: "#0974c2", padding: "14px 20px", borderRadius: 9, fontWeight: 800, fontSize: 16, cursor: "pointer", whiteSpace: "nowrap" },

    // W3Schools Style Footer
    w3Footer: { background: "#1d2a3a", color: "#ddd", padding: "60px clamp(20px, 8vw, 120px) 30px" },
    footerTopRow: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2e3e52", paddingBottom: 25, marginBottom: 40, flexWrap: "wrap", gap: 20 },
    footerLogoSection: { display: "flex", alignItems: "center", gap: 12 },
    footerBrandText: { color: "#fff", fontWeight: 800, fontSize: 18 },
    footerTopNav: { display: "flex", gap: 24 },
    footerColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 35, marginBottom: 50 },
    footerCol: { display: "flex", flexDirection: "column" },
    colTitle: { color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16, margin: "0 0 16px 0" },
    colList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#a0b0c0" },
    footerLinkBtn: { border: 0, background: "transparent", color: "#a0b0c0", padding: 0, fontSize: 14, textAlign: "left", cursor: "pointer" },
    footerBottomBar: { borderTop: "1px solid #2e3e52", paddingTop: 25, textAlign: "center" },
    copyrightText: { fontSize: 13, color: "#8a9bb0", margin: 0 },
};

const responsiveCss = `
  * { box-sizing: border-box; } button { font-family: inherit; } nav button { border:0; background:transparent; color:#315779; font-size:14px; cursor:pointer; white-space:nowrap; } a { color:inherit; text-decoration:none; } .stat strong { color:#0876c7; font-size:28px; line-height:1.2; } .stat span { color:#66809b; margin-top:5px; font-size:13px; }
  .footerTopNav button { border:0; background:transparent; color:#fff; font-weight:700; font-size:14px; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; }
  .footerTopNav button:hover { color:#4eb5ff; }
  .colList a:hover { color:#fff !important; text-decoration:underline; }
  .footerLinkBtn:hover { color:#fff !important; text-decoration:underline; }
  @media (max-width: 860px) { .menu-toggle { display:block !important; } .nav { display:none !important; } .nav-open { display:flex !important; position:absolute; top:76px; right:20px; left:20px; flex-direction:column; align-items:stretch !important; gap:5px !important; padding:15px; border-radius:12px; background:#fff; box-shadow:0 12px 25px #1c51732b; } .nav-open button { padding:11px; text-align:left; } .hero { flex-direction:column; text-align:center; padding-top:55px !important; } .heroContent { display:flex; flex-direction:column; align-items:center; } .about, .activitiesSection { grid-template-columns:1fr !important; } .activityGrid { grid-template-columns:repeat(3,1fr) !important; } }
  @media (max-width: 520px) { .statGrid { grid-template-columns:1fr 1fr; } .activityGrid { grid-template-columns:1fr !important; } }
`;