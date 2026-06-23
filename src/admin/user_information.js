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

  // 2. ฟังก์ชันเมื่อเลือกเปลี่ยนสิทธิ์ในดรอปดาวน์ (จับคู่ค่าให้ตรงกับ State)
  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.User_id === userId ? { ...user, Role: newRole } : user
    ));
  };

  // 3. ฟังก์ชันกดปุ่ม "บันทึก" เพื่ออัปเดตสิทธิ์ลงฐานข้อมูล
  const handleSaveRole = async (user) => {
    try {
      // ดึงค่า username มารองรับทั้งตัวพิมพ์เล็กและพิมพ์ใหญ่จากตาราง
      const currentUsername = user.UserName || user.Username || '';

      await axios.put(`http://127.0.0.1:3001/users/${user.User_id}`, {
        Name: user.Name,
        Phone: user.Phone,
        Username: currentUsername,
        Role: user.Role // ส่งค่า "แอดมิน", "ครูผู้สอน", "ผู้ปกครอง" ไปบันทึก
      });
      alert(`อัปเดตสิทธิ์ของ ${user.Name} สำเร็จแล้วครับ!`);
      fetchUsers(); // โหลดข้อมูลใหม่เพื่ออัปเดตความถูกต้องบนหน้าจอ
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด ไม่สามารถบันทึกสิทธิ์ได้");
    }
  };

  // 4. ฟังก์ชันกดปุ่ม "ลบ" สมาชิก
  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`คุณแน่ใจใช่ไหมที่จะลบผู้ใช้งาน: ${name}?`)) {
      try {
        await axios.delete(`http://127.0.0.1:3001/users/${userId}`);
        alert("ลบผู้ใช้งานสำเร็จ");
        fetchUsers();
      } catch (err) {
        alert("ลบไม่สำเร็จ บัญชีนี้อาจมีข้อมูลผูกอยู่กับตารางอื่น");
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Kanit', sans-serif" }}>กำลังโหลดข้อมูลผู้ใช้งาน...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>จัดการผู้ใช้งาน</h1>
      <p style={styles.subTitle}>กำหนดสิทธิ์การใช้งานของครูและผู้ปกครอง</p>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>ชื่อ-นามสกุล</th>
              <th style={styles.th}>เบอร์โทร</th>
              <th style={styles.th}>ชื่อผู้ใช้</th>
              <th style={styles.th}>รหัสผ่าน</th>
              <th style={styles.th}>สถานะ</th>
              <th style={styles.th}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.User_id} style={styles.trRow}>
                <td style={styles.td}>{user.Name}</td>
                <td style={styles.td}>{user.Phone || '-'}</td>
                <td style={styles.td}>{user.UserName || user.Username}</td>
                <td style={styles.td}>{user.Password}</td>
                
                {/* 🎯 ปรับปรุงส่วนนี้: value ของดรอปดาวน์ตรงกับสิทธิ์ภาษาไทยใน DB เป๊ะๆ */}
                <td style={styles.td}>
                  <select 
                    value={user.Role || ''} 
                    onChange={(e) => handleRoleChange(user.User_id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="แอดมิน">แอดมิน</option>
                    <option value="ครูผู้สอน">ครูผู้สอน</option>
                    <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                  </select>
                </td>

                <td style={styles.td}>
                  <div style={styles.actionGroup}>
                    <button 
                      onClick={() => handleSaveRole(user)} 
                      style={styles.saveButton}
                    >
                      บันทึก
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.User_id, user.Name)} 
                      style={styles.deleteButton}
                    >
                      ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "'Kanit', sans-serif" },
  mainTitle: { fontSize: "24px", fontWeight: "600", color: "#1e293b", margin: "0 0 6px 0" },
  subTitle: { fontSize: "15px", color: "#64748b", margin: "0 0 25px 0" },
  tableCard: { background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
  th: { padding: "14px 16px", fontSize: "15px", fontWeight: "600", color: "#334155" },
  trRow: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#475569", verticalAlign: "middle" },
  select: {
    padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff", color: "#1e293b", fontSize: "14px",
    fontFamily: "'Kanit', sans-serif", outline: "none", cursor: "pointer", width: "135px"
  },
  actionGroup: { display: "flex", gap: "8px" },
  saveButton: { padding: "6px 12px", backgroundColor: "#22c55e", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontFamily: "'Kanit', sans-serif" },
  deleteButton: { padding: "6px 12px", backgroundColor: "#ef4444", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", fontFamily: "'Kanit', sans-serif" }
};

export default UserInformation;