import React, { useState, useEffect, useRef } from 'react';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 📝 สเตตสำหรับระบบค้นหาชื่อผู้ปกครองอัตโนมัติ (Autocomplete)
  const [parentSearch, setParentSearch] = useState('');          // ข้อความที่พิมพ์ในช่อง
  const [suggestions, setSuggestions] = useState([]);            // รายชื่อที่ค้นหาเจอจาก API
  const [showSuggestions, setShowSuggestions] = useState(false);  // เปิด/ปิด กล่องรายชื่อแนะนำ
  const [isSelecting, setIsSelecting] = useState(false);          // สเตตป้องกันการดึงข้อมูลซ้ำซ้อนเมื่อเลือกแล้ว
  const suggestionRef = useRef(null);

  // 🔐 1. ดึงข้อมูลครูจาก localStorage
  const [teacherData, setTeacherData] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        return {
          classLevel: userObj.Class_level || userObj.class_level || null,
          userId: userObj.User_id || userObj.user_id || userObj.id || 1
        };
      } catch (e) {
        console.error("Error parsing user data:", e);
        return { classLevel: null, userId: 1 };
      }
    }
    return { classLevel: null, userId: 1 };
  });

  // 🎯 บังคับเลือกห้องเรียนของตัวเองทันทีตั้งแต่แรก
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

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isTeacher = currentUser?.Role === "ครูผู้สอน" || currentUser?.role === "ครูผู้สอน";

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

  // 🔐 ตั้งค่าฟอร์มเริ่มต้น
  const [formData, setFormData] = useState({
    Student_id: '',
    Name: '',
    Birthday: '',
    Gender: 'ชาย',
    Class_level: selectedClass,
    Blood_group: '',
    User_id: teacherData.userId,
    Image: ''
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      Class_level: selectedClass
    }));
  }, [selectedClass]);

  // 🔍 ค้นหารายชื่อผู้ปกครองมากรองหน้าบ้าน
  useEffect(() => {
    // ถ้าอยู่ระหว่างดึงข้อมูลแรกเข้า หรือเพิ่งกดเลือกผู้ปกครอง จะไม่ดึง API ซ้ำ
    if (isSelecting || parentSearch.includes('กำลังโหลด')) {
      return;
    }

    if (parentSearch.trim().length >= 2) {
      fetch(`http://localhost:3001/users`)
        .then(res => {
          if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
          return res.json();
        })
        .then(allUsers => {
          if (Array.isArray(allUsers)) {
            const filtered = allUsers.filter(user => {
              // 🛠️ จุดแก้ไขสำคัญ: รองรับทั้ง .Name และ .name ของ Object หลังบ้าน
              const userName = user.Name || user.name || '';
              return userName.toLowerCase().includes(parentSearch.toLowerCase());
            });
            setSuggestions(filtered);
          }
        })
        .catch(err => {
          console.error("Error searching parents:", err);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [parentSearch, isSelecting]);

  // คลิกปิดกล่องรายชื่อแนะนำเมื่อกดพื้นที่อื่นนอกเหนือจากตัวเลือก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingParentName, setViewingParentName] = useState('');

  const resetForm = () => {
    setFormData({
      Student_id: '',
      Name: '',
      Birthday: '',
      Gender: 'ชาย',
      Class_level: selectedClass,
      Blood_group: '',
      User_id: '',
      Image: ''
    });
    setParentSearch('');
    setSuggestions([]);
    setIsSelecting(false);
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
      Class_level: selectedClass,
      Blood_group: formData.Blood_group || '',
      User_id: formData.User_id,
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
        alert("ไม่สามารถเพิ่มนักเรียนได้");
      });
  };

  const handleOpenEditModal = (e, student) => {
    e.stopPropagation();
    setIsSelecting(true); // ล็อคชั่วคราวไม่ให้ useEffect ทำงานตอนโหลดชื่อแรกเข้า
    const formattedBirthday = student.Birthday ? student.Birthday.split('T')[0] : '';
    const displayGender = (student.Gender === 2 || student.Gender === "2" || student.Gender === "หญิง") ? "หญิง" : "ชาย";

    setFormData({
      ...student,
      Birthday: formattedBirthday,
      Gender: displayGender,
      Class_level: selectedClass || student.Class_level,
      Image: student.Image || '',
      Blood_group: student.Blood_group || '',
      User_id: student.User_id
    });

    setParentSearch('กำลังโหลดชื่อผู้ปกครอง...');
    fetch(`http://localhost:3001/users/${student.User_id}`)
      .then(res => {
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        return res.json();
      })
      .then(data => {
        setParentSearch(data.Name || data.name || '');
        setIsSelecting(false); // ปลดล็อคเพื่อให้ผู้ใช้พิมพ์แก้ไขค้นหาได้ต่อ
      })
      .catch(() => {
        setParentSearch('');
        setIsSelecting(false);
      });

    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (!formData.User_id) {
      alert("กรุณาเลือกผู้ปกครองจากรายการค้นหาให้ถูกต้อง");
      return;
    }

    const genderValue = formData.Gender === "หญิง" ? 2 : 1;
    const payload = {
      Name: formData.Name,
      Birthday: formData.Birthday,
      Class_level: selectedClass,
      Blood_group: formData.Blood_group || '',
      User_id: formData.User_id,
      Image: formData.Image || '',
      Gender: genderValue
    };

    fetch(`http://localhost:3001/api/students/${formData.Student_id}`, {
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
    setViewingParentName('กำลังโหลดชื่อผู้ปกครอง...');
    setIsViewModalOpen(true);

    fetch(`http://localhost:3001/users/${student.User_id}`)
      .then(res => {
        if (!res.ok) throw new Error("ไม่พบข้อมูลผู้ปกครอง");
        return res.json();
      })
      .then(parentData => {
        if (parentData) {
          setViewingParentName(parentData.Name || parentData.name || '-');
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setViewingParentName(`รหัสผู้ปกครอง: ${student.User_id}`);
      });
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

  const handleSelectParent = (parent) => {
    setIsSelecting(true); // ล็อคเพื่อแจ้งว่าเป็นการเลือก ไม่ใช่การพิมพ์ค้นหาใหม่
    const parentId = parent.User_id || parent.id || parent.user_id;
    const parentName = parent.Name || parent.name;

    setParentSearch(parentName);
    setFormData(prev => ({ ...prev, User_id: parentId }));
    setShowSuggestions(false);

    // ตั้งหน่วงเวลาเล็กน้อยเพื่อให้ UI อัปเดตเสร็จก่อนปลดล็อคพิมพ์ค้นหาใหม่
    setTimeout(() => {
      setIsSelecting(false);
    }, 200);
  };

  const filteredStudents = students.filter(
    s => s.Class_level === selectedClass
  );

  return (
    <div style={styles.studentContainer}>
      <div style={styles.studentHeader}>
        <div style={styles.titleSection}>
          <h2 style={styles.headerTitle}>
            <h2>แจ้งเตือนการบ้าน : {selectedClass} </h2>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.btnValueAdd} onClick={handleOpenAddModal}>+ เพิ่มนักเรียนในห้องนี้</button>
        </div>
      </div>

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
            ยังไม่มีข้อมูลนักเรียนในห้องเรียนนี้ คุณครูสามารถกดปุ่ม "+ เพิ่มนักเรียนในห้องนี้" ได้เลยครับ
          </p>
        )}
      </div>

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
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>ชื่อผู้ปกครอง</label>
              <div style={styles.infoDisplayBox}>{viewingParentName}</div>
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
                <input type="text" required style={styles.formInput} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.Birthday} onChange={(e) => setFormData({ ...formData, Birthday: e.target.value })} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <select
                    style={{ ...styles.formSelect, backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    disabled={true}
                    required
                    value={formData.Class_level}
                    onChange={(e) => setFormData({ ...formData, Class_level: e.target.value })}
                  >
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

              <div style={{ ...styles.formGroup, position: 'relative' }} ref={suggestionRef}>
                <label style={styles.formLabel}>ชื่อผู้ปกครอง (พิมพ์ค้นหาอย่างน้อย 2 ตัวอักษร)</label>
                <input
                  type="text"
                  required
                  placeholder="ค้นหาชื่อผู้ปกครอง..."
                  style={styles.formInput}
                  value={parentSearch}
                  onChange={(e) => {
                    setParentSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <ul style={styles.suggestionList}>
                    {suggestions.map((p) => (
                      <li
                        key={p.User_id || p.id}
                        style={styles.suggestionItem}
                        onClick={() => handleSelectParent(p)}
                      >
                        {p.Name || p.name} <span style={{ fontSize: '11px', color: '#999' }}>(ID: {p.User_id || p.id})</span>
                      </li>
                    ))}
                  </ul>
                )}
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
            <button style={styles.closeX} onClick={() => { setIsEditModalOpen(false); resetForm(); }}>X</button>
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
                <input type="text" required style={styles.formInput} value={formData.Name} onChange={(e) => setFormData({ ...formData, Name: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด</label>
                <input type="date" required style={styles.formInput} value={formData.Birthday} onChange={(e) => setFormData({ ...formData, Birthday: e.target.value })} />
              </div>
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <select
                    style={{ ...styles.formSelect, backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                    disabled={true}
                    required
                    value={formData.Class_level}
                    onChange={(e) => setFormData({ ...formData, Class_level: e.target.value })}
                  >
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
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>

              <div style={{ ...styles.formGroup, position: 'relative' }} ref={suggestionRef}>
                <label style={styles.formLabel}>ชื่อผู้ปกครอง (พิมพ์ค้นหาเพื่อเปลี่ยนคนใหม่)</label>
                <input
                  type="text"
                  required
                  placeholder="พิมพ์เพื่อค้นหาชื่อผู้ปกครองใหม่..."
                  style={styles.formInput}
                  value={parentSearch}
                  onChange={(e) => {
                    setParentSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />

                {showSuggestions && suggestions.length > 0 && (
                  <ul style={styles.suggestionList}>
                    {suggestions.map((p) => (
                      <li
                        key={p.User_id || p.id || p.user_id}
                        style={styles.suggestionItem}
                        onClick={() => handleSelectParent(p)}
                      >
                        {p.Name || p.name} <span style={{ fontSize: '11px', color: '#999' }}>(ID: {p.User_id || p.id || p.user_id})</span>
                      </li>
                    ))}
                  </ul>
                )}
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

const styles = {
  studentContainer: { padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#dff3ff 48%', minHeight: '100vh' },
  studentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' },
  titleSection: { display: 'flex', flexDirection: 'column' },
  headerTitle: { marginTop: '15px', fontSize: '15px', color: '#000000', fontWeight: '600' },
  btnValueAdd: { background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: '1px solid #0284c7', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', boxShadow: '0 10px 22px rgba(14,165,233,0.22)' },
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
  btnEdit: { flex: '1', padding: '8px 12px', border: '1px solid #bae6fd', background: '#eff8ff', color: '#0369a1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  btnDelete: { flex: '1', padding: '8px 12px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
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
  btnSubmitSave: { width: '100%', padding: '10px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: '1px solid #0284c7', borderRadius: '8px', fontWeight: '700', marginTop: '10px', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box', boxShadow: '0 10px 22px rgba(14,165,233,0.22)' },
  modalDeleteContent: { background: '#ffffff', padding: '30px', borderRadius: '16px', width: '300px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' },
  modalDeleteActions: { display: 'flex', gap: '15px' },
  btnCancel: { flex: '1', padding: '8px 12px', border: '1px solid #cfe8f7', background: '#ffffff', color: '#31556b', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  btnConfirmDelete: { flex: '1', padding: '8px 12px', border: '1px solid #fecdd3', background: '#fff1f2', color: '#be123c', fontWeight: '700', borderRadius: '8px', cursor: 'pointer' },
  infoDisplayBox: { padding: '6px 10px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', background: '#f9f9f9', color: '#333333', height: '32px', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center' },

  suggestionList: {
    position: 'absolute', top: '100%', left: 0, right: 0, padding: 0, margin: '4px 0 0 0',
    background: '#ffffff', border: '1px solid #cccccc', borderRadius: '6px', listStyle: 'none',
    maxHeight: '120px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  suggestionItem: {
    padding: '8px 10px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0'
  }
};

export default StudentManagement;