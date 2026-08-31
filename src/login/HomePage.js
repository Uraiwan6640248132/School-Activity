import React, { useState, useEffect } from "react";
import logoSchool from "../logo_school.png";
import {
    School,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Globe,
    Award,
    Users,
    BookOpen,
    Sparkles,
    Menu,
    X,
    Clock,
    Home,
    Info,
    Newspaper,
    Activity,
    MessageCircle,
    UserPlus,
    LogIn,
    ArrowRight,
    ExternalLink,
    ChevronRight,
    Heart,
    Star
} from "lucide-react";

export default function HomePage({
    schoolName = "ระบบบันทึกกิจกรรม โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย",
    onLogin = () => { },
    onRegister = () => { },
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [news, setNews] = useState([]);
    const [scrolled, setScrolled] = useState(false);

    const heroImageUrl = "https://satit.lru.ac.th/th/wp-content/uploads/2022/04/HEAND-BANNER.jpg";
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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const displayFormattedDate = (dateStr) => {
        if (!dateStr) return '-';
        const cleanStr = String(dateStr).split('T')[0];
        const parts = cleanStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    const activities = [
        { icon: "🔬", title: "สัปดาห์วิทยาศาสตร์", text: "เรียนรู้ผ่านการทดลองสุดตื่นเต้นและนิทรรศการสร้างสรรค์", bg: "linear-gradient(135deg, #f0f4c3 0%, #ffeb3b 100%)", tag: "วิชาการ" },
        { icon: "⚽", title: "กีฬาสีสาธิตสัมพันธ์", text: "เติมพลังทีมเวิร์ก สุขภาพแข็งแรง และมิตรภาพที่แน่นแฟ้น", bg: "linear-gradient(135deg, #E0F2FE 0%, #64bceb 100%)", tag: "สุขภาพ" },
        { icon: "🎨", title: "เวทีแสดงความสามารถ", text: "เปิดพื้นที่ให้ทุกความฝันและความสามารถได้เปล่งประกาย", bg: "linear-gradient(135deg, #FEF3C7 0%, #ffdf60 100%)", tag: "ศิลปะ" },
        { icon: "🌱", title: "นักชมน้อยปลูกผักสวนครัว", text: "เรียนรู้ธรรมชาติ ความรับผิดชอบ และวิถีชีวิตพอเพียง", bg: "linear-gradient(135deg, #dcedc8 0%, #42bd41 100%)", tag: "ทักษะชีวิต" },
        { icon: "🎵", title: "ดนตรีและจังหวะสร้างสุข", text: "ฝึกสมาธิ จินตนาการ และสุนทรียภาพผ่านเสียงเพลง", bg: "linear-gradient(135deg, #eeeaf3 0%, #c195f1 100%)", tag: "ดนตรี" },
        { icon: "📖", title: "นิทานสายใยคุณธรรม", text: "ปลูกฝังจริยธรรมและค่านิยมที่ดีผ่านเรื่องราวสนุกสนาน", bg: "linear-gradient(135deg, #FFE4E6 0%, #fc99a4 100%)", tag: "จริยธรรม" },
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

            {/* 🌟 Header */}
            <header style={{
                ...styles.header,
                boxShadow: scrolled ? '0 10px 30px rgba(56, 189, 248, 0.12)' : 'none',
                background: scrolled ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.75)',
            }}>
                <button type="button" style={styles.brand} onClick={() => scrollTo("home")}>
                    <div style={styles.logoWrapper}>
                        <img src={logoSchool} alt="ตราโรงเรียน" style={styles.logoImage} />
                    </div>
                    <span style={styles.brandText}>{schoolName}</span>
                </button>

                <button className="menu-toggle" style={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={24} color="#0F172A" /> : <Menu size={24} color="#0F172A" />}
                </button>

                <nav className={menuOpen ? "nav nav-open" : "nav"} style={styles.nav}>
                    <button onClick={() => scrollTo("home")}><Home size={16} /> หน้าแรก</button>
                    <button onClick={() => scrollTo("about")}><Info size={16} /> เกี่ยวกับ</button>
                    <button onClick={() => scrollTo("news")}><Newspaper size={16} /> ข่าวสาร</button>
                    <button onClick={() => scrollTo("activities")}><Activity size={16} /> กิจกรรม</button>
                    <button onClick={() => scrollTo("contact")}><MessageCircle size={16} /> ติดต่อ</button>
                    <div style={styles.navDivider}></div>
                    <button style={styles.loginButton} onClick={handleLogin}>
                        <LogIn size={15} /> เข้าสู่ระบบ
                    </button>
                    <button style={styles.registerButton} onClick={handleRegister}>
                        <UserPlus size={15} /> ลงทะเบียน
                    </button>
                </nav>
            </header>

            <main>
                {/* 🌟 Hero Section */}
                <section id="home" style={styles.hero}>
                    <div style={styles.orb1}></div>
                    <div style={styles.orb2}></div>

                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <Sparkles size={15} color="#0284C7" />
                            <span>ระบบบันทึกกิจกรรม</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย <br />
                            <span style={styles.heroHighlight}></span>
                        </h1>

                        <div style={styles.heroActions}>
                            <button type="button" style={styles.primaryButton} onClick={handleRegister}>
                                ลงทะเบียนใช้งาน <ArrowRight size={18} />
                            </button>
                            <button type="button" style={styles.secondaryButton} onClick={() => scrollTo("about")}>
                                สำรวจโรงเรียน
                            </button>
                        </div>

                        <div style={styles.quickFeature}>
                            <div style={styles.featureItem}>
                                <div style={{ ...styles.featureDot, background: '#38BDF8' }}></div>
                                <span>เปิดสอน บริบาล - ม.6</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.heroImageWrapper}>
                        <div style={styles.imageBackdrop}></div>
                        <img src={heroImageUrl} alt="โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย" style={styles.heroImage} />
                    </div>
                </section>

                {/* 🌟 About Section */}
                <section id="about" style={styles.about}>
                    <div style={styles.sectionContainer}>
                        <div style={styles.aboutGrid}>
                            <div style={styles.aboutContent}>
                                <div style={styles.sectionLabel}>
                                    <Award size={16} color="#0284C7" />
                                    <span>ABOUT OUR SCHOOL</span>
                                </div>
                                <h2 style={styles.sectionTitle}>
                                    มุ่งมั่นสร้างรากฐาน <br />
                                    <span style={styles.sectionHighlight}>เพื่ออนาคตของเด็กทุกคน</span>
                                </h2>
                                <p style={styles.sectionText}>
                                    จัดตั้งขึ้นเมื่อปี พ.ศ. 2528 เพื่อเป็นโรงเรียนต้นแบบด้านการศึกษา วิจัย และพัฒนาการเรียนรู้
                                    เน้นผู้เรียนเป็นสำคัญ บรรยากาศอบอุ่น ปลอดภัย เสริมสร้างทักษะทั้งด้านวิชาการและอารมณ์
                                </p>

                                <div style={styles.mottoBox}>
                                    <Heart size={20} color="#F43F5E" fill="#F43F5E" />
                                    <span>"คนดี คนเก่ง และมีความสุข"</span>
                                </div>
                            </div>

                            <div style={styles.statGrid}>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statIconBag, background: '#E0F2FE' }}><Calendar size={22} color="#0284C7" /></div>
                                    <div style={styles.statNumber}>2528</div>
                                    <div style={styles.statLabel}>ปีที่เริ่มก่อตั้ง</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statIconBag, background: '#FFEDD5' }}><Users size={22} color="#EA580C" /></div>
                                    <div style={styles.statNumber}>10</div>
                                    <div style={styles.statLabel}>ลำดับผู้อำนวยการ</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statIconBag, background: '#DCFCE7' }}><Award size={22} color="#16A34A" /></div>
                                    <div style={styles.statNumber}>ดีมาก</div>
                                    <div style={styles.statLabel}>ผลประเมิน สมศ.</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ ...styles.statIconBag, background: '#F3E8FF' }}><BookOpen size={22} color="#9333EA" /></div>
                                    <div style={styles.statNumber}>บริบาล-ม.6</div>
                                    <div style={styles.statLabel}>ระดับชั้นที่เปิดสอน</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🌟 News Section */}
                <section id="news" style={styles.newsSection}>
                    <div style={styles.sectionContainer}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <div style={styles.sectionLabel}>
                                    <Newspaper size={16} color="#0284C7" />
                                    <span>NEWS & UPDATES</span>
                                </div>
                                <h2 style={styles.sectionTitle}>ข่าวสารและกิจกรรมล่าสุด</h2>
                            </div>
                            <button style={styles.viewAllBtn}>
                                ดูข่าวทั้งหมด <ChevronRight size={16} />
                            </button>
                        </div>

                        {news.length === 0 ? (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}>🎈</div>
                                <p style={styles.emptyText}>ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้</p>
                            </div>
                        ) : (
                            <div style={styles.newsGrid}>
                                {news.slice(0, 6).map((item, index) => (
                                    <article key={item.PublicRelation_id || item.id || index} style={styles.newsCard}>
                                        <div style={styles.newsImageWrapper}>
                                            {item.Image ? (
                                                <img src={item.Image} alt={item.Name_activity} style={styles.newsImage} />
                                            ) : (
                                                <div style={{ ...styles.newsImagePlaceholder, background: ['#E0F2FE', '#DCFCE7', '#FFEDD5', '#F3E8FF', '#FFE4E6', '#FEF08A'][index % 6] }}>
                                                    {['📚', '🏆', '🎨', '🎵', '🌱', '⚽'][index % 6]}
                                                </div>
                                            )}
                                            <div style={styles.newsBadge}>ประชาสัมพันธ์</div>
                                        </div>
                                        <div style={styles.newsBody}>
                                            <div style={styles.newsMeta}>
                                                <Clock size={13} color="#0284C7" />
                                                <span>{displayFormattedDate(item.Date)}</span>
                                            </div>
                                            <h3 style={styles.newsTitle}>{item.Name_activity || item.Name}</h3>
                                            <p style={styles.newsDescription}>{item.Detail || "-"}</p>
                                            <div style={styles.newsLocation}>
                                                <MapPin size={13} color="#0284C7" />
                                                <span>{item.Location || "โรงเรียนสาธิตฯ มรภ.เลย"}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 🌟 Activities Section */}
                <section id="activities" style={styles.activitiesSection}>
                    <div style={styles.sectionContainer}>
                        <div style={{ ...styles.sectionHeader, justifyContent: 'center', textAlign: 'center' }}>
                            <div>
                                <div style={styles.sectionLabel}>
                                    <Sparkles size={16} color="#0284C7" />
                                    <span>ACTIVITIES</span>
                                </div>
                                <h2 style={styles.sectionTitle}>เติมสร้างประสบการณ์ผ่านกิจกรรม</h2>
                                <p style={styles.sectionSubtext}>ส่งเสริมพัฒนาการรอบด้านทั้ง ร่างกาย อารมณ์ สังคม และสติปัญญา</p>
                            </div>
                        </div>

                        <div style={styles.activityGrid}>
                            {activities.map((activity, index) => (
                                <div key={index} style={{ ...styles.activityCard, background: activity.bg }}>
                                    <div style={styles.activityIconBox}>
                                        {activity.icon}
                                    </div>
                                    <span style={styles.activityTag}>{activity.tag}</span>
                                    <h3 style={styles.activityTitle}>{activity.title}</h3>
                                    <p style={styles.activityText}>{activity.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* 🌟 Footer */}
            <footer id="contact" style={styles.footer}>
                <div style={styles.footerContainer}>
                    <div style={styles.footerColumns}>
                        <div style={styles.footerBrandCol}>
                            <div style={styles.footerBrand}>
                                <div style={styles.footerLogo}>
                                    <School size={26} color="#0284C7" />
                                </div>
                                <span style={styles.footerBrandName}>{schoolName}</span>
                            </div>
                            <p style={styles.footerDesc}>
                                มุ่งมั่นจัดการเรียนรู้ระดับปฐมวัยและประถมศึกษาอย่างมีคุณภาพ เพื่อการพัฒนาที่สมวัยและยั่งยืน
                            </p>
                        </div>

                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>เมนูทางลัด</h4>
                            <ul style={styles.footerColList}>
                                <li><a href="#home" onClick={() => scrollTo("home")}>หน้าแรก</a></li>
                                <li><a href="#about" onClick={() => scrollTo("about")}>เกี่ยวกับเรา</a></li>
                                <li><a href="#news" onClick={() => scrollTo("news")}>ข่าวประชาสัมพันธ์</a></li>
                                <li><a href="#activities" onClick={() => scrollTo("activities")}>กิจกรรมโรงเรียน</a></li>
                            </ul>
                        </div>

                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>ติดต่อสอบถาม</h4>
                            <ul style={styles.footerColList}>
                                <li><MapPin size={15} color="#38BDF8" /> 234 หมู่ 11 ถ.เลย-เชียงคาน อ.เมือง จ.เลย 42000</li>
                                <li><Phone size={15} color="#38BDF8" /> <a href="tel:042845009">042-845009</a></li>
                                <li><Mail size={15} color="#38BDF8" /> <a href="mailto:satit@lru.ac.th">satit@lru.ac.th</a></li>
                                <li><Globe size={15} color="#38BDF8" /> <a href="https://satit.lru.ac.th/" target="_blank" rel="noopener noreferrer">satit.lru.ac.th <ExternalLink size={12} /></a></li>
                            </ul>
                        </div>
                    </div>

                    <div style={styles.footerBottom}>
                        <p style={styles.copyright}>
                            © 2569 {schoolName}. All Rights Reserved.
                        </p>
                        <div style={styles.footerBottomLinks}>
                            <span>นโยบายความเป็นส่วนตัว</span>
                            <span>•</span>
                            <span>ข้อกำหนดการใช้งาน</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const styles = {
    page: {
        fontFamily: "'Prompt', 'Kanit', 'Sarabun', system-ui, sans-serif",
        color: "#1E293B",
        background: "#F8FAFC",
        lineHeight: 1.6,
        overflowX: "hidden",
        paddingTop: 76,
    },
    header: {
        height: 76,
        padding: "0 clamp(20px, 5vw, 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        transition: "all 0.3s ease",
    },
    brand: {
        display: "flex",
        alignItems: "center",     // 👈 บังคับให้โลโก้และข้อความอยู่กึ่งกลางแนวตั้งเดียวกัน
        gap: 12,                  // เว้นระยะห่างระหว่างโลโก้กับตัวหนังสือ
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
    },
    logoWrapper: {
        width: 58,
        height: 58,
        minWidth: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transform: "translateY(4px)", // 👈 ขยับตัวโลโก้ลงมาด้านล่าง 4-6px
    },
    logoImage: {
        width: "100%",
        height: "100%",
        objectFit: "contain",
    },
    brandText: {
        fontSize: 18,
        fontWeight: 700,
        color: "#0F172A",
        lineHeight: 1,           // 👈 บังคับความสูงบรรทัดตัวหนังสือไม่ให้มีพื้นที่ว่างดันลงมา
        display: "inline-block",
    },
    menuToggle: {
        display: "none",
        border: 0,
        background: "#F1F5F9",
        cursor: "pointer",
        padding: 8,
        borderRadius: 10,
    },
    nav: {
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    navDivider: {
        width: 1,
        height: 24,
        background: "#E2E8F0",
        margin: "0 8px",
    },
    loginButton: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 18px",
        border: "1.5px solid #E2E8F0",
        color: "#334155",
        background: "#FFFFFF",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        transition: "all 0.2s ease",
    },
    registerButton: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 20px",
        border: "none",
        color: "#fff",
        background: "linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)",
        borderRadius: 12,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        transition: "all 0.2s ease",
        boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
    },
    hero: {
        minHeight: "82vh",
        display: "grid",
        gridTemplateColumns: "0.8fr 1.3fr",
        position: "relative",
        background: "linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #F8FAFC 100%)",
        padding: "clamp(40px, 6vw, 80px) clamp(20px, 5vw, 80px)",
        gap: 40,
        alignItems: "center",
        overflow: "hidden",
    },
    orb1: {
        position: "absolute",
        top: "-10%",
        left: "-5%",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(254,215,170,0.4) 0%, rgba(255,255,255,0) 70%)",
        pointerEvents: "none",
    },
    orb2: {
        position: "absolute",
        bottom: "10%",
        right: "10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(186,230,253,0.5) 0%, rgba(255,255,255,0) 70%)",
        pointerEvents: "none",
    },
    heroContent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 2,
    },
    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#FFFFFF",
        padding: "6px 16px",
        borderRadius: 30,
        fontSize: 13,
        fontWeight: 600,
        color: "#0284C7",
        marginBottom: 20,
        boxShadow: "0 2px 10px rgba(2, 132, 199, 0.08)",
        width: "fit-content",
        border: "1px solid #E0F2FE",
    },
    heroTitle: {
        fontSize: "clamp(32px, 3.8vw, 54px)",
        fontWeight: 800,
        lineHeight: 1.25,
        color: "#0F172A",
        margin: 0,
        letterSpacing: "-0.03em",
    },
    heroHighlight: {
        background: "linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    heroActions: {
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        marginBottom: 36,
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 28px",
        background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(2, 132, 199, 0.35)",
        transition: "all 0.3s ease",
    },
    secondaryButton: {
        padding: "14px 28px",
        background: "#FFFFFF",
        color: "#0F172A",
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },
    quickFeature: {
        display: "flex",
        gap: 20,
        alignItems: "center",
        flexWrap: "wrap",
    },
    featureItem: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#475569",
    },
    featureDot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
    },
    heroImageWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        width: "100%",
    },
    imageBackdrop: {
        position: "absolute",
        width: "90%",
        height: "90%",
        background: "linear-gradient(135deg, #FDBA74 0%, #38BDF8 100%)",
        borderRadius: 30,
        filter: "blur(40px)",
        opacity: 0.3,
        zIndex: 0,
    },
    heroImage: {
        width: "100%",
        maxWidth: "none",
        height: "auto",
        borderRadius: 24,
        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.15)",
        objectFit: "cover",
        position: "relative",
        zIndex: 1,
        border: "4px solid #FFFFFF",
        transform: "scale(1.15)",
    },
    sectionContainer: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "clamp(50px, 7vw, 90px) clamp(20px, 4vw, 40px)",
    },
    sectionLabel: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        color: "#0284C7",
        letterSpacing: 1.2,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: "clamp(26px, 3vw, 38px)",
        fontWeight: 800,
        color: "#0F172A",
        margin: "0 0 12px 0",
        lineHeight: 1.3,
        letterSpacing: "-0.02em",
    },
    sectionHighlight: {
        color: "#0284C7",
    },
    sectionSubtext: {
        fontSize: 15,
        color: "#64748B",
        marginTop: 6,
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 40,
        gap: 20,
        flexWrap: "wrap",
    },
    viewAllBtn: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "10px 20px",
        background: "#F0F9FF",
        border: "none",
        color: "#0284C7",
        fontSize: 14,
        fontWeight: 600,
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },
    about: {
        background: "#FFFFFF",
    },
    aboutGrid: {
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: 60,
        alignItems: "center",
    },
    aboutContent: {},
    sectionText: {
        fontSize: 16,
        color: "#475569",
        lineHeight: 1.8,
        margin: "0 0 28px 0",
    },
    mottoBox: {
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 24px",
        background: "#FFF1F2",
        borderRadius: 16,
        color: "#E11D48",
        fontWeight: 700,
        fontSize: 15,
        border: "1px solid #FFE4E6",
    },
    statGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
    },
    statCard: {
        padding: "24px 20px",
        borderRadius: 20,
        background: "linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)",
        border: "1px solid #E0F2FE",
        textAlign: "center",
        boxShadow: "0 4px 20px rgba(56, 189, 248, 0.05)",
        transition: "all 0.3s ease",
    },
    statIconBag: {
        width: 48,
        height: 48,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 12px",
    },
    statNumber: {
        fontSize: "clamp(22px, 2vw, 28px)",
        fontWeight: 800,
        color: "#0F172A",
    },
    statLabel: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 2,
    },
    newsSection: {
        background: "#F8FAFC",
    },
    newsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", // 👈 ปรับ minmax จาก 320px เหลือ 250px - 260px
        gap: 20, // 👈 ลดระยะห่างระหว่างการ์ดจาก 28 เหลือ 20px
    },
    newsCard: {
        background: "linear-gradient(180deg, #FFFFFF 0%, #d2e9fa 100%)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(56, 189, 248, 0.06)",
        border: "1px solid #E0F2FE",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
    },
    newsImageWrapper: {
        position: "relative",
        height: 160,
        overflow: "hidden",
    },
    newsImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    newsImagePlaceholder: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 56,
    },
    newsBadge: {
        position: "absolute",
        top: 14,
        left: 14,
        padding: "5px 14px",
        borderRadius: 20,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(8px)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
    },
    newsBody: {
        padding: "14px 18px",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
    },
    newsMeta: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "#0284C7",
        marginBottom: 10,
        fontWeight: 600,
    },
    newsTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: "#0F172A",
        margin: "0 0 10px 0",
        lineHeight: 1.4,
    },
    newsDescription: {
        fontSize: 13,
        color: "#64748B",
        margin: "0 0 16px 0",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        lineHeight: 1.6,
        flexGrow: 1,
    },
    newsLocation: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "#0284C7",
        fontWeight: 600,
        paddingTop: 12,
        borderTop: "1px solid #F1F5F9",
    },
    activitiesSection: {
        background: "#FFFFFF",
    },
    activityGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 24,
    },
    activityCard: {
        padding: "32px 28px",
        borderRadius: 24,
        background: "linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)", // 👈 เปลี่ยนเป็นสีฟ้าอมขาวพาสเทลทั้งใบ
        border: "1px solid #BAE6FD",
        boxShadow: "0 10px 25px rgba(56, 189, 248, 0.08)",
        transition: "all 0.3s ease",
        position: "relative",
    },
    activityIconBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30,
        marginBottom: 20,
    },
    activityTag: {
        fontSize: 12,
        fontWeight: 700,
        color: "#0284C7",
        background: "#E0F2FE",
        padding: "5px 12px",
        borderRadius: 20,
        position: "absolute",
        top: 28,
        right: 28,
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#0F172A",
        margin: "0 0 8px 0",
    },
    activityText: {
        fontSize: 14,
        color: "#64748B",
        margin: 0,
        lineHeight: 1.6,
    },
    footer: {
        background: "#0F172A",
        color: "#94A3B8",
        padding: "clamp(50px, 6vw, 80px) clamp(20px, 4vw, 40px) 30px",
    },
    footerContainer: {
        maxWidth: 1200,
        margin: "0 auto",
    },
    footerColumns: {
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1.5fr",
        gap: 50,
        marginBottom: 50,
    },
    footerBrandCol: {},
    footerBrand: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    footerLogo: {
        width: 42,
        height: 42,
        borderRadius: 12,
        background: "rgba(2, 132, 199, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    footerBrandName: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: 700,
    },
    footerDesc: {
        fontSize: 14,
        lineHeight: 1.7,
        color: "#94A3B8",
        maxWidth: 340,
    },
    footerCol: {
        display: "flex",
        flexDirection: "column",
    },
    footerColTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: 700,
        margin: "0 0 20px 0",
    },
    footerColList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontSize: 14,
    },
    footerBottom: {
        borderTop: "1px solid #1E293B",
        paddingTop: 28,
        display: "flex",
        justifyContent: "space-between", // 👈 เปลี่ยนเป็น justifyContent
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        fontSize: 13,
    },
    copyright: {
        margin: 0,
    },
    footerBottomLinks: {
        display: "flex",
        gap: 12,
        alignItems: "center",
    },
    emptyState: {
        textAlign: "center",
        padding: "60px 20px",
        background: "#FFFFFF",
        borderRadius: 20,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        color: "#94A3B8",
        margin: 0,
    },
};

