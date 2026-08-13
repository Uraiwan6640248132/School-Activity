import React, { useState, useEffect, useCallback } from 'react';

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

  const [formData, setFormData] = useState({
    Name: '',
    date: '',
    Location: '',
    Detail: '',
    User_id: 1,
    Image: ''
  });
  const [selectedId, setSelectedId] = useState(null);

  const API_URL = 'http://localhost:3001/api/publicrelations';
  const USERS_API_URL = 'http://localhost:3001/users';
  const CALENDAR_API_URL = 'http://localhost:3001/api/calendar';

  // Helper ฟังก์ชันแปลงวันที่แสดงผลแบบป้องกัน Timezone คลาดเคลื่อน
  const displayFormattedDate = (dateStr) => {
    if (!dateStr) return '-';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // แสดงแบบ DD/MM/YYYY
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
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. เพิ่มประชาสัมพันธ์ + เพิ่มลงปฏิทิน
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

  // 2. แก้ไขประชาสัมพันธ์ + อัปเดตในปฏิทิน
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

  // 3. ลบประชาสัมพันธ์ + ลบออกจากปฏิทิน
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
    setSelectedId(null);
  };

  const openEditModal = (item) => {
    const prId = item.PublicRelation_id || item.publicrelation_id || item.id;
    setSelectedId(prId);

    // ดึงเฉพาะ YYYY-MM-DD แบบตรงๆ ป้องกัน Timezone ถอยหลัง
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
    setIsEditOpen(true);
  };

  const openDeleteModal = (id) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={{ margin: 10, color: '#0369a1' }}>ประชาสัมพันธ์</h2>

        <button style={styles.btnAdd} onClick={() => { clearForm(); setIsAddOpen(true); }}>
          + เพิ่มประชาสัมพันธ์
        </button>
      </div>

      <div style={styles.cardContainer}>
        {prList.map((item) => (
          <div key={item.PublicRelation_id || item.id} style={styles.card}>
            <div style={styles.cardLeft}>
              {item.Image ? (
                <img src={item.Image} alt="public relations" style={styles.cardImg} />
              ) : (
                <div style={styles.cardImgPlaceholder}>ไม่มีรูปภาพ</div>
              )}
              <div style={styles.cardInfo}>
                <strong>ชื่อเรื่อง:</strong> {item.Name_activity || item.Name} <br />
                <strong>วัน/เดือน/ปี:</strong> {displayFormattedDate(item.Date)} <br />
                <strong>สถานที่:</strong> {item.Location} <br />
                <strong>รายละเอียด:</strong> {item.Detail || '-'} <br />

                <strong>ประชาสัมพันธ์โดย:</strong>{' '}
                <span style={{ color: '#2563eb', fontWeight: '500' }}>
                  {item.CreatedBy_Name || getUserNameById(item.User_id)}
                </span>
              </div>
            </div>
            <div style={styles.cardAction}>
              <button style={{ ...styles.iconBtn, ...styles.iconBtnEdit }} onClick={() => openEditModal(item)}>แก้ไข</button>
              <button style={{ ...styles.iconBtn, ...styles.iconBtnDelete }} onClick={() => openDeleteModal(item.PublicRelation_id || item.id)}>ลบ</button>
            </div>
          </div>
        ))}
        {!loading && prList.length === 0 && <p style={{ color: '#999' }}>ไม่มีข้อมูลประชาสัมพันธ์ในขณะนี้</p>}
      </div>

      {/* POPUP 1: เพิ่มประชาสัมพันธ์ */}
      {isAddOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={{ fontSize: '18px' }}>เพิ่มประชาสัมพันธ์</strong>
              <span style={styles.closeX} onClick={() => { setIsAddOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div style={styles.uploadBox}>
                <label style={{ cursor: 'pointer', textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {formData.Image ? (
                    <img src={formData.Image} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  ) : (
                    <>📁 <br /><small>Add Image</small></>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>

              <label style={styles.label}>ชื่อเรื่อง</label>
              <input type="text" style={styles.input} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label style={styles.label}>วัน/เดือน/ปี</label>
              <input type="date" style={styles.input} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />

              <label style={styles.label}>สถานที่</label>
              <input type="text" style={styles.input} value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

              <label style={styles.label}>รายละเอียด</label>
              <textarea style={styles.textarea} value={formData.Detail} onChange={(e) => setFormData({ ...formData, Detail: e.target.value })} rows={3} />

              <label style={styles.label}>ประชาสัมพันธ์โดย</label>
              <div style={styles.loginUserBox}>
                {currentUser.name}
              </div>

              <button type="submit" style={styles.btnSubmit}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 2: แก้ไขประชาสัมพันธ์ */}
      {isEditOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <strong style={{ fontSize: '18px' }}>แก้ไขประชาสัมพันธ์</strong>
              <span style={styles.closeX} onClick={() => { setIsEditOpen(false); clearForm(); }}>X</span>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.uploadBox}>
                <label style={{ cursor: 'pointer', textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {formData.Image ? (
                    <img src={formData.Image} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                  ) : (
                    <>📁 <br /><small>Add Image</small></>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
              </div>

              <label style={styles.label}>ชื่อเรื่อง</label>
              <input type="text" style={styles.input} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} required />

              <label style={styles.label}>วัน/เดือน/ปี</label>
              <input type="date" style={styles.input} value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />

              <label style={styles.label}>สถานที่</label>
              <input type="text" style={styles.input} value={formData.Location} onChange={(e) => setFormData({ ...formData, Location: e.target.value })} required />

              <label style={styles.label}>รายละเอียด</label>
              <textarea style={styles.textarea} value={formData.Detail} onChange={(e) => setFormData({ ...formData, Detail: e.target.value })} rows={3} />

              <label style={styles.label}>ประชาสัมพันธ์โดย</label>
              <div style={styles.loginUserBox}>
                {getUserNameById(formData.User_id)}
              </div>

              <button type="submit" style={styles.btnSubmit}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP 3: ยืนยันการลบข้อมูล */}
      {isDeleteOpen && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, width: '350px', textAlign: 'center' }}>
            <div style={{ fontSize: '50px', margin: '10px 0' }}>🗑️</div>
            <strong style={{ fontSize: '18px', display: 'block', marginBottom: '5px' }}>ยืนยันการลบ</strong>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px 0' }}>คุณต้องการลบข้อมูลนี้หรือไม่</p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button style={styles.btnConfirmDelete} onClick={handleDeleteSubmit}>ลบ</button>
              <button style={styles.btnCancel} onClick={() => { setIsDeleteOpen(false); clearForm(); }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'sans-serif' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  btnAdd: { padding: '9px 16px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: '1px solid #0284c7', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 10px 22px rgba(14,165,233,0.22)' },
  cardContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: '#fff' },
  cardLeft: { display: 'flex', gap: '20px', alignItems: 'center' },
  cardImg: { width: '100px', height: '100px', border: '1px solid #ccc', objectFit: 'cover' },
  cardImgPlaceholder: { width: '100px', height: '100px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999', backgroundColor: '#f9f9f9' },
  cardInfo: { fontSize: '14px', lineHeight: '1.6' },
  cardAction: { display: 'flex', gap: '8px' },
  iconBtn: { padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  iconBtnEdit: { backgroundColor: '#eff8ff', color: '#0369a1', border: '1px solid #bae6fd' },
  iconBtnDelete: { backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', width: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#999' },
  uploadBox: { width: '70px', height: '70px', border: '1px dashed #ccc', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px', marginTop: '10px' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'sans-serif', resize: 'vertical' },
  btnSubmit: { width: '100%', padding: '10px', marginTop: '20px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: '1px solid #0284c7', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 10px 22px rgba(14,165,233,0.22)' },
  btnCancel: { padding: '8px 25px', backgroundColor: '#fff', color: '#31556b', border: '1px solid #cfe8f7', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  btnConfirmDelete: { padding: '8px 25px', backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  loginUserBox: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '500'
  }
};