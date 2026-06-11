import React, { useState, useEffect } from 'react';

function StudentManagement() {
  // State หลักสำหรับเก็บข้อมูลนักเรียนที่ดึงมาจากฐานข้อมูล
  const [students, setStudents] = useState([]);

  // State สำหรับควบคุมหน้าต่าง Pop-up (Modal)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State สำหรับพิมพ์กรอกข้อมูล (อิงตามชื่อคอลัมน์จริงใน MySQL)
  const [formData, setFormData] = useState({ Student_id: '', Name: '', Birthday: '', Gender: '', Class_level: '', Blood_group: '', User_id: 1 });
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const resetForm = () => {
    setFormData({ Student_id: '', Name: '', Birthday: '', Gender: '', Class_level: '', Blood_group: '', User_id: 1 });
  };

  // --- ฟังก์ชันดึงข้อมูลจาก Backend มาแสดงผลครั้งแรก ---
  const fetchStudents = () => {
    fetch('http://localhost:3001/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch(err => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- จัดการการเพิ่มข้อมูล (Create) ---
  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      fetchStudents(); // ดึงข้อมูลใหม่จากฐานข้อมูลมาแสดงทันที
      setIsAddModalOpen(false);
    })
    .catch(err => console.error(err));
  };

  // --- จัดการการแก้ไขข้อมูล (Update) ---
  const handleOpenEditModal = (student) => {
    // ปรับรูปแบบวันที่ให้แสดงบน `<input type="date">` ได้ถูกต้อง
    const formattedBirthday = student.Birthday ? student.Birthday.split('T')[0] : '';
    // แปลงค่าเพศกลับมาเป็นคำอ่านเพื่อแสดงใน select
    const displayGender = student.Gender == 1 ? "ชาย" : "หญิง";

    setFormData({
      ...student,
      Birthday: formattedBirthday,
      Gender: displayGender
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3001/api/students/${formData.Student_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      fetchStudents();
      setIsEditModalOpen(false);
    })
    .catch(err => console.error(err));
  };

  // --- จัดการการลบข้อมูล (Delete) ---
  const handleOpenDeleteModal = (id) => {
    setSelectedStudentId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    fetch(`http://localhost:3001/api/students/${selectedStudentId}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => {
      fetchStudents();
      setIsDeleteModalOpen(false);
    })
    .catch(err => console.error(err));
  };

  return (
    <div style={styles.studentContainer}>
      <div style={styles.studentHeader}>
        <div style={styles.titleSection}>
          <button style={styles.btnTab}>นักเรียน</button>
          <h3 style={styles.headerTitle}>จัดการข้อมูลนักเรียนระดับปฐมวัย</h3>
        </div>
        <button style={styles.btnValueAdd} onClick={handleOpenAddModal}>+ เพิ่มนักเรียน</button>
      </div>

      {/* หน้าจอแสดงผลการ์ดนักเรียน */}
      <div style={styles.studentGrid}>
        {students.map((student) => (
          <div style={styles.studentCard} key={student.Student_id}>
            <div style={styles.cardInfo}>
              <div style={styles.avatarPlaceholder}>
                <span style={{ fontSize: '14px' }}>📄<span style={{ fontSize: '10px', verticalAlign: 'super' }}>+</span></span>
                <small style={{ fontSize: '8px', marginTop: '2px' }}>Add Image</small>
              </div>
              <div style={styles.detailText}>
                <h4 style={styles.studentNameText}>{student.Name || 'ชื่อ-นามสกุล'}</h4>
                <p style={styles.studentLevelText}>ระดับชั้น: {student.Class_level || 'ไม่ได้ระบุ'}</p>
                <small style={{ fontSize: '11px', color: '#888' }}>
                  เพศ: {student.Gender == 1 ? 'ชาย' : 'หญิง'} | กรุ๊ปเลือด: {student.Blood_group || '-'}
                </small>
              </div>
            </div>
            <div style={styles.cardActions}>
              <button style={styles.btnEdit} onClick={() => handleOpenEditModal(student)}>แก้ไข</button>
              <button style={styles.btnDelete} onClick={() => handleOpenDeleteModal(student.Student_id)}>ลบ</button>
            </div>
          </div>
        ))}
        {students.length === 0 && <p style={{ color: '#999' }}>ไม่มีข้อมูลนักเรียนในระบบ</p>}
      </div>

      {/* MODAL: เพิ่มนักเรียน */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeX} onClick={() => setIsAddModalOpen(false)}>X</button>
            <h3 style={styles.modalHeading}>เพิ่มนักเรียน</h3>
            <form onSubmit={handleAddSubmit}>
              <div style={styles.avatarUploadZone}>
                <div style={{ ...styles.avatarPlaceholder, ...styles.avatarBig }}>
                  <span style={{ fontSize: '18px' }}>📄<span>+</span></span>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อ-นามสกุล</label>
                <input type="text" required style={styles.formInput} value={formData.Name} onChange={(e) => setFormData({...formData, Name: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.Birthday} onChange={(e) => setFormData({...formData, Birthday: e.target.value})} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <input type="text" placeholder="เช่น 1/2" style={styles.formInput} value={formData.Class_level} onChange={(e) => setFormData({...formData, Class_level: e.target.value})} />
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ</label>
                  <select style={styles.formSelect} required value={formData.Gender} onChange={(e) => setFormData({...formData, Gender: e.target.value})}>
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select style={styles.formSelect} value={formData.Blood_group} onChange={(e) => setFormData({...formData, Blood_group: e.target.value})}>
                  <option value="">เลือกกรุ๊ปเลือด</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>
              <button type="submit" style={styles.btnSubmitSave}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: แก้ไขนักเรียน */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeX} onClick={() => setIsEditModalOpen(false)}>X</button>
            <h3 style={styles.modalHeading}>แก้ไขนักเรียน</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อ-นามสกุล</label>
                <input type="text" required style={styles.formInput} value={formData.Name} onChange={(e) => setFormData({...formData, Name: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.Birthday} onChange={(e) => setFormData({...formData, Birthday: e.target.value})} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <input type="text" style={styles.formInput} value={formData.Class_level} onChange={(e) => setFormData({...formData, Class_level: e.target.value})} />
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ</label>
                  <select style={styles.formSelect} value={formData.Gender} onChange={(e) => setFormData({...formData, Gender: e.target.value})}>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select style={styles.formSelect} value={formData.Blood_group} onChange={(e) => setFormData({...formData, Blood_group: e.target.value})}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>
              <button type="submit" style={styles.btnSubmitSave}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ยืนยันการลบ */}
      {isDeleteModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalDeleteContent}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗑️</div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>ยืนยันการลบ</h4>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>คุณต้องการลบข้อมูลนี้หรือไม่</p>
            <div style={styles.modalDeleteActions}>
              <button style={styles.btnCancel} onClick={() => setIsDeleteModalOpen(false)}>ยกเลิก</button>
              <button style={styles.btnConfirmDelete} onClick={handleDeleteConfirm}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  studentContainer: { padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh' },
  studentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  titleSection: { display: 'flex', flexDirection: 'column' },
  headerTitle: { marginTop: '15px', fontSize: '15px', color: '#000000', fontWeight: '600' },
  btnTab: { background: '#ffffff', border: '1px solid #cccccc', padding: '6px 30px', borderRadius: '6px', boxShadow: '0px 2px 4px rgba(0,0,0,0.08)', fontWeight: 'bold' },
  btnValueAdd: { background: '#ffffff', border: '1px solid #000000', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  studentCard: { border: '1px solid #cccccc', borderRadius: '14px', padding: '15px', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
  cardInfo: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' },
  avatarPlaceholder: { border: '1px solid #cccccc', width: '52px', height: '52px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#555555', background: '#fcfcfc' },
  avatarBig: { width: '65px', height: '65px', margin: '0 auto' },
  detailText: { display: 'flex', flexDirection: 'column' },
  studentNameText: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' },
  studentLevelText: { margin: '0', color: '#666666', fontSize: '13px' },
  cardActions: { display: 'flex', gap: '10px' },
  btnEdit: { flex: '1', padding: '6px', border: '1px solid #cccccc', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete: { flex: '1', padding: '6px', border: '1px solid #cccccc', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  modalOverlay: { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '999' },
  modalContent: { background: '#ffffff', padding: '25px', borderRadius: '16px', width: '350px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  modalHeading: { margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' },
  closeX: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '15px', cursor: 'pointer', color: '#999999' },
  avatarUploadZone: { textAlign: 'center', marginBottom: '15px' },
  formGroup: { marginBottom: '12px', display: 'flex', flexDirection: 'column' },
  formLabel: { fontSize: '12px', color: '#555555', marginBottom: '4px' },
  formInput: { padding: '8px', border: '1px solid #cccccc', borderRadius: '6px', fontSize: '13px', outline: 'none' },
  formSelect: { padding: '8px', border: '1px solid #cccccc', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#ffffff' },
  formRow: { display: 'flex', gap: '10px' },
  btnSubmitSave: { width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #333333', borderRadius: '8px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer' },
  modalDeleteContent: { background: '#ffffff', padding: '30px', borderRadius: '16px', width: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  modalDeleteActions: { display: 'flex', gap: '15px' },
  btnCancel: { flex: '1', padding: '8px', border: '1px solid #cccccc', background: '#ffffff', borderRadius: '6px', cursor: 'pointer' },
  btnConfirmDelete: { flex: '1', padding: '8px', border: '1px solid #000000', background: '#ffffff', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }
};

export default StudentManagement;
