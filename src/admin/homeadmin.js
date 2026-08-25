import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, 
  GraduationCap, 
  UsersRound, 
  CalendarDays, 
  Activity,
  User,
  MapPin,
  Clock,
  ChevronRight,
  Loader2,
  UserCog,
  UserCheck,
  UserX,
  School
} from "lucide-react";

const HomeAdmin = () => {
  const [users, setUsers] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");
        const studentRes = await axios.get("http://localhost:3001/api/students");

        setUsers(userRes.data);
        setStudentCount(Array.isArray(studentRes.data) ? studentRes.data.length : 0);
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้าเดชบอร์ดแอดมิน:", error);
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, []);

  const teacherCount = users.filter(user => user.Role === "ครูผู้สอน").length;
  const parentCount = users.filter(user => user.Role === "ผู้ปกครอง").length;
  const adminCount = users.filter(user => user.Role === "แอดมิน").length;
  const suspendedCount = users.filter(user => user.Role === "ถูกระงับสิทธิ์").length;
  const activityCount = latestActivities.length;

  const statCards = [
    { 
      label: "นักเรียน", 
      value: studentCount, 
      unit: "คน", 
      icon: School,
      color: "#4A90D9",
      bgColor: "#EBF3FB"
    },
    { 
      label: "ครูผู้สอน", 
      value: teacherCount, 
      unit: "คน", 
      icon: GraduationCap,
      color: "#27AE60",
      bgColor: "#E8F8ED"
    },
    { 
      label: "ผู้ปกครอง", 
      value: parentCount, 
      unit: "คน", 
      icon: UsersRound,
      color: "#E67E22",
      bgColor: "#FDF2E9"
    },
    { 
      label: "กิจกรรมทั้งหมด", 
      value: activityCount, 
      unit: "กิจกรรม", 
      icon: CalendarDays,
      color: "#8E44AD",
      bgColor: "#F4ECF7"
    }
  ];

  const roleBadgeStyles = {
    "แอดมิน": { bg: "#FCE4EC", color: "#C62828", icon: UserCog },
    "ครูผู้สอน": { bg: "#E3F2FD", color: "#1565C0", icon: UserCheck },
    "ผู้ปกครอง": { bg: "#E8F5E9", color: "#2E7D32", icon: UsersRound },
    "ถูกระงับสิทธิ์": { bg: "#F5F5F5", color: "#9E9E9E", icon: UserX }
  };

  const getRoleBadge = (role) => {
    const defaultStyle = { bg: "#F3E5F5", color: "#6A1B9A", icon: User };
    return roleBadgeStyles[role] || defaultStyle;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>👋 สวัสดี แอดมิน</h1>
          <p style={styles.pageSubtitle}>ภาพรวมระบบบันทึกกิจกรรมนักเรียนอนุบาล</p>
        </div>
        <div style={styles.headerTime}>
          <Clock size={18} color="#7F8C8D" />
          <span style={styles.timeText}>
            {new Date().toLocaleDateString('th-TH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} style={{ ...styles.statCard, animationDelay: `${index * 0.1}s` }}>
              <div style={{ ...styles.statIconWrapper, backgroundColor: stat.bgColor }}>
                <IconComponent size={24} color={stat.color} />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statLabel}>{stat.label}</span>
                <span style={styles.statValue}>
                  {loading ? "..." : `${stat.value} ${stat.unit}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={styles.mainGrid}>
        {/* Users Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleWrapper}>
              <Users size={20} color="#4A90D9" />
              <h3 style={styles.cardTitle}>ผู้ใช้งานทั้งหมด</h3>
            </div>
            <span style={styles.cardBadge}>{users.length} คน</span>
          </div>
          <div style={styles.cardBody}>
            {loading ? (
              <div style={styles.loadingWrapper}>
                <Loader2 size={32} style={styles.spinner} />
                <p style={styles.loadingText}>กำลังโหลดข้อมูล...</p>
              </div>
            ) : users.length > 0 ? (
              <div style={styles.userList}>
                {users.slice(0, 5).map((user, index) => {
                  const badge = getRoleBadge(user.Role);
                  const IconComponent = badge.icon;
                  const isSuspended = user.Role === 'ถูกระงับสิทธิ์';
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        ...styles.userItem,
                        opacity: isSuspended ? 0.6 : 1,
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>
                          {user.Name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <span style={styles.userName}>{user.Name}</span>
                          <span style={{ ...styles.userRole, backgroundColor: badge.bg, color: badge.color }}>
                            <IconComponent size={12} />
                            {user.Role || "ทั่วไป"}
                          </span>
                        </div>
                      </div>
                      {isSuspended && (
                        <span style={styles.suspendedTag}>🚫 ระงับ</span>
                      )}
                    </div>
                  );
                })}
                {users.length > 5 && (
                  <div style={styles.viewMore}>
                    <span>และอื่นๆ อีก {users.length - 5} คน</span>
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            ) : (
              <p style={styles.emptyText}>ไม่มีข้อมูลผู้ใช้งานในระบบ</p>
            )}
          </div>
        </div>

        {/* Activities Section */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleWrapper}>
              <Activity size={20} color="#8E44AD" />
              <h3 style={styles.cardTitle}>กิจกรรมล่าสุด</h3>
            </div>
            <span style={styles.cardBadge}>{activityCount} รายการ</span>
          </div>
          <div style={styles.cardBody}>
            {loading ? (
              <div style={styles.loadingWrapper}>
                <Loader2 size={32} style={styles.spinner} />
                <p style={styles.loadingText}>กำลังโหลดข้อมูล...</p>
              </div>
            ) : latestActivities.length > 0 ? (
              <div style={styles.activityList}>
                {latestActivities.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ ...styles.activityItem, animationDelay: `${index * 0.08}s` }}
                  >
                    <div style={styles.activityIcon}>
                      <div style={styles.activityDot} />
                    </div>
                    <div style={styles.activityContent}>
                      <span style={styles.activityName}>{item.Name_activity}</span>
                      <div style={styles.activityMeta}>
                        {item.Location && (
                          <span style={styles.activityLocation}>
                            <MapPin size={14} color="#95A5A6" />
                            {item.Location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>ไม่มีกิจกรรมใหม่ในขณะนี้</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div style={styles.footerStats}>
        <div style={styles.footerStatItem}>
          <UserCog size={18} color="#C62828" />
          <span>แอดมิน: <strong>{adminCount}</strong> คน</span>
        </div>
        <div style={styles.footerStatItem}>
          <UserX size={18} color="#9E9E9E" />
          <span>ถูกระงับสิทธิ์: <strong>{suspendedCount}</strong> คน</span>
        </div>
        <div style={styles.footerStatItem}>
          <Users size={18} color="#4A90D9" />
          <span>ผู้ใช้งานทั้งหมด: <strong>{users.length}</strong> คน</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Kanit', 'Sarabun', system-ui, -apple-system, sans-serif",
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    borderRadius: '16px',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '4px 0',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#718096',
    margin: '4px 0 0 0',
    fontWeight: '400',
  },
  headerTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  timeText: {
    fontSize: '14px',
    color: '#4A5568',
    fontWeight: '500',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    width: '100%',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#FFFFFF',
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
    animation: 'fadeInUp 0.5s ease forwards',
    opacity: 0,
  },
  statIconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#718096',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1A202C',
    letterSpacing: '-0.5px',
  },

  // Main Grid
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    width: '100%',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #F1F5F9',
  },
  cardTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
  },
  cardBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#4A5568',
    backgroundColor: '#F1F5F9',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  cardBody: {
    padding: '16px 20px 20px',
    flex: 1,
  },

  // User List
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  userItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    animation: 'fadeInUp 0.3s ease forwards',
    opacity: 0,
    backgroundColor: '#FAFBFC',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A202C',
    marginRight: '8px',
  },
  userRole: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '500',
    padding: '2px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap',
  },
  suspendedTag: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#9E9E9E',
    backgroundColor: '#F5F5F5',
    padding: '2px 10px',
    borderRadius: '12px',
  },

  // Activity List
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    animation: 'fadeInUp 0.3s ease forwards',
    opacity: 0,
    backgroundColor: '#FAFBFC',
  },
  activityIcon: {
    paddingTop: '2px',
  },
  activityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#8E44AD',
    marginTop: '5px',
  },
  activityContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  activityName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A202C',
  },
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  activityLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#95A5A6',
  },

  // View More
  viewMore: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px',
    fontSize: '13px',
    color: '#4A90D9',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },

  // Footer Stats
  footerStats: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px 32px',
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
  },
  footerStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#4A5568',
  },

  // Loading
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
    gap: '12px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#4A90D9',
  },
  loadingText: {
    color: '#A0AEC0',
    fontSize: '14px',
  },

  // Empty
  emptyText: {
    color: '#A0AEC0',
    fontSize: '14px',
    textAlign: 'center',
    padding: '32px 0',
  },
};

// Global CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
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
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default HomeAdmin;