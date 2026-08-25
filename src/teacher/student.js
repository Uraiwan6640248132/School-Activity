import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  X,
  Search,
  User,
  Calendar,
  MapPin,
  Heart,
  Droplet,
  School,
  Image as ImageIcon,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  UserCheck,
  Phone,
  Mail
} from 'lucide-react';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [parentsList, setParentsList] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [parentSearch, setParentSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

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

  const fetchStudents = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/students')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStudents(data); })
      .catch(err => console.error("Error fetching students:", err))
      .finally(() => setLoading(false));
  };

  const formatStudentNameWithPrefix = (name, gender) => {
    if (!name) return '';
    const cleanName = name.replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว)/g, '').trim();
    const prefix = (gender === 'หญิง' || gender === 2 || gender === '2') ? 'เด็กหญิง' : 'เด็กชาย';
    return `${prefix}${cleanName}`;
  };

  const removePrefixFromName = (name) => {
    if (!name) return '';
    return name.replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว)/g, '').trim();
  };

  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, []);

  const fetchParents = () => {
    fetch('http://localhost:3001/api/parents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setParentsList(data);
        }
      })
      .catch(err => console.error("Error fetching parents:", err));
  };

  const handleParentSearchChange = (e) => {
    const query = e.target.value;
    setParentSearch(query);

    if (!query.trim()) {
      setFormData(prev => ({ ...prev, User_id: null }));
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (query.trim().length >= 1) {
      const searchTerm = query.toLowerCase().replace(/\s+/g, '');
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

  const handleSelectParent = (parent) => {
    const parentId = parent.User_id || parent.id || parent.user_id;
    const parentName = parent.Name || parent.name || parent.fullname || parent.Firstname || '';

    setParentSearch(parentName);
    setFormData(prev => ({ ...prev, User_id: parentId }));
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const genderValue = formData.Gender === "หญิง" ? 2 : 1;
    const formattedName = formatStudentNameWithPrefix(formData.Name, formData.Gender);

    const payload = {
      Name: formattedName,
      Birthday: formData.Birthday,
      Class_level: selectedClass,
      Blood_group: formData.Blood_group || '',
      User_id: null,
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

  const handleOpenEditModal = (e, student) => {
    e.stopPropagation();
    const studentId = student.Student_id || student.student_id;
    const parentId = student.User_id || student.user_id || null;

    const formattedBirthday = student.Birthday ? student.Birthday.split('T')[0] : '';
    const displayGender = (student.Gender === 2 || student.Gender === "2" || student.Gender === "หญิง") ? "หญิง" : "ชาย";

    setFormData({
      Student_id: studentId,
      Name: removePrefixFromName(student.Name || ''),
      Birthday: formattedBirthday,
      Gender: displayGender,
      Class_level: selectedClass || student.Class_level,
      Image: student.Image || '',
      Blood_group: student.Blood_group || '',
      User_id: parentId
    });

    if (parentId) {
      const parent = parentsList.find(p => String(p.User_id || p.id || p.user_id) === String(parentId));
      setParentSearch(parent ? (parent.Name || parent.name || '') : '');
    } else {
      setParentSearch('');
    }

    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const studentId = formData.Student_id;

    if (!studentId) {
      alert("ไม่พบรหัสนักเรียน กรุณาลองใหม่อีกครั้ง");
      return;
    }

    const genderValue = formData.Gender === "หญิง" ? 2 : 1;
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
  const getGenderLabel = (gender) => {
    if (gender === 2 || gender === "2" || gender === "หญิง") return "หญิง";
    return "ชาย";
  };

  const getGenderIcon = (gender) => {
    const isFemale = gender === 2 || gender === "2" || gender === "หญิง";
    return isFemale ? "👩" : "👦";
  };

  if (loading && students.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลนักเรียน...</p>
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
              <Users size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>จัดการข้อมูลนักเรียน</h1>
              <p style={styles.subTitle}>
                <School size={14} color="#4A90D9" />
                {selectedClass} · {filteredStudents.length} คน
              </p>
            </div>
          </div>
          <button style={styles.btnPrimary} onClick={handleOpenAddModal}>
            <UserPlus size={18} />
            เพิ่มนักเรียน
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#EBF3FB' }}>
              <Users size={20} color="#4A90D9" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>นักเรียนทั้งหมด</span>
              <span style={styles.statValue}>{filteredStudents.length} คน</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#E8F8ED' }}>
              <UserCheck size={20} color="#27AE60" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>มีผู้ปกครอง</span>
              <span style={styles.statValue}>
                {filteredStudents.filter(s => s.User_id).length} คน
              </span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#FDF2E9' }}>
              <School size={20} color="#E67E22" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>ระดับชั้น</span>
              <span style={styles.statValue}>{selectedClass}</span>
            </div>
          </div>
        </div>

        {/* Student Grid */}
        <div style={styles.studentGrid}>
          {filteredStudents.length === 0 ? (
            <div style={styles.emptyState}>
              <Users size={56} color="#CBD5E1" />
              <p style={styles.emptyText}>ยังไม่มีข้อมูลนักเรียน</p>
              <p style={styles.emptySubText}>คลิกปุ่ม "เพิ่มนักเรียน" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.Student_id || student.student_id}
                style={styles.studentCard}
                onClick={() => handleOpenViewModal(student)}
              >
                <div style={styles.cardTop}>
                  <div style={styles.cardImageWrapper}>
                    {student.Image ? (
                      <img src={student.Image} alt="student" style={styles.cardImage} />
                    ) : (
                      <div style={styles.cardImagePlaceholder}>
                        {getGenderIcon(student.Gender)}
                      </div>
                    )}
                  </div>
                  <div style={styles.cardInfo}>
                    <h4 style={styles.cardName}>{student.Name || 'ชื่อ-นามสกุล'}</h4>
                    <div style={styles.cardMeta}>
                      <span style={styles.cardMetaItem}>
                        <School size={12} color="#94A3B8" />
                        {student.Class_level || 'ไม่ได้ระบุ'}
                      </span>
                      <span style={styles.cardMetaItem}>
                        <Droplet size={12} color="#94A3B8" />
                        {student.Blood_group || '-'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.viewBtn}
                    onClick={(e) => { e.stopPropagation(); handleOpenViewModal(student); }}
                  >
                    <Eye size={14} />
                    ดู
                  </button>
                  <button
                    style={styles.editBtn}
                    onClick={(e) => handleOpenEditModal(e, student)}
                  >
                    <Edit2 size={14} />
                    แก้ไข
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => handleOpenDeleteModal(e, student.Student_id || student.student_id)}
                  >
                    <Trash2 size={14} />
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Modal - แก้ไขให้ข้อมูลแสดงแบบบรรทัดเดียวชิดซ้าย */}
      {isViewModalOpen && viewingStudent && (
        <div style={styles.modalOverlay} onClick={() => setIsViewModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={20} color="#4A90D9" />
                รายละเอียดนักเรียน
              </h2>
              <button onClick={() => setIsViewModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.viewContent}>
              <div style={styles.viewAvatar}>
                {viewingStudent.Image ? (
                  <img src={viewingStudent.Image} alt="profile" style={styles.viewAvatarImg} />
                ) : (
                  <div style={styles.viewAvatarPlaceholder}>
                    {getGenderIcon(viewingStudent.Gender)}
                  </div>
                )}
              </div>
              <div style={styles.viewInfo}>
                {/* แก้ไข: ใช้ flexDirection: 'column' และ justifyContent: 'flex-start' */}
                <div style={styles.viewItem}>
                  <span style={styles.viewLabel}>ชื่อ-นามสกุล</span>
                  <span style={styles.viewValue}>{viewingStudent.Name || '-'}</span>
                </div>
                <div style={styles.viewItem}>
                  <span style={styles.viewLabel}>วันเกิด</span>
                  <span style={styles.viewValue}>{formatThaiDate(viewingStudent.Birthday)}</span>
                </div>
                <div style={styles.viewRow}>
                  <div style={{ ...styles.viewItem, flex: 1 }}>
                    <span style={styles.viewLabel}>ระดับชั้น</span>
                    <span style={styles.viewValue}>{viewingStudent.Class_level || '-'}</span>
                  </div>
                  <div style={{ ...styles.viewItem, flex: 1 }}>
                    <span style={styles.viewLabel}>เพศ</span>
                    <span style={styles.viewValue}>
                      {getGenderIcon(viewingStudent.Gender)} {getGenderLabel(viewingStudent.Gender)}
                    </span>
                  </div>
                </div>
                <div style={styles.viewItem}>
                  <span style={styles.viewLabel}>กรุ๊ปเลือด</span>
                  <span style={styles.viewValue}>{viewingStudent.Blood_group || 'ไม่ได้ระบุ'}</span>
                </div>
                <div style={styles.viewItem}>
                  <span style={styles.viewLabel}>ผู้ปกครอง</span>
                  <span style={styles.viewValue}>{viewingParentName}</span>
                </div>
              </div>
            </div>
            <button style={styles.closeViewBtn} onClick={() => setIsViewModalOpen(false)}>
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsAddModalOpen(false); resetForm(); }
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <UserPlus size={20} color="#4A90D9" />
                เพิ่มนักเรียน
              </h2>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div style={styles.uploadSection}>
                <label style={styles.uploadLabel}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <div style={styles.uploadArea}>
                    {formData.Image ? (
                      <img src={formData.Image} alt="preview" style={styles.uploadPreview} />
                    ) : (
                      <>
                        <Upload size={32} color="#4A90D9" />
                        <span style={styles.uploadText}>คลิกเพื่ออัปโหลดรูป</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  style={styles.formInput}
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด *</label>
                <input
                  type="date"
                  required
                  style={styles.formInput}
                  value={formData.Birthday}
                  onChange={(e) => setFormData({ ...formData, Birthday: e.target.value })}
                />
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <select
                    style={{ ...styles.formSelect, backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                    disabled
                    required
                    value={formData.Class_level}
                  >
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ *</label>
                  <select
                    style={styles.formSelect}
                    required
                    value={formData.Gender}
                    onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select
                  style={styles.formSelect}
                  value={formData.Blood_group}
                  onChange={(e) => setFormData({ ...formData, Blood_group: e.target.value })}
                >
                  <option value="">เลือกกรุ๊ปเลือด</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>

              <button type="submit" style={styles.submitBtn}>
                <CheckCircle size={18} />
                บันทึก
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) { setIsEditModalOpen(false); resetForm(); }
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Edit2 size={20} color="#F39C12" />
                แก้ไขนักเรียน
              </h2>
              <button onClick={() => { setIsEditModalOpen(false); resetForm(); }} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={styles.uploadSection}>
                <label style={styles.uploadLabel}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <div style={styles.uploadArea}>
                    {formData.Image ? (
                      <img src={formData.Image} alt="preview" style={styles.uploadPreview} />
                    ) : (
                      <>
                        <Upload size={32} color="#4A90D9" />
                        <span style={styles.uploadText}>คลิกเพื่ออัปโหลดรูป</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  style={styles.formInput}
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>วันเกิด *</label>
                <input
                  type="date"
                  required
                  style={styles.formInput}
                  value={formData.Birthday}
                  onChange={(e) => setFormData({ ...formData, Birthday: e.target.value })}
                />
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>ระดับชั้น</label>
                  <select
                    style={{ ...styles.formSelect, backgroundColor: '#F1F5F9', cursor: 'not-allowed' }}
                    disabled
                    required
                    value={formData.Class_level}
                  >
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.formLabel}>เพศ *</label>
                  <select
                    style={styles.formSelect}
                    required
                    value={formData.Gender}
                    onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>กรุ๊ปเลือด</label>
                <select
                  style={styles.formSelect}
                  value={formData.Blood_group}
                  onChange={(e) => setFormData({ ...formData, Blood_group: e.target.value })}
                >
                  <option value="">เลือกกรุ๊ปเลือด</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="O">O</option>
                  <option value="AB">AB</option>
                </select>
              </div>

              {/* Parent Search */}
              <div style={{ ...styles.formGroup, position: 'relative' }} ref={suggestionRef}>
                <label style={styles.formLabel}>ผู้ปกครอง</label>
                <input
                  type="text"
                  placeholder="พิมพ์ค้นหาชื่อผู้ปกครอง..."
                  style={styles.formInput}
                  value={parentSearch}
                  onChange={handleParentSearchChange}
                  onFocus={() => { if (parentSearch.trim().length >= 1) setShowSuggestions(true); }}
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
                            {pId && <small style={{ color: '#4A90D9' }}>ID: {pId}</small>}
                          </li>
                        );
                      })
                    ) : (
                      <li style={styles.suggestionEmpty}>ไม่พบรายชื่อผู้ปกครอง</li>
                    )}
                  </ul>
                )}
              </div>

              <button type="submit" style={{ ...styles.submitBtn, backgroundColor: '#F39C12' }}>
                <CheckCircle size={18} />
                บันทึกการแก้ไข
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) setIsDeleteModalOpen(false);
        }}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteIcon}>🗑️</div>
            <h3 style={styles.deleteTitle}>ยืนยันการลบ</h3>
            <p style={styles.deleteText}>คุณต้องการลบข้อมูลนักเรียนนี้หรือไม่?</p>
            <p style={styles.deleteSubText}>การดำเนินการนี้ไม่สามารถกู้คืนได้</p>
            <div style={styles.deleteActions}>
              <button onClick={() => setIsDeleteModalOpen(false)} style={styles.cancelBtn}>
                ยกเลิก
              </button>
              <button onClick={handleDeleteConfirm} style={styles.confirmDeleteBtn}>
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
    maxWidth: '1200px',
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

  studentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTop: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    marginBottom: '14px',
  },
  cardImageWrapper: {
    flexShrink: 0,
  },
  cardImage: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '1px solid #E2E8F0',
  },
  cardImagePlaceholder: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    border: '1px solid #E2E8F0',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 4px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  cardMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94A3B8',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  viewBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '7px',
    backgroundColor: '#F8FAFC',
    color: '#64748B',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  editBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '7px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: '1px solid #B6D4F0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  deleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '7px',
    backgroundColor: '#FDEDEC',
    color: '#E74C3C',
    border: '1px solid #F5C6CB',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  emptyState: {
    gridColumn: '1 / -1',
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
    maxWidth: '480px',
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
    padding: '20px',
    border: '2px dashed #E2E8F0',
    borderRadius: '12px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease',
    minHeight: '80px',
  },
  uploadPreview: {
    maxWidth: '100%',
    maxHeight: '120px',
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
  formSelect: {
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
    appearance: 'auto',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
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
    marginTop: '4px',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  // Suggestion
  suggestionList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    padding: '4px 0',
    margin: '4px 0 0 0',
    backgroundColor: '#FFFFFF',
    border: '1px solid #4A90D9',
    borderRadius: '10px',
    listStyle: 'none',
    maxHeight: '160px',
    overflowY: 'auto',
    zIndex: 99999,
    boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
  },
  suggestionItem: {
    padding: '10px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: '1px solid #F1F5F9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    color: '#1A202C',
    transition: 'background 0.15s ease',
  },
  suggestionEmpty: {
    padding: '10px 14px',
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: '13px',
  },

  // View Modal - แก้ไขให้ข้อความชิดซ้ายและจัดเรียงใหม่
  viewContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  viewAvatar: {
    marginBottom: '4px',
  },
  viewAvatarImg: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E2E8F0',
  },
  viewAvatarPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    border: '3px solid #E2E8F0',
  },
  viewInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  // แก้ไข: ใช้ flexDirection: 'column' และ justifyContent: 'flex-start'
  viewItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    gap: '4px',
  },
  viewRow: {
    display: 'flex',
    gap: '12px',
  },
  viewLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '500',
  },
  viewValue: {
    fontSize: '15px',
    color: '#1A202C',
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
  },
  closeViewBtn: {
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
  
  .student-card {
    animation: fadeInUp 0.3s ease forwards;
  }
  .student-card:nth-child(1) { animation-delay: 0.05s; }
  .student-card:nth-child(2) { animation-delay: 0.1s; }
  .student-card:nth-child(3) { animation-delay: 0.15s; }
  .student-card:nth-child(4) { animation-delay: 0.2s; }
  .student-card:nth-child(5) { animation-delay: 0.25s; }
  .student-card:nth-child(6) { animation-delay: 0.3s; }
  
  .student-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.08);
  }
  
  .view-btn:hover {
    background-color: #E2E8F0 !important;
  }
  .edit-btn:hover {
    background-color: #D6E9FF !important;
  }
  .delete-btn:hover {
    background-color: #FCD5D5 !important;
  }
  
  .form-input:focus, .form-select:focus {
    border-color: #4A90D9 !important;
    box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1) !important;
  }
  
  .upload-area:hover {
    border-color: #4A90D9 !important;
    background-color: #F0F7FF !important;
  }
  
  .suggestion-item:hover {
    background-color: #F0F7FF !important;
  }
  
  @media (max-width: 768px) {
    .student-grid {
      grid-template-columns: 1fr !important;
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
    .form-row {
      flex-direction: column !important;
      gap: 0 !important;
    }
    .view-row {
      flex-direction: column !important;
      gap: 0 !important;
    }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      padding: 20px !important;
    }
    .delete-modal {
      padding: 24px 20px !important;
    }
    .card-actions {
      flex-wrap: wrap !important;
    }
    .view-btn, .edit-btn, .delete-btn {
      flex: 1 1 calc(33.33% - 6px) !important;
    }
    .main-title {
      font-size: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default StudentManagement;