import React, { useState, useEffect, useRef } from 'react';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [parentsList, setParentsList] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 📝 สเตตสำหรับระบบค้นหาชื่อผู้ปกครอง
  const [parentSearch, setParentSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  // 🔐 ดึงข้อมูลครูจาก localStorage
  const [teacherData] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        return {
          classLevel: userObj.Class_level || userObj.class_level || null,
          userId: userObj.User_id || userObj.user_id || userObj.id || 1
        };
      } catch (e) {
        return { classLevel: null, userId: 1 };
      }
    }
    return { classLevel: null, userId: 1 };
  });

  const [selectedClass, setSelectedClass] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        return userObj.Class_level || userObj.class_level || 'อนุบาล1 ห้องปกติ';
      } catch (e) {
        return 'อนุบาล1 ห้องปกติ';
      }
    }
    return 'อนุบาล1 ห้องปกติ';
  });

  useEffect(() => {
    if (teacherData.classLevel) {
      setSelectedClass(teacherData.classLevel);
    }
  }, [teacherData.classLevel]);

  const classList = [
    "อนุบาล1 ห้องปกติ", "อนุบาล1 ห้อง 3 ภาษา",
    "อนุบาล2 ห้องปกติ", "อนุบาล2 ห้อง 3 ภาษา",
    "อนุบาล3 ห้องปกติ", "อนุบาล3 ห้อง 3 ภาษา"
  ];

  // ฟอร์มเริ่มต้น
  const [formData, setFormData] = useState({
    Student_id: '',
    Name: '',
    Birthday: '',
    Gender: 'ชาย',
    Class_level: selectedClass,
    Blood_group: '',
    User_id: null,
    Image: ''
  });

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingParentName, setViewingParentName] = useState('');

  // 🔄 ล้างค่าฟอร์มทั้งหมด
  const resetForm = () => {
    setFormData({
      Student_id: '',
      Name: '',
      Birthday: '',
      Gender: 'ชาย',
      Class_level: selectedClass,
      Blood_group: '',
      User_id: null,
      Image: ''
    });
    setParentSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // 🔄 ดึงข้อมูลนักเรียน
  const fetchStudents = () => {
    fetch('http://localhost:3001/api/students')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStudents(data); })
      .catch(err => console.error("Error fetching students:", err));
  };


  // ฟังก์ชันช่วยใส่คำนำหน้าตามเพศ (ชาย -> เด็กชาย, หญิง -> เด็กหญิง)
  const formatStudentNameWithPrefix = (name, gender) => {
    if (!name) return '';
    // ลบคำนำหน้าเดิมออกก่อนเพื่อป้องกันคำนำหน้าซ้ำซ้อน
    const cleanName = name.replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว)/g, '').trim();
    const prefix = (gender === 'หญิง' || gender === 2 || gender === '2') ? 'เด็กหญิง' : 'เด็กชาย';
    return `${prefix}${cleanName}`;
  };

  // ฟังก์ชันช่วยตัดคำนำหน้าออก (ใช้สำหรับนำชื่อใส่ฟอร์มแก้ไข)
  const removePrefixFromName = (name) => {
    if (!name) return '';
    return name.replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว)/g, '').trim();
  };

  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, []);

  // 🔄 ดึงรายชื่อผู้ปกครองทั้งหมด (เพิ่ม Console log ตรวจสอบ)
  const fetchParents = () => {
    fetch('http://localhost:3001/api/parents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParentsList(data);
          console.log("ดึงข้อมูลผู้ปกครองสำเร็จ:", data);
        }
      })
      .catch(err => console.error("Error fetching parents:", err));
  };

  // 🔍 พิมพ์ค้นหาผู้ปกครอง (ปรับให้พิมพ์แค่ 1 ตัวอักษรขึ้นไปก็ค้นเจอ)
  const handleParentSearchChange = (e) => {
    const query = e.target.value;
    setParentSearch(query);

    if (!query.trim()) {
      setFormData(prev => ({ ...prev, User_id: null }));
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // พิมพ์ 1 ตัวอักษรขึ้นไปให้ค้นหาทันที
    if (query.trim().length >= 1) {
      const searchTerm = query.toLowerCase().replace(/\s+/g, ''); // ตัดช่องว่างออกเพื่อให้ค้นหาง่ายขึ้น

      const filtered = parentsList.filter(p => {
        const parentName = (p.Name || p.name || '').toLowerCase().replace(/\s+/g, '');
        return parentName.includes(searchTerm);
      });

      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // เลือกผู้ปกครองจากรายการ
  const handleSelectParent = (parent) => {
    const parentId = parent.User_id || parent.id || parent.user_id;
    const parentName = parent.Name || parent.name || parent.fullname || parent.Firstname || '';

    setParentSearch(parentName);
    setFormData(prev => ({ ...prev, User_id: parentId }));
    setShowSuggestions(false);
  };

  // คลิกข้างนอกเพื่อปิดดร็อปดาวน์
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // เปิด Modal เพิ่ม
  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("ขนาดไฟล์ภาพใหญ่เกินไป กรุณาเลือกภาพไม่เกิน 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, Image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  // ➕ บันทึกเพิ่มนักเรียน
  // ➕ บันทึกเพิ่มนักเรียน
  const handleAddSubmit = (e) => {
    e.preventDefault();
    const genderValue = formData.Gender === "หญิง" ? 2 : 1;
    const formattedName = formatStudentNameWithPrefix(formData.Name, formData.Gender);

    const payload = {
      Name: formattedName,
      Birthday: formData.Birthday,
      Class_level: selectedClass,
      Blood_group: formData.Blood_group || '',
      User_id: null, // ⚡ เซตเป็น null เสมอเนื่องจากไม่มีการเลือกผู้ปกครองในขั้นตอนเพิ่ม
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
        alert("เพิ่มข้อมูลนักเรียนสำเร็จ");
      })
      .catch(err => {
        console.error(err);
        alert("ไม่สามารถเพิ่มนักเรียนได้");
      });
  };

  // ✏️ เปิด Modal แก้ไข (ตัดคำนำหน้าออกจากช่องกรอกเพื่อความสะดวกในการแก้ไข)
  const handleOpenEditModal = (e, student) => {
    e.stopPropagation();
    const studentId = student.Student_id || student.student_id;
    const parentId = student.User_id || student.user_id || null;

    const formattedBirthday = student.Birthday ? student.Birthday.split('T')[0] : '';
    const displayGender = (student.Gender === 2 || student.Gender === "2" || student.Gender === "หญิง") ? "หญิง" : "ชาย";

    setFormData({
      Student_id: studentId,
      Name: removePrefixFromName(student.Name || ''), // ⚡ ตัดคำนำหน้าเดิมออก ให้ผู้ใช้แก้แค่ชื่อ-นามสกุล
      Birthday: formattedBirthday,
      Gender: displayGender,
      Class_level: selectedClass || student.Class_level,
      Image: student.Image || '',
      Blood_group: student.Blood_group || '',
      User_id: parentId
    });

    // ... (โค้ดดึงผู้ปกครองคงเดิม) ...
    setIsEditModalOpen(true);
  };

  // ✏️ บันทึกแก้ไขนักเรียน
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const studentId = formData.Student_id;

    if (!studentId) {
      alert("ไม่พบรหัสนักเรียน กรุณาลองใหม่อีกครั้ง");
      return;
    }

    const genderValue = formData.Gender === "หญิง" ? 2 : 1;
    // ⚡ เติมคำนำหน้ากลับเข้าไปอัตโนมัติก่อนบันทึก
    const formattedName = formatStudentNameWithPrefix(formData.Name, formData.Gender);

    const payload = {
      Name: formattedName,
      Birthday: formData.Birthday,
      Class_level: selectedClass,
      Blood_group: formData.Blood_group || '',
      User_id: formData.User_id ? parseInt(formData.User_id, 10) : null,
      Image: formData.Image || '',
      Gender: genderValue
    };

    fetch(`http://localhost:3001/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("อัปเดตไม่สำเร็จ");
        return res.json();
      })
      .then(() => {
        fetchStudents();
        setIsEditModalOpen(false);
        resetForm();
        alert("อัปเดตข้อมูลนักเรียนสำเร็จ");
      })
      .catch(err => {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      });
  };

  const handleOpenDeleteModal = (e, id) => {
    e.stopPropagation();
    setSelectedStudentId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    fetch(`http://localhost:3001/api/students/${selectedStudentId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        fetchStudents();
        setIsDeleteModalOpen(false);
      })
      .catch(err => console.error(err));
  };

  // 👁️ ดูรายละเอียด
  const handleOpenViewModal = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);

    const parentId = student.User_id || student.user_id;
    if (parentId) {
      const parentObj = parentsList.find(p => String(p.User_id || p.id || p.user_id) === String(parentId));
      if (parentObj) {
        setViewingParentName(parentObj.Name || parentObj.name || parentObj.fullname || '-');
      } else {
        fetch(`http://localhost:3001/users/${parentId}`)
          .then(res => res.json())
          .then(pData => setViewingParentName(pData.Name || pData.name || '-'))
          .catch(() => setViewingParentName('ไม่ได้ระบุผู้ปกครอง'));
      }
    } else {
      setViewingParentName('ไม่ได้ระบุผู้ปกครอง');
    }
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

  const filteredStudents = students.filter(s => s.Class_level === selectedClass);

  return (
    <div style={styles.studentContainer}>
      <div style={styles.studentHeader}>
        <div style={styles.titleSection}>
          <h2 style={{ margin: 10, color: '#0369a1' }}>ข้อมูลนักเรียน : {selectedClass} </h2>
        </div>
        <div>
          <button style={styles.btnValueAdd} onClick={handleOpenAddModal}>+ เพิ่มนักเรียนในห้องนี้</button>
        </div>
      </div>

      <div style={styles.studentGrid}>
        {filteredStudents.map((student) => (
          <div style={styles.studentCard} key={student.Student_id || student.student_id} onClick={() => handleOpenViewModal(student)}>
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
              <button style={styles.btnDelete} onClick={(e) => handleOpenDeleteModal(e, student.Student_id || student.student_id)}>ลบ</button>
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <p style={{ color: '#999', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            ยังไม่มีข้อมูลนักเรียนในห้องเรียนนี้
          </p>
        )}
      </div>

      {/* MODAL: รายละเอียด */}
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
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>ชื่อผู้ปกครอง</label>
              <div style={styles.infoDisplayBox}>{viewingParentName}</div>
            </div>
            <button style={styles.btnSubmitSave} onClick={() => setIsViewModalOpen(false)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* MODAL: เพิ่มนักเรียน */}
      {/* MODAL: เพิ่มนักเรียน */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeX} onClick={() => { setIsAddModalOpen(false); resetForm(); }}>X</button>
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
                <input type="text" required style={styles.formInput} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.Birthday} onChange={(e) => setFormData({ ...formData, Birthday: e.target.value })} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <select style={{ ...styles.formSelect, backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} disabled required value={formData.Class_level}>
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ</label>
                  <select style={styles.formSelect} required value={formData.Gender} onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select style={styles.formSelect} value={formData.Blood_group} onChange={(e) => setFormData({ ...formData, Blood_group: e.target.value })}>
                  <option value="">เลือกกรุ๊ปเลือด</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>

              {/* ตัดส่วนค้นหาผู้ปกครองในหน้าเพิ่มนักเรียนออกแล้ว */}

              <button type="submit" style={styles.btnSubmitSave}>บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: แก้ไขนักเรียน */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeX} onClick={() => { setIsEditModalOpen(false); resetForm(); }}>X</button>
            <h3 style={styles.modalHeading}>แก้ไขข้อมูลนักเรียน</h3>
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
                <input type="text" required style={styles.formInput} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.Birthday} onChange={(e) => setFormData({ ...formData, Birthday: e.target.value })} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <select style={{ ...styles.formSelect, backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} disabled required value={formData.Class_level}>
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ</label>
                  <select style={styles.formSelect} value={formData.Gender} onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}>
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select style={styles.formSelect} value={formData.Blood_group} onChange={(e) => setFormData({ ...formData, Blood_group: e.target.value })}>
                  <option value="">เลือกกรุ๊ปเลือด</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>

              {/* ค้นหาผู้ปกครอง (แก้ไข) */}
              <div style={{ ...styles.formGroup, position: 'relative' }} ref={suggestionRef}>
                <label style={styles.formLabel}>ผู้ปกครอง</label>
                <input
                  type="text"
                  placeholder="พิมพ์ค้นหาชื่อผู้ปกครอง (3 ตัวอักษรขึ้นไป)..."
                  style={styles.formInput}
                  value={parentSearch}
                  onChange={handleParentSearchChange}
                  onFocus={() => { if (parentSearch.trim().length >= 3) setShowSuggestions(true); }}
                />

                {showSuggestions && (
                  <ul style={styles.suggestionList}>
                    {suggestions.length > 0 ? (
                      suggestions.map((p, index) => {
                        const pName = p.Name || p.name || p.fullname || p.Firstname || 'ไม่ทราบชื่อ';
                        const pId = p.User_id || p.id || p.user_id;
                        return (
                          <li key={pId || index} style={styles.suggestionItem} onClick={() => handleSelectParent(p)}>
                            <span><b>{pName}</b></span>
                            {pId && <small style={{ color: '#0284c7' }}> ID: {pId}</small>}
                          </li>
                        );
                      })
                    ) : (
                      <li style={{ padding: '10px', color: '#888', textAlign: 'center', fontSize: '13px' }}>
                        ไม่พบรายชื่อผู้ปกครองที่ค้นหา
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <button type="submit" style={styles.btnSubmitSave}>บันทึกการแก้ไข</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ลบ */}
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
  studentContainer: { padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#dff3ff', minHeight: '100vh' },
  studentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  titleSection: { display: 'flex', flexDirection: 'column' },
  btnValueAdd: { background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  studentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  studentCard: { border: '1px solid #e0e0e0', borderRadius: '14px', padding: '15px', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' },
  cardInfo: { display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' },
  avatarPlaceholder: { border: '1px solid #cccccc', width: '52px', height: '52px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#555555', background: '#fcfcfc' },
  avatarImg: { width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cccccc' },
  avatarBig: { width: '65px', height: '65px', margin: '0 auto', display: 'block', borderRadius: '8px', objectFit: 'cover' },
  detailText: { display: 'flex', flexDirection: 'column' },
  studentNameText: { margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' },
  studentLevelText: { margin: '0', color: '#666666', fontSize: '13px' },
  cardActions: { display: 'flex', gap: '10px' },
  btnEdit: { flex: '1', padding: '8px', border: '1px solid #bae6fd', background: '#eff8ff', color: '#0369a1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnDelete: { flex: '1', padding: '8px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  modalOverlay: { position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '9999' },
  modalContent: { background: '#ffffff', padding: '20px 25px', borderRadius: '16px', width: '340px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box', overflow: 'visible' },
  modalHeading: { margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' },
  closeX: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#999999' },
  avatarUploadZone: { textAlign: 'center', marginBottom: '15px' },
  formGroup: { marginBottom: '12px', display: 'flex', flexDirection: 'column', width: '100%' },
  formLabel: { fontSize: '12px', color: '#555555', marginBottom: '4px', fontWeight: '600' },
  formInput: { padding: '8px 10px', border: '1px solid #cccccc', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', width: '100%' },
  formSelect: { padding: '8px 10px', border: '1px solid #cccccc', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#ffffff', boxSizing: 'border-box', width: '100%' },
  formRow: { display: 'flex', gap: '10px', width: '100%' },
  btnSubmitSave: { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', marginTop: '10px', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  modalDeleteContent: { background: '#ffffff', padding: '30px', borderRadius: '16px', width: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  modalDeleteActions: { display: 'flex', gap: '15px' },
  btnCancel: { flex: '1', padding: '8px 12px', border: '1px solid #cfe8f7', background: '#ffffff', color: '#31556b', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  btnConfirmDelete: { flex: '1', padding: '8px 12px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', fontWeight: '700', borderRadius: '8px', cursor: 'pointer' },
  infoDisplayBox: { padding: '8px 10px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', background: '#f9f9f9', color: '#333333', minHeight: '34px', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center' },
  suggestionList: {
    position: 'absolute', top: '100%', left: 0, right: 0, padding: '4px 0', margin: '4px 0 0 0',
    background: '#ffffff', border: '1px solid #0284c7', borderRadius: '8px', listStyle: 'none',
    maxHeight: '160px', overflowY: 'auto', zIndex: 99999, boxShadow: '0 8px 18px rgba(0,0,0,0.2)'
  },
  suggestionItem: {
    padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', color: '#333333'
  }
};

export default StudentManagement;