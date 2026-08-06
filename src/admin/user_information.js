import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserInformation() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับเก็บบทบาทที่เลือก
  const [selectedRole, setSelectedRole] = useState('ทั้งหมด');

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

  // กรองข้อมูลตามบทบาทที่เลือก
  const filteredUsers = users.filter((user) => {
    if (selectedRole === 'ทั้งหมด') return true;
    if (selectedRole === 'ผู้ปกครอง') return user.Role === 'ผู้ปกครอง' || user.Role === 'Parent';
    if (selectedRole === 'ครูผู้สอน') return user.Role === 'ครูผู้สอน' || user.Role === 'Teacher';
    if (selectedRole === 'แอดมิน') return user.Role === 'แอดมิน' || user.Role === 'Admin';
    return true;
  });

  return (
    <div style={styles.container}>
      <h2 style={{ margin: 10, color: '#0369a1' }}>จัดการผู้ใช้งาน</h2>
      <p style={styles.subTitle}>ตรวจสอบสิทธิ์และบริหารจัดการการเข้าใช้งานของสมาชิกในระบบ</p>

      {/* ปุ่มเลือกบทบาท (Tabs) */}
      <div style={styles.filterContainer}>
        {['ทั้งหมด', 'ผู้ปกครอง', 'ครูผู้สอน', 'แอดมิน'].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            style={{
              ...styles.tabButton,
              backgroundColor: selectedRole === role ? '#3e82c6' : '#ffffff',
              color: selectedRole === role ? '#ffffff' : '#475569',
              borderColor: selectedRole === role ? '#3e82c6' : '#cbd5e1',
            }}
          >
            {role}
          </button>
        ))}
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={{ ...styles.th, width: '60px', textAlign: 'center' }}>ลำดับ</th>
              <th style={styles.th}>ชื่อ-นามสกุล</th>
              <th style={styles.th}>เบอร์โทร</th>
              <th style={styles.th}>ชื่อผู้ใช้</th>
              <th style={styles.th}>สิทธิ์ใช้งาน (Role)</th>
              <th style={styles.th}>ระดับชั้น (Class)</th>
              <th style={styles.th}>สถานะ</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>
                  ไม่พบข้อมูลผู้ใช้งานในประเภทนี้
                </td>
              </tr>
            ) : (
              /* 🟢 เพิ่ม index ตรงนี้เพื่อนำมารันลำดับที่ 1, 2, 3... */
              filteredUsers.map((user, index) => {
                const userStatus = user.Status || 'ใช้งาน';
                const isSuspended = userStatus === 'ถูกระงับสิทธิ์';

                return (
                  <tr
                    key={user.User_id || index}
                    style={{
                      ...styles.trRow,
                      backgroundColor: isSuspended ? '#a8cff7' : '#ffffff'
                    }}
                  >
                    {/* 🟢 แสดงลำดับเริ่มจาก 1 สำหรับทุกตาราง/ทุกหมวดหมู่ */}
                    <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569', fontWeight: 'bold', textAlign: 'center' }}>
                      {index + 1}
                    </td>
                    <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Name || '-'}</td>
                    <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Phone || '-'}</td>
                    <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Password || '-'}</td>
                    <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.UserName || '-'}</td>
                    <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Role || '-'}</td>
                    <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Class_level || '-'}</td>

                    <td style={styles.td}>
                      <span style={styles.roleBadge(userStatus)}>
                        {userStatus}
                      </span>
                    </td>

                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {!isSuspended ? (
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
  container: { padding: "30px", backgroundColor: "#dff3ff 48%", minHeight: "100vh", fontFamily: "'Kanit', sans-serif" },
  subTitle: { fontSize: "15px", color: "#64748b", margin: "0 0 25px 0" },

  filterContainer: { display: "flex", gap: "10px", marginBottom: "20px" },
  tabButton: {
    padding: "8px 18px",
    borderRadius: "6px",
    border: "1px solid",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "'Kanit', sans-serif",
    transition: "all 0.2s"
  },

  tableCard: { background: "#ffffff", borderRadius: "8px", border: "1px solid #858181", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { backgroundColor: "#3e82c6", borderBottom: "2px solid #e2e8f0" },
  th: { padding: "14px 16px", fontSize: "14px", fontWeight: "600", color: "#ffffff" },
  trRow: { borderBottom: "1px solid #d1def0", transition: "background-color 0.2s" },
  td: { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" },

  selectRole: {
    padding: "6px 10px",
    borderRadius: "4px",
    border: "1px solid #cbd5e1",
    backgroundColor: "#f8fafc",
    fontFamily: "'Kanit', sans-serif",
    fontSize: "13px",
    color: "#334155",
    cursor: "pointer"
  },

  suspendButton: {
    padding: "6px 12px", backgroundColor: "#ef4444", color: "#ffffff",
    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px",
    fontFamily: "'Kanit', sans-serif"
  },
  unsuspendButton: {
    padding: "6px 12px", backgroundColor: "#22c55e", color: "#ffffff",
    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px",
    fontFamily: "'Kanit', sans-serif"
  },

  roleBadge: (status) => {
    let baseStyle = {
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "500",
      display: "inline-block"
    };

    if (status === "ใช้งาน") {
      return {
        ...baseStyle,
        backgroundColor: "#dcfce7",
        color: "#16a34a"
      };
    }

    if (status === "ถูกระงับสิทธิ์") {
      return {
        ...baseStyle,
        backgroundColor: "#fee2e2",
        color: "#dc2626"
      };
    }
    return { ...baseStyle, backgroundColor: "#f1f5f9", color: "#475569" };
  }
};

export default UserInformation;