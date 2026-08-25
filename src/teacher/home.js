import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  CalendarDays,
  Bell,
  BookOpen,
  MapPin,
  ChevronRight,
  Sparkles,
  Loader2,
  UserCheck,
  Activity,
  Clock,
  ArrowRight,
  School,
  Star,
  TrendingUp,
  MessageCircle
} from "lucide-react";

const Home = () => {
  const [counts, setCounts] = useState({ students: 0, users: 0, activities: 0 });
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // กำหนดคำทักทายตามเวลา
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("สวัสดีตอนเช้า");
    else if (hour < 18) setGreeting("สวัสดีตอนบ่าย");
    else setGreeting("สวัสดีตอนเย็น");

    const fetchHomeData = async () => {
      try {
        const studentRes = await axios.get("http://localhost:3001/api/students");
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        const teacherUsers = userRes.data.filter(user => user.Role === "ครูผู้สอน");

        setCounts({
          students: studentRes.data.length,
          users: teacherUsers.length,
          activities: activityRes.data.length,
        });

        setLatestNotifications(notificationRes.data.slice(0, 4));
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้า Home:", error);
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const statCards = [
    {
      label: "นักเรียนทั้งหมด",
      value: counts.students,
      unit: "คน",
      icon: School,
      color: "#4A90D9",
      bg: "#EBF3FB",
      path: "/students",
      emoji: "🧑‍🎓"
    },
    {
      label: "ครูผู้สอน",
      value: counts.users,
      unit: "คน",
      icon: GraduationCap,
      color: "#27AE60",
      bg: "#E8F8ED",
      path: "/users",
      emoji: "👩‍🏫"
    },
    {
      label: "กิจกรรมทั้งหมด",
      value: counts.activities,
      unit: "กิจกรรม",
      icon: CalendarDays,
      color: "#E67E22",
      bg: "#FDF2E9",
      path: "/activity",
      emoji: "🎯"
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header with Greeting */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.greetingIcon}>
              <Sparkles size={24} color="#4A90D9" />
            </div>
            <div>
              <h1 style={styles.greetingText}>
                {greeting} 👋
              </h1>
              <p style={styles.subGreeting}>
                ยินดีต้อนรับสู่ระบบบันทึกกิจกรรมนักเรียนอนุบาล
              </p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.dateDisplay}>
              <Clock size={16} color="#94A3B8" />
              <span style={styles.dateText}>
                {new Date().toLocaleDateString('th-TH', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                style={styles.statCard}
                onClick={() => navigate(stat.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                }}
              >
                <div style={styles.statIconWrapper}>
                  <div style={{ ...styles.statIconBg, backgroundColor: stat.bg }}>
                    <IconComponent size={24} color={stat.color} />
                  </div>
                </div>
                <div style={styles.statContent}>
                  <span style={styles.statLabel}>{stat.label}</span>
                  <div style={styles.statValueWrapper}>
                    <span style={styles.statValue}>
                      {loading ? "..." : stat.value}
                    </span>
                    <span style={styles.statUnit}>{stat.unit}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#CBD5E1" style={styles.statArrow} />
              </div>
            );
          })}
        </div>

        {/* Content Row */}
        <div style={styles.contentRow}>
          {/* Notifications */}
          <div style={styles.infoBox}>
            <div style={styles.boxHeader}>
              <div style={styles.boxHeaderLeft}>
                <div style={styles.boxIconBlue}>
                  <Bell size={18} color="#4A90D9" />
                </div>
                <h3 style={styles.boxTitle}>การแจ้งเตือนล่าสุด</h3>
              </div>
              <button
                onClick={() => navigate("/notification")}
                style={styles.viewAllBtn}
              >
                ดูทั้งหมด
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={styles.listBox}>
              {loading ? (
                <div style={styles.loadingState}>
                  <Loader2 size={32} style={styles.spinner} />
                  <p style={styles.loadingText}>กำลังโหลดข้อมูล...</p>
                </div>
              ) : latestNotifications.length > 0 ? (
                latestNotifications.map((item, index) => (
                  <div
                    key={index}
                    style={styles.listItem}
                    onClick={() => navigate(`/homework/${item.id || index}`)}
                  >
                    <div style={styles.listItemContent}>
                      <div style={styles.listItemIcon}>
                        <BookOpen size={16} color="#4A90D9" />
                      </div>
                      <div style={styles.listItemText}>
                        <span style={styles.listItemTitle}>
                          {item.Subject || "ไม่ระบุวิชา"}
                        </span>
                        <span style={styles.listItemDesc}>
                          {item.Details || "ไม่มีรายละเอียด"}
                        </span>
                      </div>
                    </div>
                    <span style={styles.classBadge}>
                      ชั้น {item.Class_level || "ไม่ระบุ"}
                    </span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <Bell size={40} color="#CBD5E1" />
                  <p style={styles.emptyText}>ไม่มีการแจ้งเตือนล่าสุด</p>
                </div>
              )}
            </div>
          </div>

          {/* Activities */}
          <div style={styles.infoBox}>
            <div style={styles.boxHeader}>
              <div style={styles.boxHeaderLeft}>
                <div style={styles.boxIconOrange}>
                  <Activity size={18} color="#E67E22" />
                </div>
                <h3 style={styles.boxTitle}>กิจกรรมล่าสุด</h3>
              </div>
              <button
                onClick={() => navigate("/activity")}
                style={styles.viewAllBtn}
              >
                ดูทั้งหมด
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={styles.listBox}>
              {loading ? (
                <div style={styles.loadingState}>
                  <Loader2 size={32} style={styles.spinner} />
                  <p style={styles.loadingText}>กำลังโหลดข้อมูล...</p>
                </div>
              ) : latestActivities.length > 0 ? (
                latestActivities.map((item, index) => (
                  <div
                    key={index}
                    style={styles.listItem}
                    onClick={() => navigate(`/activity/${item.id || index}`)}
                  >
                    <div style={styles.listItemContent}>
                      <div style={styles.listItemIconOrange}>
                        <Star size={16} color="#E67E22" />
                      </div>
                      <div style={styles.listItemText}>
                        <span style={styles.listItemTitle}>
                          {item.Name_activity || "ไม่ระบุกิจกรรม"}
                        </span>
                        {item.Location && (
                          <span style={styles.listItemDesc}>
                            <MapPin size={12} color="#94A3B8" />
                            {item.Location}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.Location && (
                      <span style={styles.locationBadge}>
                        <MapPin size={12} />
                        {item.Location}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <Activity size={40} color="#CBD5E1" />
                  <p style={styles.emptyText}>ไม่มีกิจกรรมล่าสุด</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerItem}>
              <Users size={16} color="#94A3B8" />
              <span>ผู้ใช้งานทั้งหมด: <strong>{counts.users}</strong> คน</span>
            </div>
            <div style={styles.footerItem}>
              <School size={16} color="#94A3B8" />
              <span>นักเรียนทั้งหมด: <strong>{counts.students}</strong> คน</span>
            </div>
            <div style={styles.footerItem}>
              <CalendarDays size={16} color="#94A3B8" />
              <span>กิจกรรมทั้งหมด: <strong>{counts.activities}</strong> กิจกรรม</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '4px 0',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  greetingIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#EBF3FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  },
  subGreeting: {
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  dateDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  dateText: {
    fontSize: '14px',
    color: '#4A5568',
    fontWeight: '500',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    position: 'relative',
  },
  statIconWrapper: {
    flexShrink: 0,
    marginRight: '16px',
  },
  statIconBg: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '13px',
    color: '#94A3B8',
    fontWeight: '500',
    display: 'block',
  },
  statValueWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1A202C',
  },
  statUnit: {
    fontSize: '14px',
    color: '#94A3B8',
    fontWeight: '400',
  },
  statArrow: {
    flexShrink: 0,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    marginLeft: '8px',
  },

  // Content Row
  contentRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },

  // Info Box
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '380px',
  },
  boxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  boxHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  boxIconBlue: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#EBF3FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxIconOrange: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#FDF2E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
  },
  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    color: '#4A5568',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  // List
  listBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    gap: '12px',
  },
  listItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  listItemIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#EBF3FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listItemIconOrange: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#FDF2E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listItemText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  listItemTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A202C',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  listItemDesc: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94A3B8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  classBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#4A90D9',
    backgroundColor: '#EBF3FB',
    padding: '3px 10px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  locationBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '500',
    color: '#E67E22',
    backgroundColor: '#FDF2E9',
    padding: '3px 10px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  // Loading & Empty
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '12px',
    padding: '20px 0',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#4A90D9',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '14px',
    margin: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '12px',
    padding: '20px 0',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: '14px',
    margin: 0,
  },

  // Footer
  footer: {
    paddingTop: '16px',
    borderTop: '1px solid #E2E8F0',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    flexWrap: 'wrap',
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748B',
  },
};

// Global CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .stat-card {
    animation: fadeInUp 0.4s ease forwards;
  }
  
  .stat-card:nth-child(1) { animation-delay: 0.05s; }
  .stat-card:nth-child(2) { animation-delay: 0.1s; }
  .stat-card:nth-child(3) { animation-delay: 0.15s; }
  
  .stat-card:hover .stat-arrow {
    opacity: 1 !important;
  }
  
  .list-item:hover {
    background-color: #F1F5F9 !important;
  }
  
  @media (max-width: 768px) {
    .content-row {
      grid-template-columns: 1fr !important;
    }
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .footer-content {
      gap: 16px !important;
      flex-direction: column !important;
      align-items: center !important;
    }
    .header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .header-right {
      width: 100% !important;
    }
    .date-display {
      width: 100% !important;
      justify-content: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .stat-card {
      padding: 16px 18px !important;
    }
    .stat-value {
      font-size: 22px !important;
    }
    .info-box {
      padding: 16px !important;
      min-height: 300px !important;
    }
    .list-item {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .class-badge, .location-badge {
      align-self: flex-start !important;
    }
    .greeting-text {
      font-size: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Home;