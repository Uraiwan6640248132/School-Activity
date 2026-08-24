import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserInformation() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับเก็บบทบาทที่เลือก
  const [selectedRole, setSelectedRole] = useState('ทั้งหมด');
  
  // 🟢 State สำหรับช่องค้นหา
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:3001/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      alert("ไม่สามารถดึงข้อมูลผู้ใช้งานได้");
      setLoading(false);
    }
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

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูลผู้ใช้งาน...</div>;

  // 🟢 กรองข้อมูลตามบทบาทที่เลือก + คำค้นหา (Search)
  const filteredUsers = users.filter((user) => {
    // 1. กรองตามบทบาท (Role / Status)
    let matchesRole = true;
    if (selectedRole === 'รออนุมัติ') matchesRole = user.Status === 'รออนุมัติ';
    else if (selectedRole === 'ผู้ปกครอง') matchesRole = user.Role === 'ผู้ปกครอง' || user.Role === 'Parent';
    else if (selectedRole === 'ครูผู้สอน') matchesRole = user.Role === 'ครูผู้สอน' || user.Role === 'Teacher';
    else if (selectedRole === 'แอดมิน') matchesRole = user.Role === 'แอดมิน' || user.Role === 'Admin';

    // 2. กรองตามคำค้นหา (ชื่อ, เบอร์โทร, ชื่อผู้ใช้, ระดับชั้น)
    const query = searchTerm.toLowerCase().trim();
    const nameMatch = (user.Name || '').toLowerCase().includes(query);
    const phoneMatch = (user.Phone || '').toLowerCase().includes(query);
    const usernameMatch = (user.UserName || user.username || '').toLowerCase().includes(query);
    const classMatch = (user.Class_level || '').toLowerCase().includes(query);

    const matchesSearch = nameMatch || phoneMatch || usernameMatch || classMatch;

    return matchesRole && matchesSearch;
  });

  return (
    <div style={styles.container}>
      <h2 style={{ margin: 0, color: '#0369a1', fontWeight: '600' }}>จัดการผู้ใช้งาน</h2>
      <p style={styles.subTitle}>ตรวจสอบสิทธิ์ ยืนยันสิทธิ์ลงทะเบียน และบริหารจัดการการเข้าใช้งานของสมาชิกในระบบ</p>

      {/* รวมส่วนค้นหา Tab และ ตารางไว้ใน Card เดียวกัน */}
      <div style={styles.tableCard}>
        
        {/* 🟢 แถบด้านบน: เลือก Tab และ ช่องค้นหา */}
        <div style={styles.headerControls}>
          <div style={styles.filterContainer}>
            {['ทั้งหมด', 'รออนุมัติ', 'ผู้ปกครอง', 'ครูผู้สอน', 'แอดมิน'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  ...styles.tabButton,
                  backgroundColor: selectedRole === role ? '#0284c7' : '#f8fafc',
                  color: selectedRole === role ? '#ffffff' : '#64748b',
                  border: selectedRole === role ? '1px solid #0284c7' : '1px solid #e2e8f0',
                }}
              >
                {role}
                {role === 'รออนุมัติ' && users.filter(u => u.Status === 'รออนุมัติ').length > 0 && (
                  <span style={styles.pendingBadge}>
                    {users.filter(u => u.Status === 'รออนุมัติ').length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 🔍 ช่องค้นหา */}
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="🔍 ค้นหาชื่อ, เบอร์โทร, ชื่อผู้ใช้..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={styles.clearSearchBtn}>
                ✕
              </button>
            )}
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={{ ...styles.th, width: '60px', textAlign: 'center' }}>ลำดับ</th>
              <th style={styles.th}>ชื่อ-นามสกุล</th>
              <th style={styles.th}>เบอร์โทร</th>
              <th style={styles.th}>ชื่อผู้ใช้</th>
              <th style={styles.th}>รหัสผ่าน</th>
              <th style={styles.th}>สิทธิ์ใช้งาน (Role)</th>
              <th style={styles.th}>ระดับชั้น (Class)</th>
              <th style={styles.th}>สถานะ</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>จัดการสิทธิ์</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                  ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => {
                const userStatus = user.Status || 'รออนุมัติ';
                const isSuspended = userStatus === 'ถูกระงับสิทธิ์';
                const isPending = userStatus === 'รออนุมัติ';

                return (
                  <tr
                    key={user.User_id || index}
                    style={{
                      ...styles.trRow,
                      backgroundColor: isPending ? '#fffbeb' : isSuspended ? '#f8fafc' : '#ffffff'
                    }}
                  >
                    <td style={{ ...styles.td, color: '#64748b', fontWeight: 'bold', textAlign: 'center' }}>
                      {index + 1}
                    </td>
                    <td style={{ ...styles.td, color: '#334155', fontWeight: '500' }}>{user.Name || '-'}</td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{user.Phone || '-'}</td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{user.UserName || user.username || '-'}</td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{user.Password || '-'}</td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{user.Role || '-'}</td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{user.Class_level || '-'}</td>

                    <td style={styles.td}>
                      <span style={styles.roleBadge(userStatus)}>
                        {userStatus}
                      </span>
                    </td>

                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {isPending ? (
                        <button
                          onClick={() => handleApproveUser(user)}
                          style={styles.approveButton}
                        >
                          ✓ อนุมัติสิทธิ์
                        </button>
                      ) : !isSuspended ? (
                        <button
                          onClick={() => handleSuspendUser(user)}
                          style={styles.suspendButton}
                        >
                          ระงับสิทธิ์
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnsuspendUser(user)}
                          style={styles.unsuspendButton}
                        >
                          ปลดระงับสิทธิ์
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Kanit', sans-serif" },
  subTitle: { fontSize: "14px", color: "#64748b", margin: "4px 0 24px 0" },

  tableCard: { background: "#ffffff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", padding: "20px", overflow: "hidden" },
  
  headerControls: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" },
  filterContainer: { display: "flex", gap: "8px", flexWrap: "wrap" },
  tabButton: {
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'Kanit', sans-serif",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },

  // Style สำหรับช่องค้นหา
  searchWrapper: { position: "relative", display: "flex", alignItems: "center" },
  searchInput: {
    padding: "8px 32px 8px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    fontFamily: "'Kanit', sans-serif",
    outline: "none",
    width: "260px",
    transition: "border-color 0.2s",
  },
  clearSearchBtn: {
    position: "absolute",
    right: "10px",
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "12px"
  },

  pendingBadge: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "1px 7px",
    fontSize: "11px",
    fontWeight: "bold"
  },

  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#475569" },
  trRow: { borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" },
  td: { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" },

  approveButton: {
    padding: "6px 14px", backgroundColor: "#0284c7", color: "#ffffff",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    fontFamily: "'Kanit', sans-serif", fontWeight: "500", boxShadow: "0 2px 4px rgba(2,132,199,0.2)"
  },
  suspendButton: {
    padding: "6px 12px", backgroundColor: "#ef4444", color: "#ffffff",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    fontFamily: "'Kanit', sans-serif"
  },
  unsuspendButton: {
    padding: "6px 12px", backgroundColor: "#22c55e", color: "#ffffff",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
    fontFamily: "'Kanit', sans-serif"
  },

  roleBadge: (status) => {
    let baseStyle = {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "500",
      display: "inline-block"
    };

    if (status === "ใช้งาน") return { ...baseStyle, backgroundColor: "#dcfce7", color: "#16a34a" };
    if (status === "รออนุมัติ") return { ...baseStyle, backgroundColor: "#fef3c7", color: "#d97706" };
    if (status === "ถูกระงับสิทธิ์") return { ...baseStyle, backgroundColor: "#fee2e2", color: "#dc2626" };
    return { ...baseStyle, backgroundColor: "#f1f5f9", color: "#475569" };
  }
};

export default UserInformation;