import React, { useState, useEffect } from "react";
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
    Star,
    Heart,
    ThumbsUp,
    ExternalLink,
    ChevronRight,
    Play,
    Quote,
    Sun,
    Cloud,
    Flower,
    Book,
    Music,
    Paintbrush,
    Leaf,
    Smile
} from "lucide-react";

export default function HomePage({
    schoolName = "ระบบบันทึกกิจกรรม โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย",
    onLogin = () => { },
    onRegister = () => { },
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [news, setNews] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);

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
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const displayFormattedDate = (dateStr) => {
        if (!dateStr) return '-';
        const cleanStr = String(dateStr).split('T')[0];
        const parts = cleanStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    const activities = [
        { icon: "🔬", title: "สัปดาห์วิทยาศาสตร์", text: "เรียนรู้ผ่านการทดลองและนิทรรศการสร้างสรรค์", color: "#E3F2FD", emoji: "🧪" },
        { icon: "⚽", title: "กีฬาสี", text: "เติมพลังทีมเวิร์ก สุขภาพ และมิตรภาพ", color: "#E8F5E9", emoji: "🏅" },
        { icon: "🎨", title: "เวทีแสดงความสามารถ", text: "พื้นที่ให้ทุกความสามารถได้เปล่งประกาย", color: "#FFF3E0", emoji: "🎭" },
        { icon: "🌱", title: "ปลูกผักสวนครัว", text: "เรียนรู้ธรรมชาติและความรับผิดชอบ", color: "#F1F8E9", emoji: "🌿" },
        { icon: "🎵", title: "ดนตรีสร้างสุข", text: "ฝึกสมาธิและจังหวะผ่านเสียงเพลง", color: "#F3E5F5", emoji: "🎶" },
        { icon: "📖", title: "นิทานสร้างเสริมคุณธรรม", text: "ปลูกฝังจริยธรรมผ่านเรื่องราวสนุกสนาน", color: "#E8EAF6", emoji: "📚" },
    ];

    const testimonials = [
        {
            name: "คุณแม่น้องแพรว",
            role: "ผู้ปกครองชั้นอนุบาล 3",
            text: "ลูกสาวชอบมาโรงเรียนมาก ครูใจดีและเอาใจใส่ดีมากค่ะ เห็นพัฒนาการของลูกชัดเจน",
            avatar: "👩",
        },
        {
            name: "คุณพ่อตะวัน",
            role: "ผู้ปกครองชั้นอนุบาล 2",
            text: "โรงเรียนมีกิจกรรมหลากหลาย ลูกได้เรียนรู้ทั้งวิชาการและชีวิตจริง ภูมิใจมากครับ",
            avatar: "👨",
        },
        {
            name: "คุณครูแอน",
            role: "ครูผู้สอนชั้นอนุบาล",
            text: "การสอนที่นี่คือความสุข เราได้เห็นรอยยิ้มและความสนุกของเด็กทุกวัน",
            avatar: "👩‍🏫",
        },
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
                boxShadow: scrolled ? '0 4px 30px rgba(74, 144, 217, 0.08)' : 'none',
                background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)',
            }}>
                <button type="button" style={styles.brand} onClick={() => scrollTo("home")}>
                    <div style={styles.logoWrapper}>
                        <School size={28} color="#4A90D9" />
                    </div>
                    <span style={styles.brandText}>{schoolName}</span>
                </button>

                <button className="menu-toggle" style={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <nav className={menuOpen ? "nav nav-open" : "nav"} style={styles.nav}>
                    <button onClick={() => scrollTo("home")}><Home size={16} /> หน้าแรก</button>
                    <button onClick={() => scrollTo("about")}><Info size={16} /> เกี่ยวกับ</button>
                    <button onClick={() => scrollTo("news")}><Newspaper size={16} /> ข่าวสาร</button>
                    <button onClick={() => scrollTo("activities")}><Activity size={16} /> กิจกรรม</button>
                    <button onClick={() => scrollTo("contact")}><MessageCircle size={16} /> ติดต่อ</button>
                    <button style={styles.loginButton} onClick={handleLogin}>
                        <LogIn size={16} /> เข้าสู่ระบบ
                    </button>
                    <button style={styles.registerButton} onClick={handleRegister}>
                        <UserPlus size={16} /> ลงทะเบียน
                    </button>
                </nav>
            </header>

            <main>
                {/* 🌟 Hero Section - ปรับปรุงใหม่ */}
                <section id="home" style={styles.hero}>
                    <div style={styles.heroContent}>
                        <div style={styles.heroBadge}>
                            <Sparkles size={16} color="#4A90D9" />
                            <span>ยินดีต้อนรับ</span>
                        </div>
                        <h1 style={styles.heroTitle}>
                            โรงเรียน<br />
                            <span style={styles.heroHighlight}>สาธิตมหาวิทยาลัยราชภัฏเลย</span>
                        </h1>
                        <p style={styles.heroText}>


                        </p>
                        <div style={styles.heroActions}>
                            <button type="button" style={styles.primaryButton} onClick={handleRegister}>
                                ลงทะเบียน <ArrowRight size={18} />
                            </button>
                            <button type="button" style={styles.secondaryButton} onClick={() => scrollTo("about")}>
                                รู้จักโรงเรียน
                            </button>
                        </div>

                    </div>
                    <div style={styles.heroImageWrapper}>
                        <img src={heroImageUrl} alt="โรงเรียนสาธิตมหาวิทยาลัยราชภัฏเลย" style={styles.heroImage} />

                    </div>
                </section>

                {/* 🌟 About Section - ปรับปรุงใหม่ */}
                <section id="about" style={styles.about}>
                    <div style={styles.sectionContainer}>
                        <div style={styles.aboutGrid}>
                            <div style={styles.aboutContent}>
                                <div style={styles.sectionLabel}>
                                    <Award size={18} color="#4A90D9" />
                                    <span>เกี่ยวกับเรา</span>
                                </div>
                                <h2 style={styles.sectionTitle}>
                                    โรงเรียนสาธิต<br />
                                    <span style={styles.sectionHighlight}>มหาวิทยาลัยราชภัฏเลย</span>
                                </h2>
                                <p style={styles.sectionText}>
                                    จัดตั้งขึ้นเมื่อปี พ.ศ. 2528 เพื่อเป็นโรงเรียนต้นแบบด้านการศึกษา วิจัย และพัฒนาการเรียนรู้
                                    เปิดสอนตั้งแต่ระดับบริบาล อนุบาล ถึงประถมศึกษาปีที่ 6 มุ่งเน้นการเรียนรู้ตามพัฒนาการ
                                    เสริมสร้างความคิดสร้างสรรค์ และทักษะชีวิต ภายใต้การดูแลของคณาจารย์และผู้เชี่ยวชาญ
                                    เพื่อสร้างนักเรียนให้เป็น <strong style={{ color: '#4A90D9' }}>"คนดี คนเก่ง และมีความสุข"</strong>
                                </p>

                            </div>

                            <div style={styles.statGrid}>
                                <div style={styles.statCard}>
                                    <div style={styles.statIcon}><Calendar size={24} color="#4A90D9" /></div>
                                    <div style={styles.statNumber}>2528</div>
                                    <div style={styles.statLabel}>ปีที่ก่อตั้ง</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statIcon}><Users size={24} color="#4A90D9" /></div>
                                    <div style={styles.statNumber}>10</div>
                                    <div style={styles.statLabel}>ผู้อำนวยการ</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statIcon}><Award size={24} color="#4A90D9" /></div>
                                    <div style={styles.statNumber}>ดีมาก</div>
                                    <div style={styles.statLabel}>ผลประเมิน สมศ.</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={styles.statIcon}><BookOpen size={24} color="#4A90D9" /></div>
                                    <div style={styles.statNumber}>บริบาล - ป.6</div>
                                    <div style={styles.statLabel}>ระดับชั้นที่เปิด</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🌟 News Section - ปรับปรุงใหม่ */}
                <section id="news" style={styles.newsSection}>
                    <div style={styles.sectionContainer}>
                        <div style={styles.sectionHeader}>
                            <div>
                                <div style={styles.sectionLabel}>
                                    <Newspaper size={18} color="#4A90D9" />
                                    <span>ข่าวประชาสัมพันธ์</span>
                                </div>
                                <h2 style={styles.sectionTitle}>กิจกรรมล่าสุด</h2>
                                <p style={styles.sectionSubtext}>ติดตามข่าวสารและกิจกรรมต่างๆ ของโรงเรียน</p>
                            </div>
                            <button style={styles.viewAllBtn}>
                                ดูทั้งหมด <ChevronRight size={16} />
                            </button>
                        </div>

                        {news.length === 0 ? (
                            <div style={styles.emptyState}>
                                <div style={styles.emptyIcon}>📭</div>
                                <p style={styles.emptyText}>ไม่มีข้อมูลข่าวประชาสัมพันธ์ในขณะนี้</p>
                            </div>
                        ) : (
                            <div style={styles.newsGrid}>
                                {news.slice(0, 6).map((item, index) => (
                                    <article key={item.PublicRelation_id || item.id || index} style={styles.newsCard}>
                                        <div style={styles.newsImageWrapper}>
                                            {item.Image ? (
                                                <img src={item.Image} alt={item.Name_activity} style={styles.newsImage} />
                                            ) : (
                                                <div style={{ ...styles.newsImagePlaceholder, background: ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#E8EAF6', '#FBE9E7'][index % 6] }}>
                                                    {['📚', '🏆', '📅', '🎨', '🎵', '🌱'][index % 6]}
                                                </div>
                                            )}
                                            <div style={styles.newsBadge}>ประชาสัมพันธ์</div>
                                        </div>
                                        <div style={styles.newsBody}>
                                            <div style={styles.newsMeta}>
                                                <Clock size={14} color="#94A3B8" />
                                                <span>{displayFormattedDate(item.Date)}</span>
                                            </div>
                                            <h3 style={styles.newsTitle}>{item.Name_activity || item.Name}</h3>
                                            <p style={styles.newsDescription}>{item.Detail || "-"}</p>
                                            <div style={styles.newsLocation}>
                                                <MapPin size={14} color="#4A90D9" />
                                                <span>{item.Location || "ไม่ระบุสถานที่"}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 🌟 Activities Section - ปรับปรุงใหม่ */}
                <section id="activities" style={styles.activitiesSection}>
                    <div style={styles.sectionContainer}>
                        <div style={styles.sectionHeader}>
                            <div>

                                <h2 style={styles.sectionTitle}>

                                    <span style={styles.sectionHighlight}> กิจกรรมภายในโรงเรียน</span>
                                </h2>
                                <p style={styles.sectionSubtext}>

                                </p>
                            </div>
                        </div>

                        <div style={styles.activityGrid}>
                            {activities.map((activity, index) => (
                                <div key={index} style={{ ...styles.activityCard, background: activity.color }}>
                                    <div style={styles.activityIcon}>{activity.icon}</div>
                                    <h3 style={styles.activityTitle}>{activity.title}</h3>
                                    <p style={styles.activityText}>{activity.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>



            </main>

            {/* 🌟 Footer - ปรับปรุงใหม่ */}
            <footer id="contact" style={styles.footer}>
                <div style={styles.footerContainer}>
                    <div style={styles.footerTop}>
                        <div style={styles.footerBrand}>
                            <div style={styles.footerLogo}>
                                <School size={32} color="#4A90D9" />
                            </div>
                            <div>
                                <h3 style={styles.footerBrandName}>{schoolName}</h3>
                                <p style={styles.footerBrandDesc}>โรงเรียนต้นแบบด้านการศึกษา</p>
                            </div>
                        </div>
                        <div style={styles.footerSocial}>
                            <a href="#" style={styles.socialLink}>FB</a>
                            <a href="#" style={styles.socialLink}>IG</a>
                            <a href="#" style={styles.socialLink}>YT</a>
                            <a href="#" style={styles.socialLink}>LINE</a>
                        </div>
                    </div>

                    <div style={styles.footerColumns}>
                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>เกี่ยวกับโรงเรียน</h4>
                            <ul style={styles.footerColList}>
                                <li><a href="#about" onClick={() => scrollTo("about")}>ประวัติความเป็นมา</a></li>
                                <li><a href="#about" onClick={() => scrollTo("about")}>วิสัยทัศน์ & พันธกิจ</a></li>
                                <li><a href="#about" onClick={() => scrollTo("about")}>คณะผู้บริหาร</a></li>
                                <li><a href="#about" onClick={() => scrollTo("about")}>ผลการประเมิน สมศ.</a></li>
                            </ul>
                        </div>

                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>หลักสูตร</h4>
                            <ul style={styles.footerColList}>
                                <li>ระดับเตรียมบริบาล</li>
                                <li>ระดับอนุบาล (ปฐมวัย 2560)</li>
                                <li>ระดับประถมศึกษา (ขั้นพื้นฐาน 2551)</li>
                                <li>กิจกรรมพัฒนาผู้เรียน</li>
                            </ul>
                        </div>

                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>ติดต่อสอบถาม</h4>
                            <ul style={styles.footerColList}>
                                <li><MapPin size={14} /> 234 หมู่ 11 ถ.เลย-เชียงคาน อ.เมือง จ.เลย 42000</li>
                                <li><Phone size={14} /> <a href="tel:042845009">042-845009</a></li>
                                <li><Mail size={14} /> <a href="mailto:satit@lru.ac.th">satit@lru.ac.th</a></li>
                                <li><Globe size={14} /> <a href="https://satit.lru.ac.th/" target="_blank" rel="noopener noreferrer">satit.lru.ac.th <ExternalLink size={12} /></a></li>
                            </ul>
                        </div>

                        <div style={styles.footerCol}>
                            <h4 style={styles.footerColTitle}>บริการ</h4>
                            <ul style={styles.footerColList}>
                                <li><button style={styles.footerLinkBtn} onClick={handleLogin}>เข้าสู่ระบบ</button></li>
                                <li><button style={styles.footerLinkBtn} onClick={handleRegister}>ลงทะเบียน</button></li>
                            </ul>
                        </div>
                    </div>

                    <div style={styles.footerBottom}>
                        <p style={styles.copyright}>
                            Copyright © 2569 {schoolName}. All Rights Reserved.
                        </p>
                        <div style={styles.footerBottomLinks}>
                            <span>นโยบายความเป็นส่วนตัว</span>
                            <span>|</span>
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
        fontFamily: "'Inter', 'Kanit', 'Sarabun', system-ui, sans-serif",
        color: "#1A202C",
        background: "#F8FAFC",
        lineHeight: 1.6,
    },

    // 🌟 Header
    header: {
        height: 72,
        padding: "0 clamp(16px, 5vw, 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
        transition: "all 0.3s ease",
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        border: 0,
        background: "transparent",
        cursor: "pointer",
        padding: 0,
    },
    logoWrapper: {
        width: 42,
        height: 42,
        borderRadius: 12,
        background: "#EBF3FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    brandText: {
        fontWeight: 700,
        fontSize: "clamp(14px, 1.2vw, 18px)",
        color: "#1A202C",
        whiteSpace: "nowrap",
    },
    menuToggle: {
        display: "none",
        border: 0,
        background: "transparent",
        color: "#1A202C",
        cursor: "pointer",
        padding: 8,
        borderRadius: 8,
    },
    nav: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    loginButton: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        border: "1px solid #4A90D9",
        color: "#4A90D9",
        background: "transparent",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        transition: "all 0.2s ease",
    },
    registerButton: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        border: "none",
        color: "#fff",
        background: "linear-gradient(135deg, #4A90D9, #357ABD)",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        transition: "all 0.2s ease",
        boxShadow: "0 4px 12px rgba(74, 144, 217, 0.25)",
    },

    // 🌟 Hero
    hero: {
        minHeight: "90vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        background: "linear-gradient(135deg, #E8F4FD 0%, #D4E8F5 100%)",
        overflow: "hidden",
        padding: "clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)",
        gap: 40,
    },
    heroContent: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        zIndex: 2,
    },
    heroBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.8)",
        padding: "6px 16px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        color: "#4A90D9",
        marginBottom: 20,
        backdropFilter: "blur(8px)",
        width: "fit-content",
    },
    heroTitle: {
        fontSize: "clamp(36px, 5vw, 56px)",
        fontWeight: 800,
        lineHeight: 1.2,
        color: "#1A202C",
        margin: 0,
    },
    heroHighlight: {
        color: "#4A90D9",
        position: "relative",
    },
    heroText: {
        fontSize: "clamp(15px, 1.1vw, 18px)",
        color: "#4A5568",
        margin: "20px 0 32px",
        lineHeight: 1.7,
    },
    heroActions: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 40,
    },
    primaryButton: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 28px",
        background: "linear-gradient(135deg, #4A90D9, #357ABD)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(74, 144, 217, 0.3)",
        transition: "all 0.3s ease",
    },
    secondaryButton: {
        padding: "14px 28px",
        background: "rgba(255,255,255,0.9)",
        color: "#4A90D9",
        border: "1px solid rgba(74, 144, 217, 0.3)",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.3s ease",
        backdropFilter: "blur(4px)",
    },
    heroStats: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        paddingTop: 20,
        borderTop: "1px solid rgba(74, 144, 217, 0.15)",
    },
    heroStat: {
        display: "flex",
        flexDirection: "column",
    },
    heroStatNumber: {
        fontSize: "clamp(20px, 2vw, 28px)",
        fontWeight: 700,
        color: "#1A202C",
    },
    heroStatLabel: {
        fontSize: 13,
        color: "#64748B",
    },
    heroStatDivider: {
        width: 1,
        height: 32,
        background: "#E2E8F0",
    },
    heroImageWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    heroImage: {
        width: "100%",
        maxWidth: 500,
        height: "auto",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        objectFit: "cover",
    },
    heroImageBadge: {
        position: "absolute",
        bottom: 24,
        left: 24,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 18px",
        borderRadius: 12,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
    },

    // 🌟 Section Common
    sectionContainer: {
        maxWidth: 1280,
        margin: "0 auto",
        padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)",
    },
    sectionLabel: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "#4A90D9",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: "clamp(28px, 3.2vw, 40px)",
        fontWeight: 700,
        color: "#1A202C",
        margin: "0 0 8px 0",
        lineHeight: 1.3,
    },
    sectionHighlight: {
        color: "#4A90D9",
    },
    sectionSubtext: {
        fontSize: 16,
        color: "#64748B",
        marginTop: 8,
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 32,
        gap: 20,
        flexWrap: "wrap",
    },
    viewAllBtn: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "8px 16px",
        background: "transparent",
        border: "none",
        color: "#4A90D9",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s ease",
    },

    // 🌟 About
    about: {
        background: "#FFFFFF",
    },
    aboutGrid: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: 50,
        alignItems: "center",
    },
    aboutContent: {},
    sectionText: {
        fontSize: 15,
        color: "#4A5568",
        lineHeight: 1.8,
        margin: "0 0 24px 0",
    },
    aboutFeatures: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    featureItem: {
        display: "flex",
        alignItems: "center",
        gap: 14,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#EBF3FB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    featureTitle: {
        display: "block",
        fontSize: 14,
        fontWeight: 600,
        color: "#1A202C",
    },
    featureDesc: {
        display: "block",
        fontSize: 13,
        color: "#64748B",
    },
    statGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
    },
    statCard: {
        padding: "24px 20px",
        borderRadius: 16,
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        textAlign: "center",
        transition: "all 0.3s ease",
    },
    statIcon: {
        marginBottom: 8,
    },
    statNumber: {
        fontSize: "clamp(20px, 2vw, 28px)",
        fontWeight: 700,
        color: "#1A202C",
    },
    statLabel: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 4,
    },

    // 🌟 News
    newsSection: {
        background: "#F8FAFC",
    },
    newsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 24,
    },
    newsCard: {
        background: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        border: "1px solid #E2E8F0",
        transition: "all 0.3s ease",
    },
    newsImageWrapper: {
        position: "relative",
        height: 200,
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
        top: 12,
        left: 12,
        padding: "4px 12px",
        borderRadius: 12,
        background: "rgba(74, 144, 217, 0.9)",
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.5,
    },
    newsBody: {
        padding: "16px 20px 20px",
    },
    newsMeta: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "#94A3B8",
        marginBottom: 8,
    },
    newsTitle: {
        fontSize: 17,
        fontWeight: 600,
        color: "#1A202C",
        margin: "0 0 8px 0",
        lineHeight: 1.4,
    },
    newsDescription: {
        fontSize: 14,
        color: "#64748B",
        margin: "0 0 12px 0",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
    },
    newsLocation: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "#4A90D9",
        fontWeight: 500,
    },

    // 🌟 Activities
    activitiesSection: {
        background: "#FFFFFF",
    },
    activityGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
    },
    activityCard: {
        padding: "28px 24px",
        borderRadius: 16,
        border: "1px solid #E2E8F0",
        transition: "all 0.3s ease",
        cursor: "default",
    },
    activityIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    activityTitle: {
        fontSize: 17,
        fontWeight: 600,
        color: "#1A202C",
        margin: "0 0 6px 0",
    },
    activityText: {
        fontSize: 14,
        color: "#64748B",
        margin: 0,
        lineHeight: 1.6,
    },

    // 🌟 Testimonials
    testimonialsSection: {
        background: "#FFFFFF",
    },
    testimonialContainer: {
        maxWidth: 640,
        margin: "0 auto",
        textAlign: "center",
    },
    testimonialCard: {
        padding: "40px 32px",
        background: "#F8FAFC",
        borderRadius: 20,
        border: "1px solid #E2E8F0",
        transition: "all 0.3s ease",
    },
    testimonialAvatar: {
        fontSize: 56,
        marginBottom: 16,
    },
    testimonialText: {
        fontSize: "clamp(18px, 1.4vw, 22px)",
        fontStyle: "italic",
        color: "#1A202C",
        lineHeight: 1.7,
        margin: "0 0 20px 0",
    },
    testimonialAuthor: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    testimonialDots: {
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 20,
    },
    testimonialDot: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s ease",
        padding: 0,
    },

    // 🌟 CTA
    ctaSection: {
        padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)",
        background: "linear-gradient(135deg, #4A90D9, #2C6B9E)",
    },
    ctaContent: {
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 32,
        flexWrap: "wrap",
    },
    ctaBadge: {
        display: "inline-block",
        padding: "4px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.15)",
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
        marginBottom: 12,
    },
    ctaTitle: {
        fontSize: "clamp(28px, 3.2vw, 40px)",
        fontWeight: 700,
        color: "#fff",
        margin: 0,
        lineHeight: 1.3,
    },
    ctaHighlight: {
        color: "#B3D9FF",
    },
    ctaText: {
        fontSize: 16,
        color: "rgba(255,255,255,0.85)",
        marginTop: 12,
        lineHeight: 1.7,
    },
    ctaButton: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "16px 32px",
        borderRadius: 12,
        background: "#FFFFFF",
        color: "#4A90D9",
        border: "none",
        fontSize: 18,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        flexShrink: 0,
    },

    // 🌟 Footer
    footer: {
        background: "#1A202C",
        color: "#CBD5E1",
        padding: "clamp(40px, 6vw, 60px) clamp(16px, 4vw, 40px)",
    },
    footerContainer: {
        maxWidth: 1280,
        margin: "0 auto",
    },
    footerTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #2D3748",
        paddingBottom: 24,
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16,
    },
    footerBrand: {
        display: "flex",
        alignItems: "center",
        gap: 14,
    },
    footerLogo: {
        width: 48,
        height: 48,
        borderRadius: 12,
        background: "rgba(74, 144, 217, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    footerBrandName: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 700,
        margin: 0,
    },
    footerBrandDesc: {
        fontSize: 13,
        color: "#94A3B8",
        margin: 0,
    },
    footerSocial: {
        display: "flex",
        gap: 12,
    },
    socialLink: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94A3B8",
        fontSize: 13,
        fontWeight: 600,
        transition: "all 0.2s ease",
    },
    footerColumns: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 32,
        marginBottom: 32,
    },
    footerCol: {
        display: "flex",
        flexDirection: "column",
    },
    footerColTitle: {
        color: "#fff",
        fontSize: 15,
        fontWeight: 600,
        margin: "0 0 16px 0",
    },
    footerColList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        fontSize: 14,
        color: "#94A3B8",
    },
    footerLinkBtn: {
        border: 0,
        background: "transparent",
        color: "#94A3B8",
        padding: 0,
        fontSize: 14,
        cursor: "pointer",
        textAlign: "left",
        transition: "color 0.2s ease",
    },
    footerBottom: {
        borderTop: "1px solid #2D3748",
        paddingTop: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
        fontSize: 13,
        color: "#94A3B8",
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
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
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
    color: #4A5568;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  nav button:hover {
    background: #F1F5F9;
    color: #1A202C;
  }
  
  a { color: inherit; text-decoration: none; }
  a:hover { color: #4A90D9; }
  
  .footerColList li {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .footerColList li a:hover {
    color: #4A90D9;
  }
  
  .footerLinkBtn:hover {
    color: #4A90D9 !important;
  }
  
  .socialLink:hover {
    background: rgba(74, 144, 217, 0.2);
    color: #4A90D9;
  }
  
  .statCard:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }
  
  .newsCard:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(74, 144, 217, 0.10);
  }
  
  .activityCard:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }
  
  .primaryButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(74, 144, 217, 0.35);
  }
  
  .secondaryButton:hover {
    background: #FFFFFF;
    border-color: #4A90D9;
    transform: translateY(-2px);
  }
  
  .ctaButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  }
  
  .registerButton:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(74, 144, 217, 0.35);
  }
  
  .loginButton:hover {
    background: #4A90D9;
    color: #fff;
  }
  
  .viewAllBtn:hover {
    background: #EBF3FB;
    border-radius: 8px;
  }

  @media (max-width: 1024px) {
    .aboutGrid { grid-template-columns: 1fr; gap: 32px; }
    .statGrid { grid-template-columns: repeat(2, 1fr); }
    .activityGrid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 860px) {
    .menu-toggle { display: flex !important; }
    
    .nav {
      display: none !important;
      position: absolute;
      top: 72px;
      left: 16px;
      right: 16px;
      flex-direction: column;
      align-items: stretch !important;
      gap: 4px !important;
      padding: 12px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.12);
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
      min-height: auto !important;
      padding-top: 40px !important;
      gap: 24px !important;
    }
    
    .heroImageWrapper {
      padding: 0 !important;
    }
    
    .heroImage {
      max-width: 100% !important;
    }
    
    .heroStats {
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .footerTop {
      flex-direction: column;
      align-items: flex-start !important;
    }
    
    .footerSocial {
      width: 100%;
      justify-content: flex-start;
    }
    
    .ctaContent {
      flex-direction: column;
      text-align: center;
    }
  }

  @media (max-width: 600px) {
    .statGrid { grid-template-columns: 1fr 1fr; }
    .activityGrid { grid-template-columns: 1fr !important; }
    .newsGrid { grid-template-columns: 1fr; }
    .footerColumns { grid-template-columns: 1fr 1fr; }
    .footerBottom { flex-direction: column; text-align: center; }
    
    .heroActions {
      flex-direction: column;
      width: 100%;
    }
    
    .heroActions button {
      width: 100%;
      justify-content: center;
    }
    
    .aboutFeatures {
      flex-direction: column;
    }
    
    .testimonialCard {
      padding: 24px !important;
    }
  }
`;