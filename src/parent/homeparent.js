import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  MapPin,
  Sparkles,
  Loader2,
  Activity,
  Clock,
  ArrowRight,
  School,
  Star,
  Users,
  CalendarDays
} from "lucide-react";

const HomeParent = () => {
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  const navigate = useNavigate();

  // ดึงข้อมูลห้องเรียนจาก user ใน localStorage
  const getParentClass = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.Class_level || userData.class_level || "อนุบาล1 ห้องปกติ";
      } catch (e) {
        console.error("Error parsing user data for class level:", e);
        return "อนุบาล1 ห้องปกติ";
      }
    }
    return "อนุบาล1 ห้องปกติ";
  };

  const parentClass = getParentClass();

  useEffect(() => {
    // กำหนดคำทักทายตามเวลา
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("สวัสดีตอนเช้า");
    else if (hour < 18) setGreeting("สวัสดีตอนบ่าย");
    else setGreeting("สวัสดีตอนเย็น");

    const fetchParentHomeData = async () => {
      try {
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        // กรองข้อมูลการบ้านให้ตรงกับห้องเรียน
        const filteredHomework = notificationRes.data.filter((item) => {
          if (!item.Class_level || !parentClass) return false;

          const dbClass = item.Class_level.toString().replace(/\s+/g, '');
          const currentParentClass = parentClass.toString().replace(/\s+/g, '');

          return dbClass.includes(currentParentClass) || currentParentClass.includes(dbClass);
        });

        setLatestNotifications(filteredHomework.slice(0, 4));
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้าผู้ปกครอง:", error);
        setLoading(false);
      }
    };

    fetchParentHomeData();
  }, [parentClass]);

  const handleHomeworkClick = (id) => {
    navigate(`/homework/${id}`);
  };

  const handleActivityClick = (id) => {
    navigate(`/activity/${id}`);
  };

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
                {greeting} (ผู้ปกครอง) 👋
              </h1>
              <p style={styles.subGreeting}>
                ติดตามการบ้านและกิจกรรมของนักเรียน ชั้น {parentClass}
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

        {/* Content Row */}
        <div style={styles.contentRow}>
          {/* Homework Notifications */}
          <div style={styles.infoBox}>
            <div style={styles.boxHeader}>
              <div style={styles.boxHeaderLeft}>
                <div style={styles.boxIconBlue}>
                  <Bell size={18} color="#4A90D9" />
                </div>
                <h3 style={styles.boxTitle}>การบ้านล่าสุด</h3>
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
                    onClick={() => handleHomeworkClick(item.id || index)}
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
                      ชั้น {item.Class_level || parentClass}
                    </span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <Bell size={40} color="#CBD5E1" />
                  <p style={styles.emptyText}>ไม่มีข้อมูลการบ้านของห้องเรียนนี้</p>
                </div>
              )}
            </div>
          </div>

          {/* School Activities */}
          <div style={styles.infoBox}>
            <div style={styles.boxHeader}>
              <div style={styles.boxHeaderLeft}>
                <div style={styles.boxIconOrange}>
                  <Activity size={18} color="#E67E22" />
                </div>
                <h3 style={styles.boxTitle}>กิจกรรมล่าสุดของโรงเรียน</h3>
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
                    onClick={() => handleActivityClick(item.id || index)}
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
                  <p style={styles.emptyText}>ไม่มีข้อมูลกิจกรรมล่าสุด</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerItem}>
              <School size={16} color="#94A3B8" />
              <span>ห้องเรียนปัจจุบัน: <strong>{parentClass}</strong></span>
            </div>
            <div style={styles.footerItem}>
              <BookOpen size={16} color="#94A3B8" />
              <span>การบ้านล่าสุด: <strong>{latestNotifications.length}</strong> รายการ</span>
            </div>
            <div style={styles.footerItem}>
              <CalendarDays size={16} color="#94A3B8" />
              <span>กิจกรรมล่าสุด: <strong>{latestActivities.length}</strong> กิจกรรม</span>
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

  // Content Row
  contentRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
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

export default HomeParent;