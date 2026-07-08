import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const API_URL = "http://127.0.0.1:3001/activities";

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
      });
      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลไม่สำเร็จ! ตรวจสอบการเชื่อมต่อ API:", err);
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

  const filteredActivities = activities.filter((item) => {
    return (
      item.Name_activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "16px", width: "100%" }}>
          <div>
            <h2 style={{ margin: 10, color: '#0369a1' }}>ข้อมูลกิจกรรม</h2>

          </div>
          <button
            onClick={() => { if (showForm) clearForm(); else setShowForm(true); }}
            style={showForm ? { ...styles.btn, ...styles.btnDanger } : { ...styles.btn, ...styles.btnPrimary }}
          >
            {showForm ? "✕ ปิดฟอร์มบันทึก" : "+ เพิ่มกิจกรรมใหม่"}
          </button>
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
                <button type="button" onClick={clearForm} style={styles.closeBtn}>✕</button>
              </div>

              {/* Upload Zone */}
              <div style={styles.uploadZone}>
                <label style={styles.uploadLabel}>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />
                  <div style={styles.uploadIconContainer}>
                    <svg width="20" height="20" fill="none" stroke="#0284c7" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span style={styles.uploadText}>รูปภาพ</span>
                  </div>
                </label>

                <div style={styles.previewContainer}>
                  {previewImages.map((src, index) => (
                    <div key={index} style={styles.previewBox}>
                      <img src={src} alt={`preview-${index}`} style={styles.coverImg} />
                    </div>
                  ))}
                  {previewImages.length === 0 && <span style={styles.emptyItalic}>ยังไม่มีการเลือกรูปภาพ</span>}
                </div>
              </div>

              {/* Form Inputs */}
              <div style={styles.formGroupStack}>
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

              <button type="submit" style={{ ...styles.btn, ...styles.btnSuccess, ...styles.btnFull, marginTop: "24px" }}>
                💾 บันทึกข้อมูลกิจกรรม
              </button>
            </form>
          </div>
        )}

        {/* Activity Grid */}
        <div style={styles.activityGrid}>
          {filteredActivities.length === 0 ? (
            <div style={styles.noDataBox}>
              <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>📁</span>
              <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>ไม่พบข้อมูลกิจกรรมในระบบการค้นหา</p>
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
                      cursor: itemImages.length > 0 ? "zoom-in" : "default"
                    }}
                    onClick={() => {
                      if (itemImages.length > 0) {
                        setGalleryTitle(item.Name_activity || "คลังรูปภาพกิจกรรม");
                        setActiveGalleryImages(itemImages);
                      }
                    }}
                  >
                    {itemImages.length > 0 && itemImages[0] ? (
                      <div style={{ width: "100%", height: "100%", position: "relative" }}>
                        <img src={itemImages[0]} alt={item.Name_activity} style={styles.coverImg} />
                        {itemImages.length > 1 && (
                          <div style={styles.imageBadge}>
                            +{itemImages.length - 1} รูปภาพ
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={styles.noImageZone}>
                        <svg width="28" height="28" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  {/* Information Details */}
                  <div style={styles.cardBody}>
                    <h2 style={styles.cardTitle} title={item.Name_activity}>
                      {item.Name_activity || "ไม่มีชื่อกิจกรรม"}
                    </h2>
                    <div style={styles.cardDetailsBorder}>
                      <p style={styles.cardDetailItem}>
                        <span style={styles.primaryColor}>📸</span> <strong style={styles.detailLabel}>ผู้บันทึก:</strong> {item.Photographer || "ไม่ระบุ"}
                      </p>
                      <p style={styles.cardDetailItem}>
                        <span style={styles.primaryColor}>📅</span> <strong style={styles.detailLabel}>วันที่:</strong> {formatDate(item.Activity_date)}
                      </p>
                      <p style={styles.cardDetailItem}>
                        <span style={styles.primaryColor}>📍</span> <strong style={styles.detailLabel}>สถานที่:</strong> {item.Location || "ไม่ระบุ"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.cardActionsRow}>
                    <button onClick={() => handleEdit(item)} style={{ ...styles.actionBtn, ...styles.btnEdit }}>
                      แก้ไข
                    </button>
                    <button onClick={() => handleDelete(item.Activity_id)} style={{ ...styles.actionBtn, ...styles.btnDelete }}>
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
                  <h2 style={styles.modalTitle}>{galleryTitle}</h2>
                  <span style={styles.gallerySub}>📂 คลังภาพถ่ายรวมทั้งหมด ({activeGalleryImages.length} รูป)</span>
                </div>
                <button onClick={() => setActiveGalleryImages(null)} style={styles.circleCloseBtn}>✕</button>
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
              <button onClick={() => setLightBoxImage(null)} style={styles.lightboxCloseBtn}>✕</button>

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
                    ◀
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
                    ▶
                  </button>
                ) : <div style={{ width: "48px" }} />}
              </div>

              <div style={styles.lightboxCounter}>
                รูปภาพที่ {currentLightBoxIndex + 1} จาก {activeGalleryImages.length}
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
    padding: "20px 10px",
    fontFamily: "sans-serif",
    backgroundColor: "transparent",
    width: "100%",
    boxSizing: "border-box",
  },
  wrapper: {
    maxWidth: "1240px",
    margin: "0 auto",
    width: "100%",
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
  },
  badge: {
    padding: "3px 10px",
    fontSize: "12px",
    fontWeight: "bold",
    backgroundColor: "#e0f2fe",
    color: "#0284c7",
    borderRadius: "12px",
    display: "inline-block",
    marginBottom: "6px",
  },
  mainTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    color: "#333333",
  },
  titleAccent: {
    color: "#0284c7",
  },
  btn: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  btnPrimary: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
  },
  btnDanger: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  btnSuccess: {
    backgroundColor: "#10b981",
    color: "#ffffff",
  },
  btnFull: {
    width: "100%",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "25px",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    fontSize: "16px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 15px 12px 42px",
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    color: "#333333",
    outline: "none",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  modalForm: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "480px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "12px",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    color: "#333333",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  titleDot: {
    width: "10px",
    height: "10px",
    backgroundColor: "#0284c7",
    borderRadius: "50%",
    display: "inline-block",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#94a3b8",
    cursor: "pointer",
  },
  uploadZone: {
    display: "flex",
    alignItems: "center",
    border: "1px dashed #0284c7",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "20px",
    backgroundColor: "#f0f9ff",
  },
  uploadLabel: {
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "#ffffff",
    textAlign: "center",
    minWidth: "70px",
    boxSizing: "border-box",
  },
  uploadIconContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    marginTop: "4px",
    fontSize: "11px",
    fontWeight: "bold",
    color: "#0284c7",
  },
  previewContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    flex: 1,
    marginLeft: "16px",
    overflowY: "auto",
    maxHeight: "75px",
    paddingRight: "4px",
  },
  previewBox: {
    width: "50px",
    height: "50px",
    borderRadius: "6px",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    flexShrink: 0,
  },
  coverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  emptyItalic: {
    fontSize: "12px",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  formGroupStack: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#475569",
    marginBottom: "6px",
  },
  textInput: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    color: "#333333",
    outline: "none",
  },
  gridTwoColumns: {
    display: "flex",
    gap: "12px",
  },
  activityGrid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    width: "100%",
  },
  noDataBox: {
    width: "100%",
    textAlign: "center",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    border: "1px solid #ccc",
    padding: "40px 16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  activityCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
    width: "calc(25% - 15px)",
    minWidth: "260px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box",
    flexGrow: 1,
  },
  cardImageZone: {
    width: "100%",
    height: "176px",
    backgroundColor: "#f8fafc",
    position: "relative",
    overflow: "hidden",
  },
  imageBadge: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: "bold",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  noImageZone: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },
  cardBody: {
    padding: "16px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 12px 0",
    color: "#333333",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardDetailsBorder: {
    borderLeft: "2px solid #e2e8f0",
    paddingLeft: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  cardDetailItem: {
    fontSize: "13px",
    color: "#000000",          // 💡 เปลี่ยนรายละเอียดข้อมูลหลังไอคอนให้เป็นสีดำเข้มชัดเจน
    fontWeight: "bold",        // 💡 เพิ่มความหนาให้ตัวหนังสืออ่านง่ายขึ้น
    margin: 0,
  },
  detailLabel: {
    color: "#000000",          // 💡 เปลี่ยนคำว่า "ผู้บันทึก:", "วันที่:", "สถานที่:" ให้เป็นสีดำเข้ม
    fontWeight: "bold",
  },
  primaryColor: {
    color: "#0284c7",
  },
  cardActionsRow: {
    display: "flex",
    backgroundColor: "#ffffff",
    padding: "12px 16px",
    gap: "12px",
  },
  actionBtn: {
    flex: 1,
    padding: "10px 0",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    textAlign: "center",
  },
  btnEdit: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
  },
  btnDelete: {
    backgroundColor: "#ffe4e6",
    color: "#b91c1c",
    border: "1px solid #fecdd3",
  },
  galleryContainer: {
    backgroundColor: "#ffffff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "560px",
    padding: "25px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "80vh",
    boxSizing: "border-box",
  },
  galleryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "12px",
  },
  gallerySub: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#0284c7",
    marginTop: "2px",
    display: "block",
  },
  circleCloseBtn: {
    backgroundColor: "#f1f5f9",
    border: "none",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    color: "#94a3b8",
    fontSize: "12px",
    cursor: "pointer",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    overflowY: "auto",
    paddingRight: "4px",
    boxSizing: "border-box",
  },
  galleryItemBox: {
    width: "100%",
    aspectRatio: "1/1",
    borderRadius: "6px",
    border: "1px solid #ccc",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    cursor: "zoom-in",
  },
  lightboxOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.95)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 11000,
    padding: "16px",
  },
  lightboxContent: {
    backgroundColor: "transparent",
    width: "100%",
    maxWidth: "850px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  lightboxCloseBtn: {
    position: "absolute",
    top: "-48px",
    right: 0,
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#ffffff",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontSize: "16px",
    cursor: "pointer",
  },
  lightboxMainRow: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  arrowBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  lightboxImgContainer: {
    flex: 1,
    height: "65vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lightboxImg: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    borderRadius: "8px",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
  },
  lightboxCounter: {
    marginTop: "20px",
    padding: "4px 12px",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "rgba(255,255,255,0.8)",
  }
};

export default Activity;