const responsiveCss = `
  * { box-sizing: border-box; }
  
  button { font-family: inherit; }
  
  nav button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 0;
    background: transparent;
    color: #475569;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s ease;
  }
  
  nav button:hover {
    background: #F1F5F9;
    color: #0284C7;
  }
  
  a { color: inherit; text-decoration: none; }
  a:hover { color: #38BDF8; }
  
  .footerColList li {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .statCard:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(56, 189, 248, 0.12);
  }
  
  .newsCard:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(2, 132, 199, 0.12);
  }
  
  .activityCard:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 32px rgba(2, 132, 199, 0.12);
    border-color: #BAE6FD;
  }
  
  .primaryButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(2, 132, 199, 0.45);
  }
  
  .secondaryButton:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
    transform: translateY(-2px);
  }
  
  .registerButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(2, 132, 199, 0.4);
  }
  
  .loginButton:hover {
    background: #F8FAFC;
    border-color: #CBD5E1;
  }

  @media (max-width: 1024px) {
    .aboutGrid { grid-template-columns: 1fr; gap: 40px; }
    .footerColumns { grid-template-columns: 1fr 1fr; gap: 40px; }
  }

  @media (max-width: 860px) {
    .menu-toggle { display: flex !important; }
    
    .nav {
      display: none !important;
      position: absolute;
      top: 76px;
      left: 16px;
      right: 16px;
      flex-direction: column;
      align-items: stretch !important;
      gap: 6px !important;
      padding: 16px;
      background: #FFFFFF;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.12);
      border: 1px solid #E2E8F0;
    }
    
    .nav-open {
      display: flex !important;
    }
    
    .nav-open button {
      padding: 12px 16px;
      justify-content: flex-start;
    }
    
    .hero {
      grid-template-columns: 1fr !important;
      padding-top: 30px !important;
      gap: 30px !important;
    }
    
    .heroImage {
      max-width: 100% !important;
    }
  }

  @media (max-width: 600px) {
    .footerColumns { grid-template-columns: 1fr; }
    .footerBottom { flex-direction: column; text-align: center; }
    
    .heroActions {
      flex-direction: column;
      width: 100%;
    }
    
    .heroActions button {
      width: 100%;
      justify-content: center;
    }
  }
`;