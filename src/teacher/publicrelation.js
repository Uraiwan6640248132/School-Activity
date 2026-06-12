import React, { useState, useEffect } from 'react';

export default function PublicRelations() {
  const [prList, setPrList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);       
  const [isEditOpen, setIsEditOpen] = useState(false);     
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); 

  const [formData, setFormData] = useState({
    Name: '',
    date: '',
    Location: '',
    User_id: 1,
    Image: ''
  });
  const [selectedId, setSelectedId] = useState(null); 

  const API_URL = 'http://localhost:3001/api/publicrelations';

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
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
    setFormData({ 
      Name: '', 
      date: '', 
      Location: '', 
      User_id: 1, 
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
      User_id: item.User_id || 1,
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

      {loading && <p>กำลังโหลดข้อมูล...</p>}

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
                <strong>ประชาสัมพันธ์โดย:</strong> {item.User_id}
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

              <label style={styles.label}>ประชาสัมพันธ์โดย</label>
              <input type="number" style={styles.input} value={formData.User_id} onChange={(e) => setFormData({ ...formData, User_id: e.target.value })} />

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

              <label style={styles.label}>ประชาสัมพันธ์โดย</label>
              <input type="number" style={styles.input} value={formData.User_id} onChange={(e) => setFormData({ ...formData, User_id: e.target.value })} />

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
  btnSubmit: { width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnCancel: { padding: '8px 25px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  btnConfirmDelete: { padding: '8px 25px', backgroundColor: '#d9534f', color: '#fff', border: '1px solid #d43f3a', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};