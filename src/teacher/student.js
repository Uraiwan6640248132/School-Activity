import React, { useState, useEffect } from 'react';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 🎯 State สำหรับเก็บว่าตอนนี้เลือกดูห้องไหนอยู่ (ถ้าเป็น null จะแสดงหน้าเลือกห้องเรียน)
  const [selectedClass, setSelectedClass] = useState(null);

  // รายชื่อระดับชั้นเรียนทั้งหมดตามระบบของโรงเรียน
  const classList = [
    "อนุบาล1 ห้องปกติ", "อนุบาล1 ห้อง 3 ภาษา",
    "อนุบาล2 ห้องปกติ", "อนุบาล2 ห้อง 3 ภาษา",
    "อนุบาล3 ห้องปกติ", "อนุบาล3 ห้อง 3 ภาษา"
  ];

  // 📝 โครงสร้าง formData ดั้งเดิมของพี่
  const [formData, setFormData] = useState({ 
    Student_id: '', 
    Name: '', 
    Birthday: '', 
    Gender: 'ชาย', 
    Class_level: 'อนุบาล1 ห้องปกติ', 
    Blood_group: '', 
    User_id: 1,
    Image: '' 
  });
  
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  const resetForm = () => {
    setFormData({ 
      Student_id: '', 
      Name: '', 
      Birthday: '', 
      Gender: 'ชาย', 
      Class_level: selectedClass || 'อนุบาล1 ห้องปกติ', // ✨ ล็อกห้องให้อัตโนมัติตามห้องที่ครูกำลังเปิดดูอยู่
      Blood_group: '', 
      User_id: 1, 
      Image: '' 
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const fetchStudents = () => {
    fetch('http://localhost:3001/api/students')
      .then(res => {
        if (!res.ok) throw new Error("Server response not ok");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch(err => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("ขนาดไฟล์ภาพใหญ่เกินไป กรุณาเลือกภาพที่มีขนาดไม่เกิน 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, Image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const genderValue = formData.Gender === "หญิง" ? 2 : 1;

    const payload = {
      Name: formData.Name,
      Birthday: formData.Birthday,
      Class_level: formData.Class_level,
      Blood_group: formData.Blood_group || '',
      User_id: formData.User_id || 1,
      Image: formData.Image || '', 
      Gender: genderValue
    };

    fetch('http://localhost:3001/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error("Insert Failed");
      return res.json();
    })
    .then(() => {
      fetchStudents();
      setIsAddModalOpen(false);
      resetForm();
    })
    .catch(err => {
      console.error(err);
      alert("ไม่สามารถเพิ่มนักเรียนได้: โปรดตรวจสอบฐานข้อมูลหลังบ้าน");
    });
  };

  const handleOpenEditModal = (e, student) => {
    e.stopPropagation();
    const formattedBirthday = student.Birthday ? student.Birthday.split('T')[0] : '';
    const displayGender = (student.Gender === 2 || student.Gender === "2" || student.Gender === "หญิง") ? "หญิง" : "ชาย";
    const displayClass = student.Class_level || 'อนุบาล1 ห้องปกติ';

    setFormData({
      ...student,
      Birthday: formattedBirthday,
      Gender: displayGender,
      Class_level: displayClass,
      Image: student.Image || '',
      Blood_group: student.Blood_group || ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const genderValue = formData.Gender === "หญิง" ? 2 : 1;

    const payload = {
      ...formData,
      Gender: genderValue
    };

    fetch(`http://localhost:3001/api/students/${formData.Student_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      fetchStudents();
      setIsEditModalOpen(false);
      resetForm();
    })
    .catch(err => alert("ไม่สามารถแก้ไขข้อมูลได้สำเร็จ"));
  };

  const handleOpenDeleteModal = (e, id) => {
    e.stopPropagation();
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

  const handleOpenViewModal = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  const formatThaiDate = (dateString) => {
    if (!dateString) return 'ไม่ได้ระบุ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // 🔍 ฟังก์ชันคำนวณจำนวนนักเรียนในห้องเรียนนั้นๆ
  const getStudentCount = (className) => {
    return students.filter(s => s.Class_level === className).length;
  };

  // 📝 กรองรายชื่อเฉพาะเด็กที่อยู่ห้องที่ถูกคลิกเลือก
  const filteredStudents = students.filter(s => s.Class_level === selectedClass);

  return (
    <div style={styles.studentContainer}>
      <div style={styles.studentHeader}>
        <div style={styles.titleSection}>
          <button style={styles.btnTab} onClick={() => setSelectedClass(null)}>ระดับปฐมวัย</button>
          <h3 style={styles.headerTitle}>
            {selectedClass ? `รายชื่อนักเรียนชั้น: ${selectedClass}` : "จัดการข้อมูลนักเรียนระดับปฐมวัย (เลือกห้องเรียน)"}
          </h3>
        </div>
        {/* แสดงปุ่มควบคุมเมื่ออยู่ในห้องเรียนแล้วเท่านั้น */}
        {selectedClass && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.btnBack} onClick={() => setSelectedClass(null)}>⬅️ ย้อนกลับ</button>
            <button style={styles.btnValueAdd} onClick={handleOpenAddModal}>+ เพิ่มนักเรียนในห้องนี้</button>
          </div>
        )}
      </div>

      {/* ================= หน้าที่ 1: แสดงห้องเรียนทั้งหมด (เมื่อ selectedClass เป็น null) ================= */}
      {!selectedClass ? (
        <div style={styles.classGrid}>
          {classList.map((className) => (
            <div key={className} style={styles.classCard} onClick={() => setSelectedClass(className)}>
              <div style={styles.classIcon}>🏫</div>
              <h4 style={styles.classNameText}>{className}</h4>
              <p style={styles.classCountText}>นักเรียนในระบบ: <b>{getStudentCount(className)}</b> คน</p>
              <button style={styles.btnEnterClass}>คลิกเข้าดูรายชื่อ ➡️</button>
            </div>
          ))}
        </div>
      ) : (
        /* ================= หน้าที่ 2: แสดงรายชื่อนักเรียนในห้องที่เลือก (หน้าเดิมของพี่) ================= */
        <div style={styles.studentGrid}>
          {filteredStudents.map((student) => (
            <div style={styles.studentCard} key={student.Student_id} onClick={() => handleOpenViewModal(student)}>
              <div style={styles.cardInfo}>
                {student.Image ? (
                  <img src={student.Image} alt="student" style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarPlaceholder}><span>👤</span></div>
                )}
                <div style={styles.detailText}>
                  <h4 style={styles.studentNameText}>{student.Name || 'ชื่อ-นามสกุล'}</h4>
                  <p style={styles.studentLevelText}>ระดับชั้น: {student.Class_level || 'ไม่ได้ระบุ'}</p>
                </div>
              </div>
              <div style={styles.cardActions}>
                <button style={styles.btnEdit} onClick={(e) => handleOpenEditModal(e, student)}>แก้ไข</button>
                <button style={styles.btnDelete} onClick={(e) => handleOpenDeleteModal(e, student.Student_id)}>ลบ</button>
              </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <p style={{ color: '#999', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
              ยังไม่มีข้อมูลนักเรียนในห้องเรียนนี้ คุณครูสามารถกดปุ่ม "+ เพิ่มนักเรียนในห้องนี้" ด้านบนได้เลยครับ
            </p>
          )}
        </div>
      )}

      {/* ================= MODAL ทั้งหมดคงเดิมตามรูปแบบเดิมของพี่ร้อยเปอร์เซ็นต์ครับ ================= */}
      
      {/* MODAL: แสดงข้อมูลรายละเอียด */}
      {isViewModalOpen && viewingStudent && (
        <div style={styles.modalOverlay} onClick={() => setIsViewModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeX} onClick={() => setIsViewModalOpen(false)}>X</button>
            <h3 style={styles.modalHeading}>ข้อมูลนักเรียน</h3>
            <div style={styles.avatarUploadZone}>
              {viewingStudent.Image ? (
                <img src={viewingStudent.Image} alt="profile" style={{ ...styles.avatarImg, ...styles.avatarBig }} />
              ) : (
                <div style={{ ...styles.avatarPlaceholder, ...styles.avatarBig }}><span>👤</span></div>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>ชื่อ-นามสกุล</label>
              <div style={styles.infoDisplayBox}>{viewingStudent.Name || '-'}</div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>วันเกิด</label>
              <div style={styles.infoDisplayBox}>{formatThaiDate(viewingStudent.Birthday)}</div>
            </div>
            <div style={styles.formRow}>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.formLabel}>ระดับชั้น</label>
                <div style={styles.infoDisplayBox}>{viewingStudent.Class_level || '-'}</div>
              </div>
              <div style={{ ...styles.formGroup, flex: 1 }}>
                <label style={styles.formLabel}>เพศ</label>
                <div style={styles.infoDisplayBox}>
                  {(viewingStudent.Gender === 2 || viewingStudent.Gender === "2" || viewingStudent.Gender === "หญิง") ? 'หญิง' : 'ชาย'}
                </div>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>กรุ๊ปเลือด</label>
              <div style={styles.infoDisplayBox}>{viewingStudent.Blood_group || 'ไม่ได้ระบุ'}</div>
            </div>
            <button style={styles.btnSubmitSave} onClick={() => setIsViewModalOpen(false)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* MODAL: เพิ่มนักเรียนใหม่ */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeX} onClick={() => setIsAddModalOpen(false)}>X</button>
            <h3 style={styles.modalHeading}>เพิ่มนักเรียน</h3>
            <form onSubmit={handleAddSubmit}>
              <div style={styles.avatarUploadZone}>
                <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                  {formData.Image ? (
                    <img src={formData.Image} alt="preview" style={{ ...styles.avatarPlaceholder, ...styles.avatarBig, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ ...styles.avatarPlaceholder, ...styles.avatarBig }}>
                      <span style={{ fontSize: '18px' }}>📁<span>+</span></span>
                      <small style={{ fontSize: '9px', display: 'block' }}>อัปโหลดรูป</small>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
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
                  <select style={styles.formSelect} required value={formData.Class_level} onChange={(e) => setFormData({...formData, Class_level: e.target.value})}>
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ</label>
                  <select style={styles.formSelect} required value={formData.Gender} onChange={(e) => setFormData({...formData, Gender: e.target.value})}>
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

      {/* MODAL: แก้ไขข้อมูล */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeX} onClick={() => setIsEditModalOpen(false)}>X</button>
            <h3 style={styles.modalHeading}>แก้ไขนักเรียน</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.avatarUploadZone}>
                <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                  {formData.Image ? (
                    <img src={formData.Image} alt="preview" style={{ ...styles.avatarPlaceholder, ...styles.avatarBig, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ ...styles.avatarPlaceholder, ...styles.avatarBig }}>
                      <span style={{ fontSize: '18px' }}>📁<span>+</span></span>
                      <small style={{ fontSize: '9px', display: 'block' }}>อัปโหลดรูป</small>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
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
                  <select style={styles.formSelect} required value={formData.Class_level} onChange={(e) => setFormData({...formData, Class_level: e.target.value})}>
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
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

      {/* MODAL: ยืนยันลบ */}
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

// 🎨 นำสไตล์ดั้งเดิมของพี่มาใช้ทั้งหมด และเสริมในส่วนของ UI การแสดงผลกล่องห้องเรียนให้กลมกลืนกันครับ
const styles = {
  studentContainer: { padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh' },
  studentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  titleSection: { display: 'flex', flexDirection: 'column' },
  headerTitle: { marginTop: '15px', fontSize: '15px', color: '#000000', fontWeight: '600' },
  btnTab: { background: '#ffffff', border: '1px solid #cccccc', padding: '6px 30px', borderRadius: '6px', boxShadow: '0px 2px 4px rgba(0,0,0,0.08)', fontWeight: 'bold', cursor: 'pointer', width: 'fit-content' },
  btnValueAdd: { background: '#ffffff', border: '1px solid #000000', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  btnBack: { background: '#ffffff', border: '1px solid #cccccc', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  
  // 🏫 เพิ่มสไตล์สวยๆ มินิมอลสำหรับ Grid ห้องเรียนหน้าแรก (กลมกลืนกับธีมเดิมที่เป็นขาว-ดำ-เทา)
  classGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' },
  classCard: { background: '#ffffff', border: '1px solid #cccccc', borderRadius: '16px', padding: '25px', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s' },
  classIcon: { fontSize: '40px', marginBottom: '12px' },
  classNameText: { margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#000000' },
  classCountText: { margin: '0 0 18px 0', fontSize: '13px', color: '#666666' },
  btnEnterClass: { background: '#ffffff', border: '1px solid #cccccc', color: '#333333', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', fontSize: '12px', cursor: 'pointer', width: '100%' },

  studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  studentCard: { border: '1px solid #cccccc', borderRadius: '14px', padding: '15px', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'transform 0.2s' },
  cardInfo: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' },
  avatarPlaceholder: { border: '1px solid #cccccc', width: '52px', height: '52px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#555555', background: '#fcfcfc' },
  avatarImg: { width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cccccc' },
  avatarBig: { width: '65px', height: '65px', margin: '0 auto', display: 'block', borderRadius: '8px', objectFit: 'cover' },
  detailText: { display: 'flex', flexDirection: 'column' },
  studentNameText: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' },
  studentLevelText: { margin: '0', color: '#666666', fontSize: '13px' },
  cardActions: { display: 'flex', gap: '10px' },
  btnEdit: { flex: '1', padding: '6px', border: '1px solid #cccccc', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  btnDelete: { flex: '1', padding: '6px', border: '1px solid #cccccc', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  modalOverlay: { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '999' },
  modalContent: { background: '#ffffff', padding: '20px 25px', borderRadius: '16px', width: '320px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', boxSizing: 'border-box' },
  modalHeading: { margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' },
  closeX: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '15px', cursor: 'pointer', color: '#999999' },
  avatarUploadZone: { textAlign: 'center', marginBottom: '15px' },
  formGroup: { marginBottom: '10px', display: 'flex', flexDirection: 'column', width: '100%' },
  formLabel: { fontSize: '12px', color: '#555555', marginBottom: '4px', fontWeight: '500' },
  formInput: { padding: '6px 10px', border: '1px solid #cccccc', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', width: '100%' },
  formSelect: { padding: '6px 10px', border: '1px solid #cccccc', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#ffffff', boxSizing: 'border-box', width: '100%' },
  formRow: { display: 'flex', gap: '10px', width: '100%' },
  btnSubmitSave: { width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #333333', borderRadius: '8px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box' },
  modalDeleteContent: { background: '#ffffff', padding: '30px', borderRadius: '16px', width: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  modalDeleteActions: { display: 'flex', gap: '15px' },
  btnCancel: { flex: '1', padding: '8px', border: '1px solid #cccccc', background: '#ffffff', borderRadius: '6px', cursor: 'pointer' },
  btnConfirmDelete: { flex: '1', padding: '8px', border: '1px solid #000000', background: '#ffffff', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' },
  infoDisplayBox: { 
    padding: '6px 10px',
    border: '1px solid #e5e5e5', 
    borderRadius: '6px', 
    fontSize: '13px',
    background: '#f9f9f9', 
    color: '#333333', 
    height: '32px',
    boxSizing: 'border-box',
    width: '100%',
    display: 'flex', 
    alignItems: 'center'
  }
};

export default StudentManagement;