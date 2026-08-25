import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  MapPin,
  FileText,
  Image,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Send,
  Sparkles,
  Eye,
  Clock,
  ImagePlus,
  Users
} from 'lucide-react';

export default function PublicRelations() {
  const [prList, setPrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'เจ้าหน้าที่ระบบ'
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [formData, setFormData] = useState({
    Name: '',
    date: '',
    Location: '',
    Detail: '',
    User_id: 1,
    Image: ''
  });
  const [selectedId, setSelectedId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const API_URL = 'http://localhost:3001/api/publicrelations';
  const USERS_API_URL = 'http://localhost:3001/users';
  const CALENDAR_API_URL = 'http://localhost:3001/api/calendar';

  const displayFormattedDate = (dateStr) => {
    if (!dateStr) return '-';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const displayThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parseInt(parts[0]) + 543}`;
    }
    return dateStr;
  };

  const getUserNameById = useCallback((userId) => {
    if (!userId) return "ไม่ระบุชื่อ";
    const found = users.find(u => Number(u.User_id || u.id || u.user_id) === Number(userId));
    if (found) {
      return found.Name || found.name || found.Username || found.username;
    }
    return `ผู้ใช้งานรหัส ${userId}`;
  }, [users]);

  const fetchUsersData = async () => {
    try {
      const res = await fetch(USERS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching users list:", err);
    }
  };

  const checkAuthUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const activeId = Number(userData.User_id || userData.id || userData.user_id || 1);
        const activeName = userData.Name || userData.name || userData.Username || 'ผู้ใช้งานระบบ';

        const userObj = { id: activeId, name: activeName };
        setCurrentUser(userObj);
        return userObj;
      } catch (error) {
        console.error("Error parsing user storage:", error);
      }
    }
    return { id: 1, name: 'เจ้าหน้าที่ระบบ' };
  };

  const fetchPRData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setPrList(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
    checkAuthUser();
    fetchPRData();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, Image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const activeUser = checkAuthUser();
    const cleanDate = formData.date ? formData.date.split('T')[0] : '';
    const dataToSend = { ...formData, date: cleanDate, User_id: activeUser.id };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        const addedPR = await res.json();
        const newPRId = addedPR.PublicRelation_id || addedPR.insertId || addedPR.id;

        if (newPRId) {
          const calendarData = {
            Name: formData.Name,
            Date: cleanDate,
            Time: '09:00 - 12:00',
            Location: formData.Location,
            User_id: activeUser.id,
            PublicRelation_id: newPRId
          };

          await fetch(CALENDAR_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calendarData)
          });
        }

        alert("เพิ่มข่าวประชาสัมพันธ์และบันทึกลงปฏิทินสำเร็จ!");
        setIsAddOpen(false);
        clearForm();
        fetchPRData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      alert("ไม่พบรหัสข่าวประชาสัมพันธ์ กรุณาลองใหม่อีกครั้ง");
      return;
    }

    const cleanDate = formData.date ? formData.date.split('T')[0] : '';
    const payload = { ...formData, date: cleanDate };

    try {
      const res = await fetch(`${API_URL}/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        try {
          const calendarData = {
            Name: formData.Name,
            Date: cleanDate,
            Location: formData.Location,
            User_id: formData.User_id
          };

          await fetch(`${CALENDAR_API_URL}/pr/${selectedId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calendarData)
          });
        } catch (calErr) {
          console.warn("ไม่สามารถอัปเดตปฏิทินได้:", calErr);
        }

        alert("แก้ไขข้อมูลประชาสัมพันธ์สำเร็จ!");
        setIsEditOpen(false);
        clearForm();
        fetchPRData();
      } else {
        alert(`แก้ไขไม่สำเร็จ รหัสตอบกลับ: ${res.status}`);
      }
    } catch (err) {
      console.error("Edit submit error:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, { method: 'DELETE' });
      if (res.ok) {
        try {
          await fetch(`${CALENDAR_API_URL}/pr/${selectedId}`, { method: 'DELETE' });
        } catch (calErr) {
          console.warn("ไม่สามารถลบปฏิทินได้:", calErr);
        }

        alert("ลบข้อมูลสำเร็จ!");
        setIsDeleteOpen(false);
        fetchPRData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const clearForm = () => {
    const activeUser = checkAuthUser();
    setFormData({
      Name: '',
      date: '',
      Location: '',
      Detail: '',
      User_id: activeUser.id,
      Image: ''
    });
    setImagePreview(null);
    setSelectedId(null);
  };

  const openEditModal = (item) => {
    const prId = item.PublicRelation_id || item.publicrelation_id || item.id;
    setSelectedId(prId);

    let rawDate = '';
    if (item.Date) {
      rawDate = String(item.Date).split('T')[0];
    }

    setFormData({
      Name: item.Name_activity || item.Name || '',
      date: rawDate,
      Location: item.Location || '',
      Detail: item.Detail || '',
      User_id: item.User_id || currentUser.id,
      Image: item.Image || ''
    });
    setImagePreview(item.Image || null);
    setIsEditOpen(true);
  };

  const openDetailModal = (item) => {
    setSelectedDetail(item);
    setIsDetailOpen(true);
  };

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  if (loading && prList.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลประชาสัมพันธ์...</p>
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
              <Megaphone size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>ประชาสัมพันธ์</h1>
              <p style={styles.subTitle}>
                <Sparkles size={14} color="#4A90D9" />
                จัดการข่าวสารและกิจกรรมประชาสัมพันธ์
              </p>
            </div>
          </div>
          <button style={styles.btnPrimary} onClick={() => { clearForm(); setIsAddOpen(true); }}>
            <Plus size={18} />
            เพิ่มประชาสัมพันธ์
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#EBF3FB' }}>
              <Megaphone size={20} color="#4A90D9" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>ข่าวสารทั้งหมด</span>
              <span style={styles.statValue}>{prList.length} รายการ</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#E8F8ED' }}>
              <Users size={20} color="#27AE60" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>ผู้ใช้งานระบบ</span>
              <span style={styles.statValue}>{users.length} คน</span>
            </div>
          </div>
        </div>

        {/* PR List */}
        <div style={styles.cardContainer}>
          {prList.length === 0 ? (
            <div style={styles.emptyState}>
              <Megaphone size={56} color="#CBD5E1" />
              <p style={styles.emptyText}>ไม่มีข้อมูลประชาสัมพันธ์</p>
              <p style={styles.emptySubText}>คลิกปุ่ม "เพิ่มประชาสัมพันธ์" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            prList.map((item) => (
              <div key={item.PublicRelation_id || item.id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <div style={styles.cardImageWrapper}>
                    {item.Image ? (
                      <img src={item.Image} alt="public relations" style={styles.cardImg} />
                    ) : (
                      <div style={styles.cardImgPlaceholder}>
                        <Image size={32} color="#CBD5E1" />
                        <span>ไม่มีรูป</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.cardInfo}>
                    <h3 style={styles.cardTitle}>{item.Name_activity || item.Name}</h3>
                    <div style={styles.cardDetails}>
                      <div style={styles.cardDetail}>
                        <Calendar size={14} color="#94A3B8" />
                        <span>วันที่: {displayThaiDate(item.Date)}</span>
                      </div>
                      {item.Location && (
                        <div style={styles.cardDetail}>
                          <MapPin size={14} color="#94A3B8" />
                          <span>{item.Location}</span>
                        </div>
                      )}
                      {item.Detail && (
                        <div style={styles.cardDetail}>
                          <FileText size={14} color="#94A3B8" />
                          <span style={styles.cardDetailText}>{item.Detail}</span>
                        </div>
                      )}
                      <div style={styles.cardDetail}>
                        <User size={14} color="#94A3B8" />
                        <span>โดย: <strong style={{ color: '#4A90D9' }}>
                          {item.CreatedBy_Name || getUserNameById(item.User_id)}
                        </strong></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={styles.cardAction}>
                  <button style={styles.detailBtn} onClick={() => openDetailModal(item)}>
                    <Eye size={14} />
                  </button>
                  <button style={styles.editBtn} onClick={() => openEditModal(item)}>
                    <Edit2 size={14} />
                  </button>
                  <button style={styles.deleteBtn} onClick={() => openDeleteModal(item.PublicRelation_id || item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedDetail && (
        <div style={styles.modalOverlay} onClick={() => setIsDetailOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={20} color="#4A90D9" />
                รายละเอียดประชาสัมพันธ์
              </h2>
              <button onClick={() => setIsDetailOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.detailContent}>
              {selectedDetail.Image && (
                <div style={styles.detailImageWrapper}>
                  <img src={selectedDetail.Image} alt="detail" style={styles.detailImage} />
                </div>
              )}
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📌 ชื่อเรื่อง</span>
                <span style={styles.detailValue}>{selectedDetail.Name_activity || selectedDetail.Name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📅 วันที่</span>
                <span style={styles.detailValue}>{displayThaiDate(selectedDetail.Date)}</span>
              </div>
              {selectedDetail.Location && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>📍 สถานที่</span>
                  <span style={styles.detailValue}>{selectedDetail.Location}</span>
                </div>
              )}
              {selectedDetail.Detail && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>📝 รายละเอียด</span>
                  <span style={styles.detailValue}>{selectedDetail.Detail}</span>
                </div>
              )}
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>👤 ประชาสัมพันธ์โดย</span>
                <span style={styles.detailValue} className="detail-user">
                  {selectedDetail.CreatedBy_Name || getUserNameById(selectedDetail.User_id)}
                </span>
              </div>
            </div>
            <button onClick={() => setIsDetailOpen(false)} style={styles.closeDetailBtn}>
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsAddOpen(false); clearForm(); }
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Plus size={20} color="#4A90D9" />
                เพิ่มประชาสัมพันธ์
              </h2>
              <button onClick={() => { setIsAddOpen(false); clearForm(); }} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div style={styles.uploadSection}>
                <label style={styles.uploadLabel}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <div style={styles.uploadArea}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" style={styles.uploadPreview} />
                    ) : (
                      <>
                        <ImagePlus size={32} color="#4A90D9" />
                        <span style={styles.uploadText}>คลิกเพื่อเลือกรูปภาพ</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อเรื่อง *</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="กรอกชื่อเรื่องประชาสัมพันธ์"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันที่ *</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>สถานที่</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Location}
                  onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                  placeholder="กรอกสถานที่จัดกิจกรรม"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>รายละเอียด</label>
                <textarea
                  style={styles.formTextarea}
                  value={formData.Detail}
                  onChange={(e) => setFormData({ ...formData, Detail: e.target.value })}
                  placeholder="กรอกรายละเอียดเพิ่มเติม"
                  rows={3}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <User size={14} style={styles.labelIcon} />
                  ประชาสัมพันธ์โดย
                </label>
                <div style={styles.userDisplay}>{currentUser.name}</div>
              </div>

              <button type="submit" style={styles.submitBtn}>
                <Send size={18} />
                บันทึกประชาสัมพันธ์
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsEditOpen(false); clearForm(); }
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Edit2 size={20} color="#F39C12" />
                แก้ไขประชาสัมพันธ์
              </h2>
              <button onClick={() => { setIsEditOpen(false); clearForm(); }} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.uploadSection}>
                <label style={styles.uploadLabel}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <div style={styles.uploadArea}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" style={styles.uploadPreview} />
                    ) : (
                      <>
                        <ImagePlus size={32} color="#4A90D9" />
                        <span style={styles.uploadText}>คลิกเพื่อเลือกรูปภาพ</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อเรื่อง *</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันที่ *</label>
                <input
                  type="date"
                  style={styles.formInput}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>สถานที่</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.Location}
                  onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>รายละเอียด</label>
                <textarea
                  style={styles.formTextarea}
                  value={formData.Detail}
                  onChange={(e) => setFormData({ ...formData, Detail: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <User size={14} style={styles.labelIcon} />
                  ประชาสัมพันธ์โดย
                </label>
                <div style={styles.userDisplay}>{getUserNameById(formData.User_id)}</div>
              </div>

              <button type="submit" style={{ ...styles.submitBtn, backgroundColor: '#F39C12' }}>
                <CheckCircle size={18} />
                อัปเดตข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsDeleteOpen(false); clearForm(); }
        }}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteIcon}>🗑️</div>
            <h3 style={styles.deleteTitle}>ยืนยันการลบ</h3>
            <p style={styles.deleteText}>คุณต้องการลบข้อมูลประชาสัมพันธ์นี้หรือไม่?</p>
            <p style={styles.deleteSubText}>การดำเนินการนี้ไม่สามารถกู้คืนได้</p>
            <div style={styles.deleteActions}>
              <button onClick={() => { setIsDeleteOpen(false); clearForm(); }} style={styles.cancelBtn}>
                ยกเลิก
              </button>
              <button onClick={handleDeleteSubmit} style={styles.confirmDeleteBtn}>
                <Trash2 size={16} />
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
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
    maxWidth: '1100px',
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
    marginBottom: '24px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#FFFFFF',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  statIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1A202C',
  },

  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px 24px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    gap: '16px',
  },
  cardLeft: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  cardImageWrapper: {
    flexShrink: 0,
  },
  cardImg: {
    width: '120px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  cardImgPlaceholder: {
    width: '120px',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    color: '#94A3B8',
    fontSize: '12px',
    gap: '4px',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 8px 0',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748B',
  },
  cardDetailText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardAction: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  detailBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 10px',
    backgroundColor: '#F8FAFC',
    color: '#64748B',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 10px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: '1px solid #B6D4F0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '7px 10px',
    backgroundColor: '#FDEDEC',
    color: '#E74C3C',
    border: '1px solid #F5C6CB',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
    margin: '16px 0 4px 0',
  },
  emptySubText: {
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
  modalContent: {
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
    gap: '10px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },

  // Upload
  uploadSection: {
    marginBottom: '16px',
  },
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    border: '2px dashed #E2E8F0',
    borderRadius: '12px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease',
    minHeight: '100px',
  },
  uploadPreview: {
    maxWidth: '100%',
    maxHeight: '150px',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  uploadText: {
    fontSize: '13px',
    color: '#94A3B8',
    marginTop: '8px',
  },

  // Form
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
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
  formInput: {
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
  formTextarea: {
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
    resize: 'vertical',
    minHeight: '70px',
  },
  userDisplay: {
    padding: '10px 14px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#475569',
    fontWeight: '500',
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
    marginTop: '8px',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  // Detail Modal
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailImageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  detailImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    gap: '12px',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: '14px',
    color: '#1A202C',
    fontWeight: '500',
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  closeDetailBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px',
    marginTop: '16px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  // Delete Modal
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px 28px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  },
  deleteIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  deleteTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 8px 0',
  },
  deleteText: {
    fontSize: '15px',
    color: '#475569',
    margin: 0,
  },
  deleteSubText: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: '4px 0 24px 0',
  },
  deleteActions: {
    display: 'flex',
    gap: '12px',
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  confirmDeleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#E74C3C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)',
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
  
  .card {
    animation: fadeInUp 0.3s ease forwards;
  }
  .card:nth-child(1) { animation-delay: 0.05s; }
  .card:nth-child(2) { animation-delay: 0.1s; }
  .card:nth-child(3) { animation-delay: 0.15s; }
  .card:nth-child(4) { animation-delay: 0.2s; }
  .card:nth-child(5) { animation-delay: 0.25s; }
  .card:nth-child(6) { animation-delay: 0.3s; }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  }
  
  .detail-btn:hover {
    background-color: #E2E8F0 !important;
  }
  .edit-btn:hover {
    background-color: #D6E9FF !important;
  }
  .delete-btn:hover {
    background-color: #FCD5D5 !important;
  }
  
  .form-input:focus, .form-textarea:focus {
    border-color: #4A90D9 !important;
    box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1) !important;
  }
  
  .upload-area:hover {
    border-color: #4A90D9 !important;
    background-color: #F0F7FF !important;
  }
  
  @media (max-width: 768px) {
    .card {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .card-left {
      flex-direction: column !important;
      align-items: center !important;
    }
    .card-image-wrapper {
      width: 100% !important;
    }
    .card-img, .card-img-placeholder {
      width: 100% !important;
      height: 150px !important;
    }
    .card-action {
      justify-content: center !important;
    }
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .btn-primary {
      width: 100% !important;
      justify-content: center !important;
    }
    .detail-item {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .detail-value {
      text-align: left !important;
      width: 100% !important;
    }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      padding: 20px !important;
    }
    .delete-modal {
      padding: 24px 20px !important;
    }
    .card-title {
      font-size: 15px !important;
    }
    .main-title {
      font-size: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);