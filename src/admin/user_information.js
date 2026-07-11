import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserInformation() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูลผู้ใช้ทั้งหมดเมื่อเปิดหน้าจอ
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

  // 2. ฟังก์ชันกดปุ่ม "ระงับสิทธิ์"
  const handleSuspendUser = async (user) => {
    if (window.confirm(`คุณแน่ใจใช่ไหมที่จะระงับสิทธิ์การใช้งานของ: ${user.Name}?`)) {
      try {
        await axios.put(`http://127.0.0.1:3001/users/${user.User_id}`, {
          Name: user.Name,
          Phone: user.Phone,
          UserName: user.UserName,
          Password: user.Password,
          Role: user.Role,
          Status: "ถูกระงับสิทธิ์"
        });

        alert("ระงับสิทธิ์ผู้ใช้งานสำเร็จเรียบร้อยแล้ว");
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถระงับสิทธิ์ผู้ใช้งานได้");
      }
    }
  };

  // 3. ฟังก์ชัน "ปลดระงับสิทธิ์"
  const handleUnsuspendUser = async (user) => {
    if (window.confirm(`คุณแน่ใจใช่ไหมที่จะปลดระงับสิทธิ์ของ: ${user.Name}?`)) {
      try {
        await axios.put(`http://127.0.0.1:3001/users/${user.User_id}`, {
          Name: user.Name,
          Phone: user.Phone,
          UserName: user.UserName,
          Password: user.Password,
          Role: user.Role,
          Status: "ใช้งาน"
        });

        alert("ปลดระงับสิทธิ์ผู้ใช้งานสำเร็จเรียบร้อยแล้ว");
        fetchUsers();
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถปลดระงับสิทธิ์ได้");
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูลผู้ใช้งาน...</div>;

  return (
    <div style={styles.container}>
      <h2 style={{ margin: 10, color: '#0369a1' }}>จัดการผู้ใช้งาน</h2>
      <p style={styles.subTitle}>ตรวจสอบสิทธิ์และบริหารจัดการการเข้าใช้งานของสมาชิกในระบบ</p>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              {/* 🟢 หัวตารางแสดงครบ 8 คอลัมน์ตามฐานข้อมูล */}
              <th style={styles.th}>ID</th>
              <th style={styles.th}>ชื่อ-นามสกุล</th>
              <th style={styles.th}>เบอร์โทร</th>
              <th style={styles.th}>รหัสผ่าน</th>
              <th style={styles.th}>ชื่อผู้ใช้</th>
              <th style={styles.th}>สิทธิ์ใช้งาน (Role)</th>
              <th style={styles.th}>ระดับชั้น (Class)</th>
              <th style={styles.th}>สถานะ</th>
              {/* 🟢 แก้ไขจุดนี้: ยุบรวม style ซ้ำกันเข้าด้วยกันเพื่อไม่ให้แจ้งเตือนเตือน */}
              <th style={{ ...styles.th, textAlign: 'center' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const userStatus = user.Status || 'ใช้งาน';
              const isSuspended = userStatus === 'ถูกระงับสิทธิ์';

              return (
                <tr
                  key={user.User_id}
                  style={{
                    ...styles.trRow,
                    backgroundColor: isSuspended ? '#a8cff7' : '#ffffff'
                  }}
                >
                  {/* 🟢 แสดงข้อมูลในแต่ละช่องให้ตรงกับฐานข้อมูลเป๊ะๆ */}
                  <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569', fontWeight: 'bold' }}>{user.User_id}</td>
                  <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Name || '-'}</td>
                  <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Phone || '-'}</td>
                  <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Password || '-'}</td>
                  <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.UserName || '-'}</td>
                  <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Role || '-'}</td>
                  <td style={{ ...styles.td, color: isSuspended ? '#94a3b8' : '#475569' }}>{user.Class_level || '-'}</td>

                  {/* แสดง Badge สถานะ */}
                  <td style={styles.td}>
                    <span style={styles.roleBadge(userStatus)}>
                      {userStatus}
                    </span>
                  </td>

                  {/* ปุ่มจัดการสิทธิ์ */}
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", backgroundColor: "#dff3ff 48%", minHeight: "100vh", fontFamily: "'Kanit', sans-serif" },
  mainTitle: { fontSize: "24px", fontWeight: "600", color: "#1e293b", margin: "0 0 6px 0" },
  subTitle: { fontSize: "15px", color: "#64748b", margin: "0 0 25px 0" },
  tableCard: { background: "#ffffff", borderRadius: "8px", border: "1px solid #858181", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { backgroundColor: "#3e82c6", borderBottom: "2px solid #e2e8f0" },
  th: { padding: "14px 16px", fontSize: "14px", fontWeight: "600", color: "#768395" },
  trRow: { borderBottom: "1px solid #d1def0", transition: "background-color 0.2s" },
  td: { padding: "14px 16px", fontSize: "14px", verticalAlign: "middle" },

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