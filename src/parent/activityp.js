import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Download,
  Image,
  Calendar,
  MapPin,
  Camera,
  Search,
  X,
  Grid3x3,
  List,
  Sparkles
} from "lucide-react";

// 🌟 คอมโพเนนต์ไอคอนดาวน์โหลด
const DownloadIcon = ({ size = 16, color = "currentColor" }) => (
  <Download size={size} color={color} strokeWidth={2} />
);

function ActivityP() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredCard, setHoveredCard] = useState(null);

  const API_URL = "http://127.0.0.1:3001/activities";

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
      });
      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลกิจกรรมมาแสดงฝั่งผู้ปกครองไม่สำเร็จ:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseActivityImages = (imageStr) => {
    try {
      const parsed = JSON.parse(imageStr);
      return Array.isArray(parsed) ? parsed : (imageStr ? [imageStr] : []);
    } catch (e) {
      return imageStr ? [imageStr] : [];
    }
  };

  const downloadSingleImage = (base64Data, index, activityName) => {
    if (!base64Data) return alert("ไม่พบข้อมูลรูปภาพ");
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = `กิจกรรม_${activityName || "school"}_รูปที่_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = (e, imagesArray, activityName) => {
    e.stopPropagation();
    if (imagesArray.length === 0) return alert("ไม่มีรูปภาพให้ดาวน์โหลด");

    if (window.confirm(`คุณต้องการดาวน์โหลดรูปภาพทั้งหมดจำนวน ${imagesArray.length} รูปใช่หรือไม่?`)) {
      imagesArray.forEach((imgData, idx) => {
        setTimeout(() => {
          downloadSingleImage(imgData, idx, activityName);
        }, idx * 250);
      });
    }
  };

  const filteredActivities = activities.filter((item) => {
    return (
      item.Name_activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "ไม่ระบุวันเวลา";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalActivities = activities.length;
  const totalImages = activities.reduce((sum, act) => sum + parseActivityImages(act.Image).length, 0);

  // 🌟 การ์ดแบบ Grid
  const ActivityGridCard = ({ item }) => {
    const imgList = parseActivityImages(item.Image);
    const previewImg = imgList.length > 0 ? imgList[0] : null;
    const isHovered = hoveredCard === item.Activity_id;

    return (
      <div
        key={item.Activity_id}
        style={{
          ...page.card,
          transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: isHovered
            ? '0 12px 40px rgba(99, 102, 241, 0.12), 0 4px 12px rgba(0,0,0,0.05)'
            : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: isHovered ? '2px solid #818cf8' : '1px solid #e2e8f0',
        }}
        onMouseEnter={() => setHoveredCard(item.Activity_id)}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() => { setSelectedActivity(item); setShowModal(true); }}
      >
        <div style={page.imageBadge}>
          <Image size={12} color="#fff" />
          <span style={{ marginLeft: '4px', fontSize: '11px', fontWeight: '600', color: '#fff' }}>
            {imgList.length}
          </span>
        </div>

        <div style={page.cardImageContainer}>
          {previewImg ? (
            <img src={previewImg} alt={item.Name_activity} style={page.cardImage} />
          ) : (
            <div style={page.cardImagePlaceholder}>
              <Image size={32} color="#cbd5e1" />
              <span style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px' }}>
                ไม่มีรูปภาพ
              </span>
            </div>
          )}
        </div>

        <div style={page.cardContent}>
          <h3 style={page.cardTitle}>{item.Name_activity || "ชื่อกิจกรรม"}</h3>

          <div style={page.infoList}>
            <div style={page.infoItem}>
              <Calendar size={14} color="#64748b" />
              <span style={page.infoText}>{formatDate(item.Activity_date)}</span>
            </div>
            <div style={page.infoItem}>
              <MapPin size={14} color="#64748b" />
              <span style={page.infoText}>{item.Location || "โรงเรียน"}</span>
            </div>
            <div style={page.infoItem}>
              <Camera size={14} color="#64748b" />
              <span style={page.infoText}>{item.Photographer || "คุณครู"}</span>
            </div>
          </div>
        </div>

        <div style={page.actionsRow}>
          <button
            onClick={(e) => downloadAllImages(e, imgList, item.Name_activity)}
            style={{
              ...page.downloadAllBtn,
              background: isHovered ? '#818cf8' : '#ffffff',
              color: isHovered ? '#ffffff' : '#1e293b',
              border: isHovered ? 'none' : '1px solid #cbd5e1',
              transition: 'all 0.2s ease',
            }}
          >
            <DownloadIcon size={14} color={isHovered ? '#fff' : '#1e293b'} />
            <span style={{ marginLeft: "6px" }}>ดาวน์โหลดทั้งหมด</span>
          </button>
        </div>
      </div>
    );
  };

  // 🌟 การ์ดแบบ List
  const ActivityListCard = ({ item }) => {
    const imgList = parseActivityImages(item.Image);
    const previewImg = imgList.length > 0 ? imgList[0] : null;

    return (
      <div
        key={item.Activity_id}
        style={page.listCard}
        onClick={() => { setSelectedActivity(item); setShowModal(true); }}
      >
        <div style={page.listImageContainer}>
          {previewImg ? (
            <img src={previewImg} alt={item.Name_activity} style={page.listImage} />
          ) : (
            <div style={page.listImagePlaceholder}>
              <Image size={24} color="#94a3b8" />
            </div>
          )}
        </div>
        <div style={page.listContent}>
          <h3 style={page.listTitle}>{item.Name_activity}</h3>
          <div style={page.listInfo}>
            <span style={page.listInfoItem}>
              <Calendar size={14} color="#64748b" />
              {formatDate(item.Activity_date)}
            </span>
            <span style={page.listInfoItem}>
              <MapPin size={14} color="#64748b" />
              {item.Location || "โรงเรียน"}
            </span>
            <span style={page.listInfoItem}>
              <Camera size={14} color="#64748b" />
              {item.Photographer || "คุณครู"}
            </span>
            <span style={page.listImageCount}>
              <Image size={14} color="#64748b" />
              {imgList.length} รูป
            </span>
          </div>
        </div>
        <button
          onClick={(e) => downloadAllImages(e, imgList, item.Name_activity)}
          style={page.listDownloadBtn}
        >
          <DownloadIcon size={16} color="#818cf8" />
        </button>
      </div>
    );
  };

  return (
    <div style={page.container}>
      <div style={page.wrapper}>
        {/* 🌟 ส่วนหัว */}
        <div style={page.headerSection}>
          <div style={page.headerLeft}>
            <div style={page.headerIconWrapper}>
              <Sparkles size={28} color="#818cf8" />
            </div>
            <div>
              <h1 style={page.mainTitle}>
                กิจกรรมของหนู ๆ
                <span style={page.mainTitleSub}>👶</span>
              </h1>
              <p style={page.subTitle}>
                รวมกิจกรรมสนุก ๆ ที่เด็ก ๆ ได้ทำร่วมกัน
              </p>
            </div>
          </div>
          <div style={page.statsContainer}>
            <div style={page.statItem}>
              <span style={page.statNumber}>{totalActivities}</span>
              <span style={page.statLabel}>กิจกรรม</span>
            </div>
            <div style={page.statDivider} />
            <div style={page.statItem}>
              <span style={page.statNumber}>{totalImages}</span>
              <span style={page.statLabel}>รูปภาพ</span>
            </div>
          </div>
        </div>

        {/* 🌟 ค้นหาและมุมมอง */}
        <div style={page.controlsSection}>
          <div style={page.searchContainer}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="ค้นหากิจกรรม สถานที่ หรือผู้บันทึกภาพ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={page.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={page.clearSearchBtn}
              >
                <X size={16} color="#94a3b8" />
              </button>
            )}
          </div>
          <div style={page.viewToggle}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                ...page.viewBtn,
                background: viewMode === 'grid' ? '#818cf8' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : '#64748b',
                border: viewMode === 'grid' ? 'none' : '1px solid #e2e8f0',
              }}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                ...page.viewBtn,
                background: viewMode === 'list' ? '#818cf8' : 'transparent',
                color: viewMode === 'list' ? '#fff' : '#64748b',
                border: viewMode === 'list' ? 'none' : '1px solid #e2e8f0',
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* 🌟 แสดงผล */}
        {loading ? (
          <div style={page.loadingContainer}>
            <div style={page.loadingSpinner} />
            <p style={page.loadingText}>กำลังโหลดกิจกรรม...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div style={page.emptyContainer}>
            <div style={page.emptyIcon}>📭</div>
            <p style={page.emptyText}>ไม่มีข้อมูลกิจกรรมประชาสัมพันธ์ในขณะนี้</p>
            <p style={page.emptySubText}>ลองปรับคำค้นหาหรือรอการอัปเดตจากคุณครู</p>
          </div>
        ) : (
          <div style={viewMode === 'grid' ? page.grid : page.listGrid}>
            {filteredActivities.map((item) => (
              viewMode === 'grid'
                ? <ActivityGridCard key={item.Activity_id} item={item} />
                : <ActivityListCard key={item.Activity_id} item={item} />
            ))}
          </div>
        )}

        {/* 🌟 Modal */}
        {showModal && selectedActivity && (
          <div style={modal.overlay} onClick={() => setShowModal(false)}>
            <div style={modal.box} onClick={(e) => e.stopPropagation()}>
              <div style={modal.header}>
                <div>
                  <h2 style={modal.mainTitle}>{selectedActivity.Name_activity}</h2>
                  <div style={modal.modalSubInfo}>
                    <span style={modal.modalInfoItem}>
                      <Calendar size={14} color="#94a3b8" />
                      {formatDate(selectedActivity.Activity_date)}
                    </span>
                    <span style={modal.modalInfoItem}>
                      <MapPin size={14} color="#94a3b8" />
                      {selectedActivity.Location || "โรงเรียน"}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} style={modal.closeBtn}>
                  <X size={20} />
                </button>
              </div>

              <div style={modal.galleryGrid}>
                {parseActivityImages(selectedActivity.Image).map((imgUrl, idx) => (
                  <div key={idx} style={modal.galleryItem}>
                    <img src={imgUrl} alt={`sub-img-${idx}`} style={modal.galleryImage} />
                    <button
                      onClick={() => downloadSingleImage(imgUrl, idx, selectedActivity.Name_activity)}
                      style={modal.singleDownloadBtn}
                      title="ดาวน์โหลดรูปภาพนี้"
                    >
                      <DownloadIcon size={14} color="#475569" />
                    </button>
                  </div>
                ))}
                {parseActivityImages(selectedActivity.Image).length === 0 && (
                  <div style={modal.emptyGallery}>
                    <Image size={40} color="#cbd5e1" />
                    <p style={{ color: '#94a3b8', marginTop: '8px' }}>ไม่มีรูปภาพในอัลบั้มนี้</p>
                  </div>
                )}
              </div>

              {parseActivityImages(selectedActivity.Image).length > 0 && (
                <button
                  onClick={(e) => downloadAllImages(
                    e,
                    parseActivityImages(selectedActivity.Image),
                    selectedActivity.Name_activity
                  )}
                  style={modal.downloadAllModalBtn}
                >
                  <DownloadIcon size={16} color="#fff" />
                  <span style={{ marginLeft: '8px' }}>
                    ดาวน์โหลดทั้งหมด {parseActivityImages(selectedActivity.Image).length} รูป
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        <style>{`
          @media (max-width: 1100px) {
            .parent-responsive-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
          @media (max-width: 768px) {
            .parent-responsive-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .parent-responsive-list { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 480px) {
            .parent-responsive-grid { grid-template-columns: 1fr !important; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes modalIn {
            0% { transform: scale(0.95) translateY(10px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ============================================================
// 🌟 STYLES - ใช้สีพื้นหลังเดียวกันทั้งหมด
// ============================================================

const page = {
  // 🌟 พื้นหลังสีเดียว: ฟ้าอ่อนพาสเทล
  container: {
   
    minHeight: "100vh",
    padding: "2rem 1.5rem",
    display: "flex",
    justifyContent: "center",
    color: "#334155",
    fontFamily: "'Inter', 'Kanit', 'Sukhumvit Set', sans-serif",
  },
  wrapper: {
    width: "100%",
    maxWidth: "1280px",
  },

  // 🌟 Header Section - พื้นหลังขาวโปร่งแสง
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "2rem",
    padding: "24px 28px",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  headerIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #818cf8, #6366f1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
  },
  mainTitle: {
    fontSize: "24px",
    fontWeight: "700",
    margin: 0,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  mainTitleSub: {
    fontSize: "22px",
  },
  subTitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },

  // 🌟 Stats
  statsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "rgba(248, 250, 252, 0.8)",
    borderRadius: "12px",
    padding: "8px 16px",
    border: "1px solid #e2e8f0",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "4px 8px",
  },
  statNumber: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  statDivider: {
    width: "1px",
    height: "30px",
    background: "#e2e8f0",
  },

  // 🌟 Controls
  controlsSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "1.8rem",
    flexWrap: "wrap",
  },
  searchContainer: {
    flex: 1,
    position: "relative",
    minWidth: "200px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 40px 12px 44px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  clearSearchBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggle: {
    display: "flex",
    gap: "6px",
    background: "#ffffff",
    padding: "4px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  viewBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },

  // 🌟 Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },
  listGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },

  // 🌟 Card (Grid)
  card: {
    background: "#ffffff",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    cursor: "pointer",
    position: "relative",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  imageBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(30, 41, 59, 0.75)",
    backdropFilter: "blur(8px)",
    padding: "4px 10px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    zIndex: 2,
  },
  cardImageContainer: {
    width: "100%",
    height: "170px",
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.4s ease",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
  },
  cardContent: {
    padding: "14px 16px 12px 16px",
    flex: 1,
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    margin: "0 0 8px 0",
    color: "#1e293b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    lineHeight: 1.4,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  infoText: {
    color: "#64748b",
    fontSize: "12px",
    margin: 0,
  },
  actionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "0 16px 14px 16px",
    marginTop: "auto",
  },
  downloadAllBtn: {
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#1e293b",
  },

  // 🌟 List Card
  listCard: {
    background: "#ffffff",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #e2e8f0",
  },
  listImageContainer: {
    width: "80px",
    height: "80px",
    borderRadius: "10px",
    overflow: "hidden",
    flexShrink: 0,
    background: "#f1f5f9",
  },
  listImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  listImagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    fontSize: "15px",
    fontWeight: "600",
    margin: "0 0 6px 0",
    color: "#1e293b",
  },
  listInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
  },
  listInfoItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#64748b",
  },
  listImageCount: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "2px 10px",
    borderRadius: "12px",
  },
  listDownloadBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // 🌟 Loading & Empty
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 0",
    gap: "16px",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #818cf8",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: "14px",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "4rem 0",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#64748b",
    margin: 0,
  },
  emptySubText: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: "4px 0 0 0",
  },
};

const modal = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    backdropFilter: "blur(8px)",
    padding: "20px",
  },
  box: {
    background: "#ffffff",
    padding: "28px",
    borderRadius: "20px",
    width: "560px",
    maxWidth: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
    animation: "modalIn 0.3s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "14px",
  },
  mainTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: 0,
    color: "#1e293b",
  },
  modalSubInfo: {
    display: "flex",
    gap: "16px",
    marginTop: "6px",
    flexWrap: "wrap",
  },
  modalInfoItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    transition: "all 0.2s ease",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: "4px",
  },
  galleryItem: {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
    height: 0,
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
  },
  galleryImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  singleDownloadBtn: {
    position: "absolute",
    bottom: "6px",
    right: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "1px solid #e2e8f0",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.2s ease",
  },
  emptyGallery: {
    gridColumn: "span 4",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
    color: "#94a3b8",
  },
  downloadAllModalBtn: {
    marginTop: "16px",
    padding: "10px 20px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #818cf8, #6366f1)",
    color: "#ffffff",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
  },
};

export default ActivityP;