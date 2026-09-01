import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Phone,
  Mail,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Key,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  UserCog
} from 'lucide-react';

function UserInformation() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('ทั้งหมด');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    suspended: 0
  });

  // ✅ State สำหรับ Modal เพิ่มครู
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    Name: '',
    Phone: '',
    Email: '',
    UserName: '',
    Class_level: '',
    Password: '',
    ConfirmPassword: ''
  });
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3001/users');
      setUsers(res.data);
      calculateStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("ไม่สามารถดึงข้อมูลผู้ใช้งานได้");
      setLoading(false);
    }
  };

  const calculateStats = (userData) => {
    const total = userData.length;
    const pending = userData.filter(u => u.Status === 'รออนุมัติ').length;
    const active = userData.filter(u => u.Status === 'ใช้งาน').length;
    const suspended = userData.filter(u => u.Status === 'ถูกระงับสิทธิ์').length;
    setStats({ total, pending, active, suspended });
  };

  const updateUser = async (user, updateData) => {
    try {
      const userId = user.User_id || user.id || user.user_id;
      await axios.put(`http://127.0.0.1:3001/users/${userId}`, updateData);
      await fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะผู้ใช้งาน");
    }
  };

  const handleApproveUser = async (user) => {
    if (window.confirm(`คุณต้องการอนุมัติสิทธิ์เข้าใช้งานให้กับ: ${user.Name}?`)) {
      await updateUser(user, { Status: "ใช้งาน" });
      alert("อนุมัติสิทธิ์การเข้าใช้งานเรียบร้อยแล้ว");
    }
  };

  const handleSuspendUser = async (user) => {
    if (window.confirm(`คุณแน่ใจใช่ไหมที่จะระงับสิทธิ์การใช้งานของ: ${user.Name}?`)) {
      await updateUser(user, { Status: "ถูกระงับสิทธิ์" });
      alert("ระงับสิทธิ์ผู้ใช้งานสำเร็จเรียบร้อยแล้ว");
    }
  };

  const handleUnsuspendUser = async (user) => {
    if (window.confirm(`คุณแน่ใจใช่ไหมที่จะปลดระงับสิทธิ์ของ: ${user.Name}?`)) {
      await updateUser(user, { Status: "ใช้งาน" });
      alert("ปลดระงับสิทธิ์ผู้ใช้งานสำเร็จเรียบร้อยแล้ว");
    }
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  // ✅ ฟังก์ชันเพิ่มครู
  const handleTeacherChange = (e) => {
    setTeacherForm({
      ...teacherForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', type: '' });

    if (teacherForm.Password !== teacherForm.ConfirmPassword) {
      setFormMessage({ text: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน!', type: 'danger' });
      return;
    }

    if (teacherForm.Password.length < 6) {
      setFormMessage({ text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', type: 'danger' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post('http://127.0.0.1:3001/api/admin/create-teacher', {
        Name: teacherForm.Name,
        Phone: teacherForm.Phone,
        Email: teacherForm.Email,
        UserName: teacherForm.UserName,
        Class_level: teacherForm.Class_level,
        Password: teacherForm.Password
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 201) {
        setFormMessage({ text: '✅ สร้างบัญชีครูสำเร็จ!', type: 'success' });
        setTeacherForm({
          Name: '', Phone: '', Email: '', UserName: '', Class_level: '', Password: '', ConfirmPassword: ''
        });
        fetchUsers();
        setTimeout(() => {
          setShowAddTeacherModal(false);
          setFormMessage({ text: '', type: '' });
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      setFormMessage({ 
        text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างบัญชีครู', 
        type: 'danger' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinnerWrapper}>
          <RefreshCw size={48} style={styles.spinner} />
        </div>
        <p style={styles.loadingText}>กำลังโหลดข้อมูลผู้ใช้งาน...</p>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    let matchesRole = true;
    if (selectedRole === 'รออนุมัติ') matchesRole = user.Status === 'รออนุมัติ';
    else if (selectedRole === 'ผู้ปกครอง') matchesRole = user.Role === 'ผู้ปกครอง' || user.Role === 'Parent';
    else if (selectedRole === 'ครูผู้สอน') matchesRole = user.Role === 'ครูผู้สอน' || user.Role === 'Teacher';
    else if (selectedRole === 'แอดมิน') matchesRole = user.Role === 'แอดมิน' || user.Role === 'Admin';

    const query = searchTerm.toLowerCase().trim();
    const nameMatch = (user.Name || '').toLowerCase().includes(query);
    const phoneMatch = (user.Phone || '').toLowerCase().includes(query);
    const usernameMatch = (user.UserName || user.username || '').toLowerCase().includes(query);
    const classMatch = (user.Class_level || '').toLowerCase().includes(query);
    const matchesSearch = nameMatch || phoneMatch || usernameMatch || classMatch;

    return matchesRole && matchesSearch;
  });

  const statCards = [
    { label: 'ผู้ใช้งานทั้งหมด', value: stats.total, icon: Users, color: '#4A90D9', bg: '#EBF3FB' },
    { label: 'รออนุมัติ', value: stats.pending, icon: Clock, color: '#F39C12', bg: '#FEF9E7' },
    { label: 'ใช้งานแล้ว', value: stats.active, icon: UserCheck, color: '#27AE60', bg: '#E8F8ED' },
    { label: 'ถูกระงับสิทธิ์', value: stats.suspended, icon: UserX, color: '#E74C3C', bg: '#FDEDEC' },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      'ใช้งาน': { bg: '#E8F8ED', color: '#27AE60', icon: CheckCircle, label: 'ใช้งาน' },
      'รออนุมัติ': { bg: '#FEF9E7', color: '#F39C12', icon: Clock, label: 'รออนุมัติ' },
      'ถูกระงับสิทธิ์': { bg: '#FDEDEC', color: '#E74C3C', icon: AlertCircle, label: 'ถูกระงับสิทธิ์' },
    };
    return badges[status] || badges['รออนุมัติ'];
  };

  const getRoleBadge = (role) => {
    const roles = {
      'แอดมิน': { bg: '#FCE4EC', color: '#C62828', icon: ShieldCheck },
      'ครูผู้สอน': { bg: '#E3F2FD', color: '#1565C0', icon: Shield },
      'ผู้ปกครอง': { bg: '#E8F5E9', color: '#2E7D32', icon: ShieldAlert },
      'ถูกระงับสิทธิ์': { bg: '#F5F5F5', color: '#9E9E9E', icon: ShieldOff },
    };
    return roles[role] || { bg: '#F3E5F5', color: '#6A1B9A', icon: Shield };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Users size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={styles.mainTitle}>จัดการผู้ใช้งาน</h1>
            <p style={styles.subTitle}>
              ตรวจสอบสิทธิ์ ยืนยันสิทธิ์ลงทะเบียน และบริหารจัดการการเข้าใช้งาน
            </p>
          </div>
        </div>
        <div style={styles.headerActions}>
          {/* ✅ ปุ่มเพิ่มครู */}
          <button onClick={() => setShowAddTeacherModal(true)} style={styles.addTeacherButton}>
            <UserPlus size={16} />
            เพิ่มครู
          </button>
          <button onClick={fetchUsers} style={styles.refreshButton}>
            <RefreshCw size={16} />
            โหลดข้อมูลใหม่
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} style={styles.statCard}>
              <div style={{ ...styles.statIconWrapper, backgroundColor: stat.bg }}>
                <IconComponent size={20} color={stat.color} />
              </div>
              <div style={styles.statContent}>
                <span style={styles.statLabel}>{stat.label}</span>
                <span style={styles.statValue}>{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div style={styles.tableCard}>
        {/* Filter Controls */}
        <div style={styles.headerControls}>
          <div style={styles.filterContainer}>
            <Filter size={16} color="#64748B" style={styles.filterIcon} />
            {['ทั้งหมด', 'รออนุมัติ', 'ผู้ปกครอง', 'ครูผู้สอน', 'แอดมิน'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  ...styles.tabButton,
                  backgroundColor: selectedRole === role ? '#4A90D9' : '#F8FAFC',
                  color: selectedRole === role ? '#FFFFFF' : '#64748B',
                  border: selectedRole === role ? '1px solid #4A90D9' : '1px solid #E2E8F0',
                }}
              >
                {role}
                {role === 'รออนุมัติ' && stats.pending > 0 && (
                  <span style={styles.pendingBadge}>{stats.pending}</span>
                )}
              </button>
            ))}
          </div>

          <div style={styles.searchWrapper}>
            <Search size={16} color="#94A3B8" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, ระดับชั้น..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Table - Desktop */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={{ ...styles.th, width: '50px' }}>#</th>
                <th style={styles.th}>ชื่อ-นามสกุล</th>
                <th style={styles.th}>บทบาท</th>
                <th style={styles.th}>ระดับชั้น</th>
                <th style={styles.th}>สถานะ</th>
                <th style={{ ...styles.th, textAlign: 'center', width: '140px' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyState}>
                    <Users size={48} color="#CBD5E1" />
                    <p>ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไข</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const statusBadge = getStatusBadge(user.Status);
                  const roleBadge = getRoleBadge(user.Role);
                  const RoleIcon = roleBadge.icon;
                  const StatusIcon = statusBadge.icon;
                  const isPending = user.Status === 'รออนุมัติ';
                  const isSuspended = user.Status === 'ถูกระงับสิทธิ์';

                  return (
                    <React.Fragment key={user.User_id || index}>
                      <tr
                        style={{
                          ...styles.trRow,
                          backgroundColor: isPending ? '#FFFBEB' : isSuspended ? '#F8FAFC' : '#FFFFFF',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleRow(index)}
                      >
                        <td style={{ ...styles.td, color: '#94A3B8', fontWeight: '600', textAlign: 'center' }}>
                          {index + 1}
                        </td>
                        <td style={{ ...styles.td, fontWeight: '500', color: '#1A202C' }}>
                          <div style={styles.userNameCell}>
                            <div style={styles.userAvatar}>
                              {user.Name?.charAt(0) || 'U'}
                            </div>
                            {user.Name || '-'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.roleBadge, backgroundColor: roleBadge.bg, color: roleBadge.color }}>
                            <RoleIcon size={14} />
                            {user.Role || '-'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {user.Class_level ? (
                            <span style={styles.classBadge}>
                              <Award size={14} color="#8E44AD" />
                              {user.Class_level}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, backgroundColor: statusBadge.bg, color: statusBadge.color }}>
                            <StatusIcon size={14} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {isPending ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApproveUser(user); }}
                              style={styles.approveButton}
                            >
                              <UserCheck size={14} />
                              อนุมัติ
                            </button>
                          ) : !isSuspended ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSuspendUser(user); }}
                              style={styles.suspendButton}
                            >
                              <UserX size={14} />
                              ระงับ
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnsuspendUser(user); }}
                              style={styles.unsuspendButton}
                            >
                              <UserCheck size={14} />
                              ปลดระงับ
                            </button>
                          )}
                        </td>
                      </tr>
                      {/* Expanded Row */}
                      {expandedRow === index && (
                        <tr style={styles.expandedRow}>
                          <td colSpan="6">
                            <div style={styles.expandedContent}>
                              <div style={styles.expandedItem}>
                                <span style={styles.expandedLabel}>
                                  <Phone size={14} color="#94A3B8" />
                                  เบอร์โทร
                                </span>
                                <span>{user.Phone || '-'}</span>
                              </div>
                              <div style={styles.expandedItem}>
                                <span style={styles.expandedLabel}>
                                  <User size={14} color="#94A3B8" />
                                  ชื่อผู้ใช้
                                </span>
                                <span>{user.UserName || user.username || '-'}</span>
                              </div>
                              <div style={styles.expandedItem}>
                                <span style={styles.expandedLabel}>
                                  <Key size={14} color="#94A3B8" />
                                  รหัสผ่าน
                                </span>
                                <span>{user.Password ? '••••••••' : '-'}</span>
                              </div>
                              <div style={styles.expandedItem}>
                                <span style={styles.expandedLabel}>
                                  <Mail size={14} color="#94A3B8" />
                                  อีเมล
                                </span>
                                <span>{user.Email || '-'}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div style={styles.footerInfo}>
          <span>
            พบทั้งหมด {filteredUsers.length} รายการ
            {searchTerm && ` (จาก ${users.length} รายการ)`}
          </span>
          <span style={styles.expandHint}>
            <ChevronDown size={14} />
            คลิกที่แถวเพื่อดูข้อมูลเพิ่มเติม
          </span>
        </div>
      </div>

      {/* ✅ Modal เพิ่มครู */}
      {showAddTeacherModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddTeacherModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <UserPlus size={20} color="#4A90D9" />
                เพิ่มบัญชีครู
              </h2>
              <button onClick={() => setShowAddTeacherModal(false)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} style={styles.modalForm}>
              {formMessage.text && (
                <div style={formMessage.type === 'danger' ? styles.modalAlertDanger : styles.modalAlertSuccess}>
                  {formMessage.text}
                </div>
              )}

              <div style={styles.modalRow}>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    name="Name"
                    placeholder="เช่น สมชาย ใจดี"
                    value={teacherForm.Name}
                    onChange={handleTeacherChange}
                    required
                    style={styles.modalInput}
                  />
                </div>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>เบอร์โทรศัพท์ *</label>
                  <input
                    type="text"
                    name="Phone"
                    placeholder="081-234-5678"
                    value={teacherForm.Phone}
                    onChange={handleTeacherChange}
                    required
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={styles.modalRow}>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>อีเมล *</label>
                  <input
                    type="email"
                    name="Email"
                    placeholder="teacher@school.com"
                    value={teacherForm.Email}
                    onChange={handleTeacherChange}
                    required
                    style={styles.modalInput}
                  />
                </div>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>ชื่อผู้ใช้ (Username) *</label>
                  <input
                    type="text"
                    name="UserName"
                    placeholder="teacher01"
                    value={teacherForm.UserName}
                    onChange={handleTeacherChange}
                    required
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={styles.modalField}>
                <label style={styles.modalLabel}>ห้องเรียน *</label>
                <select
                  name="Class_level"
                  value={teacherForm.Class_level}
                  onChange={handleTeacherChange}
                  required
                  style={styles.modalSelect}
                >
                  <option value="">เลือกห้องเรียน</option>
                  <option value="อนุบาล1 ห้องปกติ">อนุบาล 1 ห้องปกติ</option>
                  <option value="อนุบาล1 ห้อง 3 ภาษา">อนุบาล 1 ห้อง 3 ภาษา</option>
                  <option value="อนุบาล2 ห้องปกติ">อนุบาล 2 ห้องปกติ</option>
                  <option value="อนุบาล2 ห้อง 3 ภาษา">อนุบาล 2 ห้อง 3 ภาษา</option>
                  <option value="อนุบาล3 ห้องปกติ">อนุบาล 3 ห้องปกติ</option>
                  <option value="อนุบาล3 ห้อง 3 ภาษา">อนุบาล 3 ห้อง 3 ภาษา</option>
                </select>
              </div>

              <div style={styles.modalRow}>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>รหัสผ่าน *</label>
                  <input
                    type="password"
                    name="Password"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={teacherForm.Password}
                    onChange={handleTeacherChange}
                    required
                    style={styles.modalInput}
                  />
                </div>
                <div style={styles.modalField}>
                  <label style={styles.modalLabel}>ยืนยันรหัสผ่าน *</label>
                  <input
                    type="password"
                    name="ConfirmPassword"
                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                    value={teacherForm.ConfirmPassword}
                    onChange={handleTeacherChange}
                    required
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={styles.modalButtonGroup}>
                <button type="submit" disabled={submitting} style={styles.modalSubmitButton}>
                  {submitting ? 'กำลังสร้าง...' : '✅ สร้างบัญชีครู'}
                </button>
                <button type="button" onClick={() => setShowAddTeacherModal(false)} style={styles.modalCancelButton}>
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxSizing: 'border-box',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    gap: '16px',
  },
  spinnerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
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
    letterSpacing: '-0.5px',
  },
  subTitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '4px 0 0 0',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    color: '#4A5568',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  // ✅ ปุ่มเพิ่มครู
  addTeacherButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#4A90D9',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 2px 8px rgba(74, 144, 217, 0.25)',
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

  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },

  headerControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #F1F5F9',
    flexWrap: 'wrap',
    gap: '12px',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterIcon: {
    marginRight: '4px',
  },
  tabButton: {
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pendingBadge: {
    backgroundColor: '#E74C3C',
    color: '#FFFFFF',
    borderRadius: '50%',
    padding: '1px 7px',
    fontSize: '11px',
    fontWeight: '600',
    minWidth: '20px',
    textAlign: 'center',
  },

  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
  },
  searchInput: {
    padding: '8px 36px 8px 38px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    fontSize: '14px',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    outline: 'none',
    width: '240px',
    transition: 'all 0.2s ease',
    backgroundColor: '#FAFBFC',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    backgroundColor: '#F8FAFC',
    borderBottom: '2px solid #E2E8F0',
  },
  th: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  trRow: {
    borderBottom: '1px solid #F1F5F9',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    verticalAlign: 'middle',
    color: '#334155',
  },

  userNameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    flexShrink: 0,
  },

  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  classBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: '#F4ECF7',
    color: '#8E44AD',
    fontSize: '12px',
    fontWeight: '500',
  },

  approveButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(74, 144, 217, 0.2)',
  },
  suspendButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#E74C3C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(231, 76, 60, 0.2)',
  },
  unsuspendButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    backgroundColor: '#27AE60',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(39, 174, 96, 0.2)',
  },

  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: '16px',
  },

  expandedRow: {
    backgroundColor: '#FAFBFC',
  },
  expandedContent: {
    padding: '16px 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  expandedItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  expandedLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },

  footerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderTop: '1px solid #F1F5F9',
    fontSize: '13px',
    color: '#94A3B8',
  },
  expandHint: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#94A3B8',
    fontSize: '12px',
  },

  // ✅ Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '600px',
    width: '95%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
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
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  modalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  modalField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  modalLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  modalInput: {
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  modalSelect: {
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  modalButtonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  modalSubmitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    transition: 'background 0.2s ease',
    boxShadow: '0 2px 8px rgba(74, 144, 217, 0.25)',
  },
  modalCancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    transition: 'background 0.2s ease',
  },
  modalAlertDanger: {
    padding: '10px 14px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
  },
  modalAlertSuccess: {
    padding: '10px 14px',
    backgroundColor: '#D1FAE5',
    color: '#059669',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center',
  },
};

// Global CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .modal-row {
      grid-template-columns: 1fr !important;
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr !important;
    }
    .search-input {
      width: 160px !important;
    }
    .modal-content {
      padding: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default UserInformation;