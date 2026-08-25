import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Search,
  Image,
  Calendar,
  MapPin,
  Camera,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Loader2,
  FolderOpen,
  ImagePlus,
  Sparkles,
  Clock
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
  const [viewMode, setViewMode] = useState("grid");

  const [galleryTitle, setGalleryTitle] = useState("");
  const [activeGalleryImages, setActiveGalleryImages] = useState(null);

  const [lightBoxImage, setLightBoxImage] = useState(null);
  const [currentLightBoxIndex, setCurrentLightBoxIndex] = useState(0);

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
      console.error("ดึงข้อมูลไม่สำเร็จ! ตรวจสอบการเชื่อมต่อ API:", err);
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
            const img = new Image();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameActivity) return alert("กรุณากรอกชื่อกิจกรรม");

    let finalImages = images.length > 0 ? images : (editId && previewImages.length > 0 ? previewImages : null);

    const requestData = {
      Name_activity: nameActivity,
      Photographer: photographer,
      Location: location,
      Activity_date: activityDate ? activityDate : null,
      User_id: 1,
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

  const formatDateThai = (dateStr) => {
    if (!dateStr) return "ไม่ระบุ";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const filteredActivities = activities.filter((item) => {
    return (
      item.Name_activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
              <h1 style={styles.mainTitle}>จัดการกิจกรรม</h1>
              <p style={styles.subTitle}>
                <span style={styles.activityCount}>{activities.length}</span> กิจกรรมทั้งหมด
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
            <button
              onClick={() => { if (showForm) clearForm(); else setShowForm(true); }}
              style={{
                ...styles.btnPrimary,
                backgroundColor: showForm ? "#E74C3C" : "#4A90D9"
              }}
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? "ปิดฟอร์ม" : "เพิ่มกิจกรรม"}
            </button>
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

        {/* Form Modal */}
        {showForm && (
          <div style={styles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) clearForm();
          }}>
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
                    <ImagePlus size={24} color="#4A90D9" />
                    <span style={styles.uploadText}>เลือกรูป</span>
                  </div>
                </label>

                <div style={styles.previewContainer}>
                  {previewImages.map((src, index) => (
                    <div key={index} style={styles.previewBox}>
                      <img src={src} alt={`preview-${index}`} style={styles.coverImg} />
                    </div>
                  ))}
                  {previewImages.length === 0 && (
                    <span style={styles.emptyItalic}>ยังไม่มีการเลือกรูปภาพ</span>
                  )}
                </div>
              </div>

              {/* Form Inputs */}
              <div style={styles.formGroupStack}>
                <div>
                  <label style={styles.inputLabel}>ชื่อกิจกรรม *</label>
                  <input
                    type="text"
                    placeholder="กรอกชื่อกิจกรรม"
                    value={nameActivity}
                    onChange={(e) => setNameActivity(e.target.value)}
                    style={styles.textInput}
                    required
                  />
                </div>

                <div>
                  <label style={styles.inputLabel}>
                    <Camera size={14} style={styles.labelIcon} />
                    ผู้บันทึกภาพ
                  </label>
                  <input
                    type="text"
                    placeholder="กรอกชื่อผู้บันทึกภาพ"
                    value={photographer}
                    onChange={(e) => setPhotographer(e.target.value)}
                    style={styles.textInput}
                  />
                </div>

                <div style={styles.gridTwoColumns}>
                  <div>
                    <label style={styles.inputLabel}>
                      <Calendar size={14} style={styles.labelIcon} />
                      วันที่จัดกิจกรรม
                    </label>
                    <input
                      type="date"
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>
                      <MapPin size={14} style={styles.labelIcon} />
                      สถานที่
                    </label>
                    <input
                      type="text"
                      placeholder="กรอกสถานที่"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={styles.textInput}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" style={styles.submitBtn}>
                <Image size={18} />
                {editId ? "อัปเดตข้อมูล" : "บันทึกกิจกรรม"}
              </button>
            </form>
          </div>
        )}

        {/* Activity Grid / List */}
        <div style={{
          ...styles.activityContainer,
          gridTemplateColumns: viewMode === "grid" ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr'
        }}>
          {filteredActivities.length === 0 ? (
            <div style={styles.noDataBox}>
              <FolderOpen size={56} color="#CBD5E1" />
              <p style={styles.noDataText}>ไม่พบข้อมูลกิจกรรม</p>
              <p style={styles.noDataSub}>ลองเปลี่ยนคำค้นหาหรือเพิ่มกิจกรรมใหม่</p>
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
                        <button onClick={() => handleEdit(item)} style={styles.listEditBtn}>
                          <Edit2 size={14} />
                          แก้ไข
                        </button>
                        <button onClick={() => handleDelete(item.Activity_id)} style={styles.listDeleteBtn}>
                          <Trash2 size={14} />
                          ลบ
                        </button>
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
                    <button onClick={() => handleEdit(item)} style={styles.editBtn}>
                      <Edit2 size={14} />
                      แก้ไข
                    </button>
                    <button onClick={() => handleDelete(item.Activity_id)} style={styles.deleteBtn}>
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
                    {activeGalleryImages.length} รูปภาพ
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
                    <img src={imgSrc} alt={`gallery-${idx}`} style={styles.coverImg} />
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
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
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
  editBtn: {
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
  deleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px',
    backgroundColor: '#FDEDEC',
    color: '#E74C3C',
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
  listEditBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
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
  listDeleteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    backgroundColor: '#FDEDEC',
    color: '#E74C3C',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
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

  // Modal
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
    maxWidth: '520px',
    padding: '28px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
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
    width: '10px',
    height: '10px',
    backgroundColor: '#4A90D9',
    borderRadius: '50%',
    display: 'inline-block',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },

  uploadZone: {
    display: 'flex',
    alignItems: 'center',
    border: '2px dashed #4A90D9',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    backgroundColor: '#F0F7FF',
    gap: '16px',
  },
  uploadLabel: {
    cursor: 'pointer',
    flexShrink: 0,
  },
  uploadIconContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
  },
  uploadText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#4A90D9',
    marginTop: '2px',
  },
  previewContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    flex: 1,
    maxHeight: '80px',
    overflowY: 'auto',
    paddingRight: '4px',
    alignItems: 'center',
  },
  previewBox: {
    width: '56px',
    height: '56px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  emptyItalic: {
    fontSize: '13px',
    color: '#94A3B8',
    fontStyle: 'italic',
  },

  formGroupStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '6px',
  },
  labelIcon: {
    color: '#94A3B8',
  },
  textInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#FAFBFC',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxSizing: 'border-box',
  },
  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '20px',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  // Gallery
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
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    cursor: 'pointer',
    border: '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
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
  lightboxCloseBtn: {
    position: 'absolute',
    top: '-56px',
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
    .grid-two-columns {
      grid-template-columns: 1fr !important;
    }
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
    .header-actions {
      width: 100% !important;
      justify-content: flex-end !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Activity;