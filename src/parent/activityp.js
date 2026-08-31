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
  Loader2,
  FolderOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";

// 🌟 คอมโพเนนต์ไอคอนดาวน์โหลด
const DownloadIcon = ({ size = 16, color = "currentColor" }) => (
  <Download size={size} color={color} strokeWidth={2} />
);

function ActivityP() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  // State สำหรับ Modal แสดงรูปภาพในอัลบั้ม (Gallery)
  const [galleryTitle, setGalleryTitle] = useState("");
  const [activeGalleryImages, setActiveGalleryImages] = useState(null);

  // State สำหรับ LightBox แสดงรูปขนาดใหญ่
  const [lightBoxImage, setLightBoxImage] = useState(null);
  const [currentLightBoxIndex, setCurrentLightBoxIndex] = useState(0);
  const [classroomOptions, setClassroomOptions] = useState([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState("");

  const API_URL = "http://127.0.0.1:3001/activities";

  // ✅ useEffect แก้ไขใหม่: ดึงข้อมูลจาก API จริง
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = localStorage.getItem("user_id") || storedUser.User_id || storedUser.id;

        if (!userId) {
          console.error("ไม่พบ user_id");
          setLoading(false);
          return;
        }

        // ดึงข้อมูลผู้ใช้จาก API
        const userResponse = await axios.get(`http://127.0.0.1:3001/users/${userId}`);
        const userData = userResponse.data;

        // ดึงข้อมูลนักเรียนจาก API
        const studentResponse = await axios.get(`http://127.0.0.1:3001/api/students?userId=${userId}`);
        const students = studentResponse.data || [];

        // สร้างรายชื่อห้องจากนักเรียน
        let classroomList = [...new Set(students.map(s => s.Class_level).filter(Boolean))];
        
        // ถ้าไม่มีข้อมูลนักเรียน ให้ใช้ Class_level ของผู้ใช้
        if (classroomList.length === 0 && userData.Class_level) {
          classroomList.push(userData.Class_level);
        }

        // ถ้ายังไม่มีข้อมูลเลย ให้ใช้ค่าเริ่มต้น
        if (classroomList.length === 0) {
          classroomList.push("อนุบาล2 ห้องปกติ");
        }

        console.log("📌 ห้องที่พบ:", classroomList);
        
        setClassroomOptions(classroomList);
        
        // เลือกห้องแรกเป็นค่าเริ่มต้น
        setSelectedClassrooms(classroomList[0]);
        fetchActivities(classroomList[0]);
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        // ใช้ค่าเริ่มต้น
        const fallbackClassrooms = ["อนุบาล2 ห้องปกติ"];
        setClassroomOptions(fallbackClassrooms);
        setSelectedClassrooms(fallbackClassrooms[0]);
        fetchActivities(fallbackClassrooms[0]);
      }
    };

    fetchUserData();
  }, []);

  // ✅ ฟังก์ชัน fetchActivities
  const fetchActivities = async (classroomsParam = "") => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const parentId = localStorage.getItem("user_id") || storedUser.User_id || storedUser.id;

      if (!parentId) {
        console.error("ไม่พบ user_id ของผู้ใช้งาน กรุณา Login ใหม่");
        setLoading(false);
        return;
      }

      const classroomsQuery = classroomsParam ? `&classrooms=${encodeURIComponent(classroomsParam)}` : "";

      const res = await axios.get(`${API_URL}?user_id=${parentId}${classroomsQuery}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลกิจกรรมฝั่งผู้ปกครองไม่สำเร็จ:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ฟังก์ชันรีเฟรชข้อมูลห้องเรียน
  const refreshClassrooms = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = localStorage.getItem("user_id") || storedUser.User_id || storedUser.id;

      if (!userId) {
        console.error("ไม่พบ user_id");
        return;
      }

      // ดึงข้อมูลนักเรียนล่าสุด
      const studentResponse = await axios.get(`http://127.0.0.1:3001/api/students?userId=${userId}`);
      const students = studentResponse.data || [];

      // สร้างรายชื่อห้อง
      let classroomList = [...new Set(students.map(s => s.Class_level).filter(Boolean))];
      
      if (classroomList.length === 0) {
        // ถ้าไม่มีนักเรียน ให้ดึง Class_level ของผู้ใช้
        const userResponse = await axios.get(`http://127.0.0.1:3001/users/${userId}`);
        if (userResponse.data.Class_level) {
          classroomList.push(userResponse.data.Class_level);
        } else {
          classroomList.push("อนุบาล2 ห้องปกติ");
        }
      }

      console.log("🔄 รีเฟรชห้องเรียน:", classroomList);
      
      setClassroomOptions(classroomList);
      if (classroomList.length > 0) {
        setSelectedClassrooms(classroomList[0]);
        fetchActivities(classroomList[0]);
      }
      
    } catch (error) {
      console.error("Error refreshing classrooms:", error);
    }
  };

  const getImageArray = (item) => {
    let itemImages = [];
    const targetField = item.Image || item.Images;

    if (targetField) {
      if (typeof targetField === "string") {
        if (targetField.startsWith("[")) {
          try { itemImages = JSON.parse(targetField); } catch (e) { itemImages = [targetField]; }
        } else { itemImages = [targetField]; }
      } else if (Array.isArray(targetField)) { itemImages = targetField; }
    }
    return itemImages;
  };

  const downloadSingleImage = (e, base64Data, index, activityName) => {
    e?.stopPropagation();
    if (!base64Data) return alert("ไม่พบข้อมูลรูปภาพ");
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = `กิจกรรม_${activityName || "school"}_รูปที่_${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = (e, imagesArray, activityName) => {
    e?.stopPropagation();
    if (!imagesArray || imagesArray.length === 0) return alert("ไม่มีรูปภาพให้ดาวน์โหลด");

    if (window.confirm(`คุณต้องการดาวน์โหลดรูปภาพทั้งหมดจำนวน ${imagesArray.length} รูปใช่หรือไม่?`)) {
      imagesArray.forEach((imgData, idx) => {
        setTimeout(() => {
          downloadSingleImage(null, imgData, idx, activityName);
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
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลกิจกรรม...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          {/* ✅ Dropdown เลือกห้องเรียน แก้ไขแล้ว */}
          {classroomOptions.length > 0 && (
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                เลือกห้องเรียนของบุตรหลาน:
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={selectedClassrooms}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClassrooms(value);
                    fetchActivities(value);
                  }}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    backgroundColor: '#FFFFFF',
                    minWidth: '200px',
                    outline: 'none',
                    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
                  }}
                >
                  <option value="">เลือกทั้งหมด</option>
                  {classroomOptions.map((cls, idx) => (
                    <option key={idx} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                
                {/* ✅ ปุ่มรีเฟรช */}
                <button
                  onClick={refreshClassrooms}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#4A90D9',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <RefreshCw size={16} />
                  รีเฟรช
                </button>
              </div>
            </div>
          )}
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <Sparkles size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>กิจกรรมของนักเรียน 👶</h1>
              <p style={styles.subTitle}>
                รวมกิจกรรมสนุก ๆ ที่เด็ก ๆ ได้ทำร่วมกัน (ทั้งหมด <span style={styles.activityCount}>{activities.length}</span> กิจกรรม)
              </p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <div style={styles.viewToggle}>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  ...styles.viewBtn,
                  backgroundColor: viewMode === "grid" ? "#4A90D9" : "transparent",
                  color: viewMode === "grid" ? "#FFFFFF" : "#64748B"
                }}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  ...styles.viewBtn,
                  backgroundColor: viewMode === "list" ? "#4A90D9" : "transparent",
                  color: viewMode === "list" ? "#FFFFFF" : "#64748B"
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchWrapper}>
          <Search size={18} color="#94A3B8" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="ค้นหากิจกรรม ชื่อสถานที่ หรือผู้บันทึกภาพ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Activity Grid / List */}
        <div style={{
          ...styles.activityContainer,
          gridTemplateColumns: viewMode === "grid" ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr'
        }}>
          {filteredActivities.length === 0 ? (
            <div style={styles.noDataBox}>
              <FolderOpen size={56} color="#CBD5E1" />
              <p style={styles.noDataText}>ไม่พบข้อมูลกิจกรรม</p>
              <p style={styles.noDataSub}>ลองเปลี่ยนคำค้นหาหรือรอการอัปเดตกิจกรรมใหม่</p>
            </div>
          ) : (
            filteredActivities.map((item) => {
              const itemImages = getImageArray(item);
              const displayDate = formatDate(item.Activity_date);

              if (viewMode === "list") {
                return (
                  <div key={item.Activity_id} style={styles.listCard}>
                    <div style={styles.listImage}>
                      {itemImages.length > 0 ? (
                        <img src={itemImages[0]} alt={item.Name_activity} style={styles.coverImg} />
                      ) : (
                        <div style={styles.listNoImage}>
                          <Image size={24} color="#CBD5E1" />
                        </div>
                      )}
                    </div>
                    <div style={styles.listContent}>
                      <div>
                        <h3 style={styles.listTitle}>{item.Name_activity}</h3>
                        <div style={styles.listMeta}>
                          <span style={styles.listMetaItem}>
                            <Camera size={14} />
                            {item.Photographer || "ไม่ระบุ"}
                          </span>
                          <span style={styles.listMetaItem}>
                            <Calendar size={14} />
                            {displayDate}
                          </span>
                          <span style={styles.listMetaItem}>
                            <MapPin size={14} />
                            {item.Location || "ไม่ระบุ"}
                          </span>
                          {itemImages.length > 0 && (
                            <span style={styles.listMetaItem}>
                              <Image size={14} />
                              {itemImages.length} รูป
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={styles.listActions}>
                        {itemImages.length > 0 && (
                          <button
                            onClick={(e) => downloadAllImages(e, itemImages, item.Name_activity)}
                            style={styles.downloadBtn}
                          >
                            <DownloadIcon size={14} color="#4A90D9" />
                            ดาวน์โหลด ({itemImages.length})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.Activity_id} style={styles.activityCard}>
                  <div
                    style={{
                      ...styles.cardImageZone,
                      cursor: itemImages.length > 0 ? "pointer" : "default"
                    }}
                    onClick={() => {
                      if (itemImages.length > 0) {
                        setGalleryTitle(item.Name_activity || "คลังรูปภาพกิจกรรม");
                        setActiveGalleryImages(itemImages);
                      }
                    }}
                  >
                    {itemImages.length > 0 && itemImages[0] ? (
                      <div style={styles.cardImageWrapper}>
                        <img src={itemImages[0]} alt={item.Name_activity} style={styles.coverImg} />
                        {itemImages.length > 1 && (
                          <div style={styles.imageBadge}>
                            <Image size={12} />
                            +{itemImages.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={styles.noImageZone}>
                        <Image size={32} color="#CBD5E1" />
                        <span style={styles.noImageText}>ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle}>{item.Name_activity || "ไม่มีชื่อกิจกรรม"}</h3>
                    <div style={styles.cardDetails}>
                      <div style={styles.cardDetailItem}>
                        <Camera size={14} color="#94A3B8" />
                        <span>{item.Photographer || "ไม่ระบุ"}</span>
                      </div>
                      <div style={styles.cardDetailItem}>
                        <Calendar size={14} color="#94A3B8" />
                        <span>{displayDate}</span>
                      </div>
                      <div style={styles.cardDetailItem}>
                        <MapPin size={14} color="#94A3B8" />
                        <span>{item.Location || "ไม่ระบุ"}</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={(e) => downloadAllImages(e, itemImages, item.Name_activity)}
                      style={styles.downloadBtnFull}
                    >
                      <DownloadIcon size={14} color="#4A90D9" />
                      ดาวน์โหลดรูปทั้งหมด ({itemImages.length})
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Gallery Modal */}
        {activeGalleryImages && activeGalleryImages.length > 0 && (
          <div style={styles.modalOverlay} onClick={() => setActiveGalleryImages(null)}>
            <div style={styles.galleryContainer} onClick={(e) => e.stopPropagation()}>
              <div style={styles.galleryHeader}>
                <div>
                  <h2 style={styles.galleryTitle}>{galleryTitle}</h2>
                  <span style={styles.gallerySub}>
                    <Image size={14} />
                    {activeGalleryImages.length} รูปภาพ
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={(e) => downloadAllImages(e, activeGalleryImages, galleryTitle)}
                    style={styles.downloadBtn}
                  >
                    <DownloadIcon size={14} color="#4A90D9" />
                    ดาวน์โหลดทั้งหมด
                  </button>
                  <button onClick={() => setActiveGalleryImages(null)} style={styles.closeBtn}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div style={styles.galleryGrid}>
                {activeGalleryImages.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    style={styles.galleryItemBox}
                    onClick={() => {
                      setLightBoxImage(imgSrc);
                      setCurrentLightBoxIndex(idx);
                    }}
                  >
                    <img src={imgSrc} alt={`gallery-${idx}`} style={styles.coverImg} />
                    <button
                      onClick={(e) => downloadSingleImage(e, imgSrc, idx, galleryTitle)}
                      style={styles.singleDownloadBtn}
                      title="ดาวน์โหลดรูปภาพนี้"
                    >
                      <DownloadIcon size={12} color="#1E293B" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LightBox Modal */}
        {lightBoxImage && (
          <div style={styles.lightboxOverlay} onClick={() => setLightBoxImage(null)}>
            <div style={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.lightboxHeaderActions}>
                <button
                  onClick={(e) => downloadSingleImage(e, lightBoxImage, currentLightBoxIndex, galleryTitle)}
                  style={styles.lightboxDownloadBtn}
                >
                  <DownloadIcon size={16} color="#FFFFFF" />
                  ดาวน์โหลดรูปนี้
                </button>
                <button onClick={() => setLightBoxImage(null)} style={styles.lightboxCloseBtn}>
                  <X size={24} />
                </button>
              </div>

              <div style={styles.lightboxMainRow}>
                {currentLightBoxIndex > 0 && (
                  <button
                    onClick={() => {
                      const nextIndex = currentLightBoxIndex - 1;
                      setCurrentLightBoxIndex(nextIndex);
                      setLightBoxImage(activeGalleryImages[nextIndex]);
                    }}
                    style={styles.arrowBtn}
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                {currentLightBoxIndex === 0 && <div style={{ width: "48px" }} />}

                <div style={styles.lightboxImgContainer}>
                  <img src={lightBoxImage} alt="ขยายใหญ่" style={styles.lightboxImg} />
                </div>

                {currentLightBoxIndex < activeGalleryImages.length - 1 ? (
                  <button
                    onClick={() => {
                      const nextIndex = currentLightBoxIndex + 1;
                      setCurrentLightBoxIndex(nextIndex);
                      setLightBoxImage(activeGalleryImages[nextIndex]);
                    }}
                    style={styles.arrowBtn}
                  >
                    <ChevronRight size={24} />
                  </button>
                ) : (
                  <div style={{ width: "48px" }} />
                )}
              </div>

              <div style={styles.lightboxCounter}>
                {currentLightBoxIndex + 1} / {activeGalleryImages.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// STYLES (ธีม สไตล์ เดียวกับฝั่งครูทุกประการ)
// ============================================================

const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#4A90D9',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '16px',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.25)',
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  },
  subTitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  activityCount: {
    fontWeight: '700',
    color: '#4A90D9',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: '#F1F5F9',
    borderRadius: '10px',
    padding: '4px',
    gap: '2px',
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  // Search
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 44px 12px 44px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
  },

  // Activity Container
  activityContainer: {
    display: 'grid',
    gap: '20px',
  },

  // Activity Card (Grid)
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  cardImageZone: {
    width: '100%',
    height: '200px',
    backgroundColor: '#F8FAFC',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  coverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageBadge: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
  },
  noImageZone: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  noImageText: {
    fontSize: '12px',
    color: '#94A3B8',
  },
  cardBody: {
    padding: '16px 18px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 10px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  cardDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#64748B',
  },
  cardActions: {
    display: 'flex',
    padding: '12px 18px 18px',
    gap: '10px',
  },

  // ปุ่มดาวน์โหลดสำหรับฝั่งผู้ปกครอง
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  downloadBtnFull: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  // List View
  listCard: {
    display: 'flex',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  listImage: {
    width: '160px',
    minHeight: '120px',
    backgroundColor: '#F8FAFC',
    flexShrink: 0,
    overflow: 'hidden',
  },
  listNoImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  listTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 6px 0',
  },
  listMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  listMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#64748B',
  },
  listActions: {
    display: 'flex',
    gap: '8px',
  },

  // No Data
  noDataBox: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
  },
  noDataText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
    margin: '16px 0 4px 0',
  },
  noDataSub: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },

  // Modal Header Close Btn
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },

  // Gallery
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    backdropFilter: 'blur(4px)',
  },
  galleryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '640px',
    padding: '24px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  galleryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  galleryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
  },
  gallerySub: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#94A3B8',
    marginTop: '2px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  galleryItemBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    cursor: 'pointer',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
  },
  singleDownloadBtn: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid #E2E8F0',
    borderRadius: '50%',
    width: '26px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },

  // Lightbox
  lightboxOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11000,
    padding: '16px',
  },
  lightboxContent: {
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  lightboxHeaderActions: {
    position: 'absolute',
    top: '-56px',
    right: 0,
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  lightboxDownloadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: '#FFFFFF',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  lightboxCloseBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#FFFFFF',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  lightboxMainRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    gap: '16px',
  },
  arrowBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  lightboxImgContainer: {
    flex: 1,
    height: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lightboxImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  lightboxCounter: {
    marginTop: '20px',
    padding: '6px 18px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
  },
};

// Global CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .list-image {
      width: 100px !important;
      min-height: 80px !important;
    }
    .list-content {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .list-actions {
      justify-content: flex-start !important;
    }
    .gallery-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (max-width: 480px) {
    .gallery-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default ActivityP;