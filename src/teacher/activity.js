import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Image,
  Calendar,
  MapPin,
  Camera,
  Search,
  X,
  Loader2,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [nameActivity, setNameActivity] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [location, setLocation] = useState("");
  const [activityDate, setActivityDate] = useState("");

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [galleryTitle, setGalleryTitle] = useState("");
  const [activeGalleryImages, setActiveGalleryImages] = useState(null);

  const [lightBoxImage, setLightBoxImage] = useState(null);
  const [currentLightBoxIndex, setCurrentLightBoxIndex] = useState(0);

  // ----------------------------------------------------
  // 1. ดึงข้อมูลผู้ใช้งานและล็อกห้องเรียนจาก localStorage
  // ----------------------------------------------------
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const defaultClassroom = storedUser.Class_level || storedUser.class_level || "อนุบาล1";
  const currentUserId = localStorage.getItem("user_id") || storedUser.User_id || storedUser.id || 1;

  // ตั้งค่าเริ่มต้นให้เป็นห้องของครูผู้ใช้งานทันที
  const [classroomId, setClassroomId] = useState(defaultClassroom);

  const API_URL = "http://127.0.0.1:3001/activities";

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?user_id=${currentUserId}`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
      });
      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลไม่สำเร็จ!", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const objectUrls = files.map(file => URL.createObjectURL(file));
      setPreviewImages(objectUrls);

      const resizeAndCompress = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;

              const MAX_WIDTH = 1024;
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);

              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
              resolve(compressedBase64);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      };

      const compressPromises = files.map(file => resizeAndCompress(file));
      Promise.all(compressPromises).then(base64Strings => {
        setImages(base64Strings);
      });
    }
  };

  // ----------------------------------------------------
  // 2. ปรับปรุงระบบ Submit ให้ล็อกห้องเรียนอัตโนมัติ
  // ----------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameActivity) return alert("กรุณากรอกชื่อกิจกรรม");

    let finalImages = images.length > 0 ? images : (editId && previewImages.length > 0 ? previewImages : null);

    // 💡 ลบ Classroom_id ออกจากการส่งข้อมูล เพราะ Backend จะดึงจากตาราง users ให้อัตโนมัติ
    const requestData = {
      Name_activity: nameActivity,
      Photographer: photographer,
      Location: location,
      Activity_date: activityDate ? activityDate : null,
      User_id: currentUserId,
      Image: finalImages ? JSON.stringify(finalImages) : null
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, requestData);
        alert("แก้ไขข้อมูลกิจกรรมสำเร็จ");
      } else {
        await axios.post(API_URL, requestData);
        alert("เพิ่มข้อมูลกิจกรรมสำเร็จ");
      }
      clearForm();
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchActivities();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditId(item.Activity_id);
    setNameActivity(item.Name_activity || "");
    setPhotographer(item.Photographer || "");
    setLocation(item.Location || "");
    setActivityDate(item.Activity_date ? item.Activity_date.split("T")[0] : "");
    setClassroomId(item.Classroom_id || defaultClassroom);
    setImages([]);

    let oldImages = [];
    const rawImage = item.Image || item.Images;

    if (rawImage) {
      if (typeof rawImage === "string") {
        if (rawImage.startsWith("[")) {
          try { oldImages = JSON.parse(rawImage); } catch (e) { oldImages = [rawImage]; }
        } else { oldImages = [rawImage]; }
      } else if (Array.isArray(rawImage)) { oldImages = rawImage; }
    }
    setPreviewImages(oldImages);
    setShowForm(true);
  };

  const clearForm = () => {
    setNameActivity("");
    setPhotographer("");
    setLocation("");
    setActivityDate("");
    setClassroomId(defaultClassroom);
    setImages([]);
    setPreviewImages([]);
    setEditId(null);
    setShowForm(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "ไม่ระบุวันเวลา";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredActivities = activities.filter((item) => {
    return (
      item.Name_activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <Sparkles size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>จัดการข้อมูลกิจกรรม 🏫</h1>
              <p style={styles.subTitle}>
                ระบบจัดการภาพและกิจกรรมทั้งหมด (ทั้งหมด <span style={styles.activityCount}>{activities.length}</span> กิจกรรม)
              </p>
            </div>
          </div>
          <button
            onClick={() => { if (showForm) clearForm(); else setShowForm(true); }}
            style={showForm ? styles.btnDanger : styles.btnPrimary}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "ปิดฟอร์มบันทึก" : "เพิ่มกิจกรรมใหม่"}
          </button>
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

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modalOverlay}>
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  <span style={styles.titleDot}></span>
                  {editId ? "แก้ไขข้อมูลกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
                </h2>
                <button type="button" onClick={clearForm} style={styles.closeBtn}>
                  <X size={18} />
                </button>
              </div>

              {/* Upload Zone */}
              <div style={styles.uploadZone}>
                <label style={styles.uploadLabel}>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />
                  <div style={styles.uploadIconContainer}>
                    <Upload size={20} color="#4A90D9" />
                    <span style={styles.uploadText}>อัปโหลดรูป</span>
                  </div>
                </label>

                <div style={styles.previewContainer}>
                  {previewImages.map((src, index) => (
                    <div key={index} style={styles.previewBox}>
                      <img src={src} alt={`preview-${index}`} style={styles.coverImg} />
                    </div>
                  ))}
                  {previewImages.length === 0 && <span style={styles.emptyItalic}>ยังไม่ได้เลือกรูปภาพ</span>}
                </div>
              </div>

              {/* Form Inputs */}
              <div style={styles.formGroupStack}>
                {/* 3. แสดงห้องเรียนที่ถูกล็อกไว้จากระบบลงทะเบียน (แสดงเฉยๆ ไม่ส่งค่าไปหลังบ้าน) */}
                <div>
                  <label style={styles.inputLabel}>ห้องเรียนที่บันทึกกิจกรรม (ล็อกตามสิทธิ์ผู้ใช้งาน)</label>
                  <input
                    type="text"
                    value={`ชั้น ${classroomId || defaultClassroom}`}
                    disabled
                    style={{
                      ...styles.textInput,
                      backgroundColor: "#F1F5F9",
                      color: "#64748B",
                      cursor: "not-allowed",
                      fontWeight: "600"
                    }}
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>ชื่อกิจกรรม</label>
                  <input type="text" placeholder="กรอกชื่อกิจกรรม" value={nameActivity} onChange={(e) => setNameActivity(e.target.value)} style={styles.textInput} />
                </div>

                <div>
                  <label style={styles.inputLabel}>ผู้บันทึกภาพ</label>
                  <input type="text" placeholder="กรอกชื่อผู้บันทึกภาพ" value={photographer} onChange={(e) => setPhotographer(e.target.value)} style={styles.textInput} />
                </div>

                <div style={styles.gridTwoColumns}>
                  <div>
                    <label style={styles.inputLabel}>วันที่จัดกิจกรรม</label>
                    <input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} style={styles.textInput} />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>สถานที่</label>
                    <input type="text" placeholder="กรอกสถานที่" value={location} onChange={(e) => setLocation(e.target.value)} style={styles.textInput} />
                  </div>
                </div>
              </div>

              <button type="submit" style={styles.btnSuccessFull}>
                💾 บันทึกข้อมูลกิจกรรม
              </button>
            </form>
          </div>
        )}

        {/* Activity Grid */}
        <div style={styles.activityGrid}>
          {filteredActivities.length === 0 ? (
            <div style={styles.noDataBox}>
              <FolderOpen size={56} color="#CBD5E1" />
              <p style={styles.noDataText}>ไม่พบข้อมูลกิจกรรม</p>
              <p style={styles.noDataSub}>ลองเปลี่ยนคำค้นหาหรือกดเพิ่มกิจกรรมใหม่</p>
            </div>
          ) : (
            filteredActivities.map((item) => {
              let itemImages = [];
              const targetField = item.Image || item.Images;

              if (targetField) {
                if (typeof targetField === "string") {
                  if (targetField.startsWith("[")) {
                    try { itemImages = JSON.parse(targetField); } catch (e) { itemImages = [targetField]; }
                  } else { itemImages = [targetField]; }
                } else if (Array.isArray(targetField)) { itemImages = targetField; }
              }

              return (
                <div key={item.Activity_id} style={styles.activityCard}>

                  {/* Image Cover */}
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

                  {/* Information Details */}
                  <div style={styles.cardBody}>
                    <h3 style={styles.cardTitle} title={item.Name_activity}>
                      {item.Name_activity || "ไม่มีชื่อกิจกรรม"}
                    </h3>
                    <div style={styles.cardDetails}>
                      <div style={styles.cardDetailItem}>
                        <Camera size={14} color="#94A3B8" />
                        <span>{item.Photographer || "ไม่ระบุ"}</span>
                      </div>
                      <div style={styles.cardDetailItem}>
                        <Calendar size={14} color="#94A3B8" />
                        <span>{formatDate(item.Activity_date)}</span>
                      </div>
                      <div style={styles.cardDetailItem}>
                        <MapPin size={14} color="#94A3B8" />
                        <span>{item.Location || "ไม่ระบุ"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.cardActions}>
                    <button onClick={() => handleEdit(item)} style={styles.btnEdit}>
                      <Edit size={14} />
                      แก้ไข
                    </button>
                    <button onClick={() => handleDelete(item.Activity_id)} style={styles.btnDelete}>
                      <Trash2 size={14} />
                      ลบ
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
                    คลังภาพถ่ายรวมทั้งหมด ({activeGalleryImages.length} รูป)
                  </span>
                </div>
                <button onClick={() => setActiveGalleryImages(null)} style={styles.closeBtn}>
                  <X size={18} />
                </button>
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
                    <img src={imgSrc} alt={`gallery-item-${idx}`} style={styles.coverImg} />
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
              <button onClick={() => setLightBoxImage(null)} style={styles.lightboxCloseBtn}>
                <X size={24} />
              </button>

              <div style={styles.lightboxMainRow}>
                {currentLightBoxIndex > 0 ? (
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
                ) : <div style={{ width: "48px" }} />}

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
                ) : <div style={{ width: "48px" }} />}
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
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 2px 6px rgba(74, 144, 217, 0.2)',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  btnDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarbun', system-ui, sans-serif",
  },
  btnEdit: {
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
  btnDelete: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  btnSuccessFull: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '24px',
    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
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
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
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
    flex: 1,
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
  modalForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    padding: '24px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    boxSizing: 'border-box',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  titleDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#4A90D9',
    borderRadius: '50%',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadZone: {
    display: 'flex',
    alignItems: 'center',
    border: '1px dashed #CBD5E1',
    borderRadius: '12px',
    padding: '14px',
    marginBottom: '20px',
    backgroundColor: '#F8FAFC',
  },
  uploadLabel: {
    cursor: 'pointer',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 14px',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 0,
  },
  uploadIconContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  uploadText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#4A90D9',
  },
  previewContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: '12px',
    overflowY: 'auto',
    maxHeight: '70px',
  },
  previewBox: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  emptyItalic: {
    fontSize: '12px',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  formGroupStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#475569',
    marginBottom: '6px',
  },
  textInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
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
  },
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
  lightboxCloseBtn: {
    position: 'absolute',
    top: '-48px',
    right: 0,
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
};

export default Activity;