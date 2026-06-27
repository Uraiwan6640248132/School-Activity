import React, { useState, useEffect, useCallback } from 'react';

export default function PublicRelations() {
  const [prList, setPrList] = useState([]);
  const [loading, setLoading] = useState(false);

  // สำหรับเก็บรายชื่อผู้ใช้ทั้งหมดในระบบ เอาไว้ดึงชื่อจริงมาแสดงผล
  const [users, setUsers] = useState([]);

  // State สำหรับเก็บข้อมูลผู้ล็อกอินปัจจุบัน
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

  // ฟังก์ชันจับคู่หาชื่อผู้ใช้งานด้วย User_id (ส่งกลับเฉพาะชื่อเพียวๆ)
  const getUserNameById = useCallback((userId) => {
    if (!userId) return "ไม่ระบุชื่อ";
    const found = users.find(u => Number(u.User_id || u.id || u.user_id) === Number(userId));
    if (found) {
      return found.Name || found.name || found.Username || found.username;
    }
    return `ผู้ใช้งานรหัส ${userId}`;
  }, [users]);

  // ดึงรายชื่อผู้ใช้งานทั้งหมดมาเก็บในระบบหน้าบ้าน
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const activeUser = checkAuthUser();
    const dataToSend = { ...formData, User_id: activeUser.id };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      if (res.ok) {
        alert("เพิ่มข่าวประชาสัมพันธ์สำเร็จ!");
        setIsAddOpen(false);
        clearForm();
        fetchPRData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("แก้ไขข้อมูลสำเร็จ!");
        setIsEditOpen(false);
        clearForm();
        fetchPRData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("ลบข้อมูลสำเร็จ!");
        setIsDeleteOpen(false);
        fetchPRData();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
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
    setSelectedId(item.PublicRelation_id);
    setFormData({
      Name: item.Name_activity || '',
      date: item.Date ? item.Date.substring(0, 10) : '',
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
        <div>
          <h2 style={{ margin: 0 }}>ประชาสัมพันธ์</h2>
          <small style={{ color: '#666' }}>เพิ่ม ลบ แก้ไขงานประชาสัมพันธ์</small>
        </div>
        <button style={styles.btnAdd} onClick={() => { clearForm(); setIsAddOpen(true); }}>
          + เพิ่มประชาสัมพันธ์
        </button>
      </div>

      <div style={styles.cardContainer}>
        {prList.map((item) => (
          <div key={item.PublicRelation_id} style={styles.card}>
            <div style={styles.cardLeft}>
              {item.Image ? (
                <img src={item.Image} alt="public relations" style={styles.cardImg} />
              ) : (
                <div style={styles.cardImgPlaceholder}>ไม่มีรูปภาพ</div>
              )}
              <div style={styles.cardInfo}>
                <strong>ชื่อเรื่อง:</strong> {item.Name_activity} <br />
                <strong>วัน/เดือน/ปี:</strong> {item.Date ? item.Date.substring(0, 10) : '-'} <br />
                <strong>สถานที่:</strong> {item.Location} <br />
                <strong>รายละเอียด:</strong> {item.Detail || '-'} <br />

                <strong>ประชาสัมพันธ์โดย:</strong>{' '}
                <span style={{ color: '#2563eb', fontWeight: '500' }}>
                  {item.CreatedBy_Name || getUserNameById(item.User_id)}
                </span>
              </div>
            </div>
            <div style={styles.cardAction}>
              <button style={styles.iconBtn} onClick={() => openDeleteModal(item.PublicRelation_id)}>🗑️</button>
              <button style={styles.iconBtn} onClick={() => openEditModal(item)}>📝</button>
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
              {/* 🌟 แสดงเฉพาะชื่อผู้ใช้ปัจจุบันที่ Login เท่านั้น */}
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
              {/* 🌟 ปรับปรุงจุดนี้: แสดงเฉพาะชื่อจริงของผู้สร้างข่าวเท่านั้น ไม่มีข้อความและรหัสอื่นๆ นำหน้า */}
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
              <button style={styles.btnCancel} onClick={() => { setIsDeleteOpen(false); clearForm(); }}>ยกเลิก</button>
              <button style={styles.btnConfirmDelete} onClick={handleDeleteSubmit}>ลบ</button>
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
  btnAdd: { padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cardContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ddd', padding: '15px', borderRadius: '4px', backgroundColor: '#fff' },
  cardLeft: { display: 'flex', gap: '20px', alignItems: 'center' },
  cardImg: { width: '100px', height: '100px', border: '1px solid #ccc', objectFit: 'cover' },
  cardImgPlaceholder: { width: '100px', height: '100px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999', backgroundColor: '#f9f9f9' },
  cardInfo: { fontSize: '14px', lineHeight: '1.6' },
  cardAction: { display: 'flex', gap: '8px' },
  iconBtn: { padding: '6px 10px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', width: '400px', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', position: 'relative' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#999' },
  uploadBox: { width: '70px', height: '70px', border: '1px dashed #ccc', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px', marginTop: '10px' },
  input: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'sans-serif', resize: 'vertical' },
  btnSubmit: { width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { padding: '8px 25px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  btnConfirmDelete: { padding: '8px 25px', backgroundColor: '#d9534f', color: '#fff', border: '1px solid #d43f3a', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
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