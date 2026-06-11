import React, { useState } from 'react';

function StudentManagement() {
  // 1. สร้าง Mock Data สำหรับแสดงการ์ดนักเรียนเริ่มต้น
  const [students, setStudents] = useState([
    { id: 1, name: 'สมชาย ดีใจ', parent: 'สมปอง ดีใจ', birthday: '2020-05-12', level: 'อนุบาล 1', gender: 'ชาย', blood: 'A' },
    { id: 2, name: 'สมหญิง รักดี', parent: 'สมศักดิ์ รักดี', birthday: '2020-08-20', level: 'อนุบาล 2', gender: 'หญิง', blood: 'B' }
  ]);

  // 2. State สำหรับควบคุมการเปิด-ปิดหน้าต่าง Pop-up (Modal) ต่างๆ
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 3. State สำหรับเก็บข้อมูลในฟอร์มพิมพ์
  const [formData, setFormData] = useState({ id: '', name: '', parent: '', birthday: '', level: '', gender: '', blood: '' });
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // ฟังก์ชันล้างค่าในฟอร์มกรอกข้อมูล
  const resetForm = () => {
    setFormData({ id: '', name: '', parent: '', birthday: '', level: '', gender: '', blood: '' });
  };

  // --- ฟังก์ชันการทำงานหลัก (CRUD) ---
  
  // เปิดกล่องเพิ่มข้อมูล (ภาพ 0.JPG)
  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  // กดยืนยันบันทึกการเพิ่มข้อมูล
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const newStudent = { ...formData, id: Date.now() }; // จำลอง ID แฝง
    setStudents([...students, newStudent]);
    setIsAddModalOpen(false);
  };
  

  // เปิดกล่องแก้ไขข้อมูล (ภาพ 9.JPG)
  const handleOpenEditModal = (student) => {
    setFormData(student);
    setIsEditModalOpen(true);
  };

  // กดยืนยันบันทึกการแก้ไขข้อมูล
  const handleEditSubmit = (e) => {
    e.preventDefault();
    setStudents(students.map(item => item.id === formData.id ? formData : item));
    setIsEditModalOpen(false);
  };

  // เปิดกล่องถามเพื่อยืนยันการลบ (ภาพ 8.JPG)
  const handleOpenDeleteModal = (id) => {
    setSelectedStudentId(id);
    setIsDeleteModalOpen(true);
  };

  // กดยืนยันลบข้อมูลจริง
  const handleDeleteConfirm = () => {
    setStudents(students.filter(item => item.id !== selectedStudentId));
    setIsDeleteModalOpen(false);
  };

  return (
    <div style={styles.studentContainer}>
      {/* ส่วนหัวแสดงประเภทและปุ่มกดเพิ่ม */}
      <div style={styles.studentHeader}>
        <div style={styles.titleSection}>
          <button style={styles.btnTab}>นักเรียน</button>
          <h3 style={styles.headerTitle}>จัดการข้อมูลนักเรียนระดับปฐมวัย</h3>
        </div>
        <button style={styles.btnValueAdd} onClick={handleOpenAddModal}>+ เพิ่มนักเรียน</button>
      </div>

      {/* หน้าจอแสดงผลแบบการ์ดล็อก (ภาพ 3.JPG) */}
      <div style={styles.studentGrid}>
        {students.map((student) => (
          <div style={styles.studentCard} key={student.id}>
            <div style={styles.cardInfo}>
              <div style={styles.avatarPlaceholder}>
                <span style={{ fontSize: '14px' }}>📄<span style={{ fontSize: '10px', verticalAlign: 'super' }}>+</span></span>
                <small style={{ fontSize: '8px', marginTop: '2px' }}>Add Image</small>
              </div>
              <div style={styles.detailText}>
                <h4 style={styles.studentNameText}>{student.name || 'ชื่อ-นามสกุล'}</h4>
                <p style={styles.studentLevelText}>ระดับชั้น: {student.level || 'ไม่ได้ระบุ'}</p>
              </div>
            </div>
            <div style={styles.cardActions}>
              <button style={styles.btnEdit} onClick={() => handleOpenEditModal(student)}>แก้ไข</button>
              <button style={styles.btnDelete} onClick={() => handleOpenDeleteModal(student.id)}>ลบ</button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= POP-UP MODAL: เพิ่มนักเรียน (0.JPG) ================= */}
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
                <small style={{ fontSize: '10px', color: '#666', marginTop: '4px', display: 'block' }}>Add Image</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อ-นามสกุล</label>
                <input type="text" required style={styles.formInput} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ผู้ปกครอง</label>
                <input type="text" required style={styles.formInput} value={formData.parent} onChange={(e) => setFormData({...formData, parent: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.birthday} onChange={(e) => setFormData({...formData, birthday: e.target.value})} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <input type="text" placeholder="เลือกระดับชั้น" style={styles.formInput} value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} />
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ</label>
                  <select style={styles.formSelect} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="">เลือกเพศ</option>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select style={styles.formSelect} value={formData.blood} onChange={(e) => setFormData({...formData, blood: e.target.value})}>
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

      {/* ================= POP-UP MODAL: แก้ไขนักเรียน (9.JPG) ================= */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeX} onClick={() => setIsEditModalOpen(false)}>X</button>
            <h3 style={styles.modalHeading}>แก้ไขนักเรียน</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.avatarUploadZone}>
                <div style={{ ...styles.avatarPlaceholder, ...styles.avatarBig }}>
                  <span style={{ fontSize: '18px' }}>📄<span>+</span></span>
                </div>
                <small style={{ fontSize: '10px', color: '#666', marginTop: '4px', display: 'block' }}>Add Image</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อ-นามสกุล</label>
                <input type="text" required style={styles.formInput} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ผู้ปกครอง</label>
                <input type="text" required style={styles.formInput} value={formData.parent} onChange={(e) => setFormData({...formData, parent: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.birthday} onChange={(e) => setFormData({...formData, birthday: e.target.value})} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <input type="text" style={styles.formInput} value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} />
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ</label>
                  <select style={styles.formSelect} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select style={styles.formSelect} value={formData.blood} onChange={(e) => setFormData({...formData, blood: e.target.value})}>
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

      {/* ================= POP-UP MODAL: ยืนยันการลบ (8.JPG) ================= */}
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

// 4. ส่วนของ Style CSS Object สำหรับตกแต่งหน้าตา (รวมอยู่ในไฟล์เดียว)
const styles = {
  studentContainer: {
    padding: '30px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
  },
  studentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  headerTitle: {
    marginTop: '15px',
    fontSize: '15px',
    color: '#000000',
    fontWeight: '600',
  },
  btnTab: {
    background: '#ffffff',
    border: '1px solid #cccccc',
    padding: '6px 30px',
    borderRadius: '6px',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
    fontWeight: 'bold',
    width: 'fit-content',
  },
  btnValueAdd: {
    background: '#ffffff',
    border: '1px solid #000000',
    padding: '8px 18px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
  },
  studentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  studentCard: {
    border: '1px solid #cccccc',
    borderRadius: '14px',
    padding: '15px',
    background: '#ffffff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
  },
  cardInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '15px',
  },
  avatarPlaceholder: {
    border: '1px solid #cccccc',
    width: '52px',
    height: '52px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#555555',
    background: '#fcfcfc',
  },
  avatarBig: {
    width: '65px',
    height: '65px',
    margin: '0 auto',
  },
  detailText: {
    display: 'flex',
    flexDirection: 'column',
  },
  studentNameText: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: '600',
  },
  studentLevelText: {
    margin: '0',
    color: '#666666',
    fontSize: '13px',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
  },
  btnEdit: {
    flex: '1',
    padding: '6px',
    border: '1px solid #cccccc',
    background: '#ffffff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  btnDelete: {
    flex: '1',
    padding: '6px',
    border: '1px solid #cccccc',
    background: '#ffffff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.35)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '999',
  },
  modalContent: {
    background: '#ffffff',
    padding: '25px',
    borderRadius: '16px',
    width: '350px',
    position: 'relative',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
  modalHeading: {
    margin: '0 0 20px 0',
    fontSize: '16px',
    textAlign: 'left',
    fontWeight: '600',
  },
  closeX: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '15px',
    cursor: 'pointer',
    color: '#999999',
  },
  avatarUploadZone: {
    textAlign: 'center',
    marginBottom: '15px',
  },
  formGroup: {
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  formLabel: {
    fontSize: '12px',
    color: '#555555',
    marginBottom: '4px',
  },
  formInput: {
    padding: '8px',
    border: '1px solid #cccccc',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
  },
  formSelect: {
    padding: '8px',
    border: '1px solid #cccccc',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    background: '#ffffff',
  },
  formRow: {
    display: 'flex',
    gap: '10px',
  },
  btnSubmitSave: {
    width: '100%',
    padding: '10px',
    background: '#ffffff',
    border: '1px solid #333333',
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '15px',
    cursor: 'pointer',
  },
  modalDeleteContent: {
    background: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    width: '300px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
  },
  modalDeleteActions: {
    display: 'flex',
    gap: '15px',
  },
  btnCancel: {
    flex: '1',
    padding: '8px',
    border: '1px solid #cccccc',
    background: '#ffffff',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  btnConfirmDelete: {
    flex: '1',
    padding: '8px',
    border: '1px solid #000000',
    background: '#ffffff',
    fontWeight: 'bold',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default StudentManagement;