import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3001";

function Notification() {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // สเตตสำหรับเก็บค่าอินพุต
  // เปลี่ยนตรงบรรทัดประกาศสเตต class_level ด้านบนของไฟล์
  const [class_level, setClassLevel] = useState("อนุบาล 1 ห้องปกติ"); // 👈 ใส่ชื่อห้องเป็นค่าเริ่มต้นไว้เลย
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  

  // 🟢 รายการระดับชั้นเรียนแบบตัวเลือก (อนุบาล 1 - อนุบาล 3)
  const classOptions = [
    "อนุบาล 1 ห้องปกติ",
    "อนุบาล 1 ห้อง 3 ภาษา",
    "อนุบาล 2 ห้องปกติ",
    "อนุบาล 2 ห้อง 3 ภาษา",
    "อนุบาล 3 ห้องปกติ",
    "อนุบาล 3 ห้อง 3 ภาษา",
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/notifications`);
      setList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
  setEditId(null);
  setClassLevel("อนุบาล 1 ห้องปกติ"); // 👈 แก้จาก "" เป็นชื่อห้องเรียนหลัก
  setSubject("");
  setDetails("");
  setDeadline("");
  setShowModal(false);
};

  const saveData = async (e) => {
  e.preventDefault();

  // ดึงวันที่ปัจจุบันมาเป็นค่าเริ่มต้น เผื่อกรณีที่ไม่ได้ระบุข้อมูล (format: YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

  const data = {
    User_id: 1, 
    Class_level: class_level, 
    Subject: subject, 
    // 🟢 แก้จาก deadline || null เป็นให้ใส่ค่าวันนี้แทน เพื่อป้องกัน DB ปฏิเสธค่าว่าง
    Deadline: deadline || todayStr,  
    Date: todayStr, // กำหนดวันที่แจ้งเตือนเป็นวันนี้ไปเลย
    Details: details || null 
  };

  try {
    if (editId) {
      await axios.put(`${BASE_URL}/notifications/${editId}`, data);
    } else {
      await axios.post(`${BASE_URL}/notifications`, data);
    }
    resetForm();
    getData();
  } catch (err) {
    console.log(err);
  }
};

  const openEdit = (item) => {
    setEditId(item.Notification_id || item.notification_id);
    setClassLevel(item.Class_level || item.class_level || "");
    setSubject(item.Subject || item.subject || "");
    setDetails(item.Details || item.details || "");
    setDeadline((item.Deadline || item.deadline)?.split("T")[0] || "");
    setShowModal(true);
  };

  const deleteData = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/notifications/${id}`);
      setDeleteId(null);
      getData();
    } catch (err) {
      console.log(err);
    }
  };


  
  return (
    <>
      <div style={page.header}>
        <h2>แจ้งเตือนการบ้าน</h2>
        <button style={page.addBtn} onClick={() => setShowModal(true)}>
          + แจ้งเตือนใหม่
        </button>
      </div>

      <div style={page.grid}>
  {list
    // 🟢 ใส่ .filter ดักไว้ก่อน .map เพื่อล็อกให้แสดงเฉพาะห้องเรียนที่ต้องการ
    .filter((item) => {
      const currentClass = item.Class_level || item.class_level;
      return currentClass === "อนุบาล 1 ห้องปกติ"; // 👈 พิมพ์ชื่อห้องของลูกคุณตรงนี้ให้ตรงกับในระบบ
    })
    .map((item) => (
      <div key={item.Notification_id || item.notification_id} style={page.card}>
        <h3>{item.Class_level || item.class_level}</h3>
        <p><b>วิชา :</b> {item.Subject || item.subject}</p>
        <p>{item.Details || item.details}</p>
        <p>📅 ส่งงาน : {(item.Deadline || item.deadline) ? (item.Deadline || item.deadline).split("T")[0] : "-"}</p>
        <p>🔔 แจ้งเมื่อ : {(item.Date || item.date) ? (item.Date || item.date).split("T")[0] : "-"}</p>

        <div style={page.actions}>
          <button style={page.editBtn} onClick={() => openEdit(item)}>แก้ไข</button>
          <button style={page.deleteBtn} onClick={() => setDeleteId(item.Notification_id || item.notification_id)}>ลบ</button>
        </div>
      </div>
    ))}
</div>

      {showModal && (
        <div style={modal.overlay}>
          <div style={modal.box}>
            <h3>{editId ? "แก้ไขการแจ้งเตือน" : "เพิ่มการแจ้งเตือน"}</h3>

            <form onSubmit={saveData}>
              {/* 🟢 ส่วนตัวเลือกอันดับชั้นเรียนที่ปรับปรุงใหม่ */}
              <div style={modal.field}>
                <label style={modal.label}>ระดับชั้น</label>
                <select
                  value={class_level}
                  onChange={(e) => setClassLevel(e.target.value)}
                  required
                  style={modal.select}
                >
                  <option value="" disabled>-- เลือกรดับชั้น --</option>
                  {classOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div style={modal.field}>
                <label style={modal.label}>วิชา</label>
                <input 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  required 
                  style={modal.input}
                />
              </div>

              <div style={modal.field}>
                <label style={modal.label}>รายละเอียด</label>
                <textarea 
                  value={details} 
                  onChange={(e) => setDetails(e.target.value)} 
                  style={modal.textarea}
                />
              </div>

              <div style={modal.field}>
                <label style={modal.label}>กำหนดส่ง</label>
                <input 
                  type="date" 
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)} 
                  style={modal.input}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                <button type="button" onClick={resetForm} style={{ ...page.cancelBtn, flex: 1 }}>
                  ยกเลิก
                </button>
                <button type="submit" style={{ ...modal.saveBtn, flex: 1 }}>
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={modal.overlay}>
          <div style={modal.box}>
            <h3>ยืนยันการลบ</h3>
            <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
              <button onClick={() => setDeleteId(null)} style={{ ...page.cancelBtn, flex: 1 }}>
                ยกเลิก
              </button>
              <button style={page.deleteBtn} onClick={() => deleteData(deleteId)}>
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const page = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  addBtn: {
    padding: "9px 16px",
    border: "1px solid #0284c7",
    borderRadius: 8,
    background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    boxShadow: "0 10px 22px rgba(14,165,233,0.22)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 15,
    padding: 20,
    boxShadow: "0 5px 15px rgba(0,0,0,.1)",
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 15,
  },
  editBtn: {
    flex: 1,
    background: "#eff8ff",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },
  deleteBtn: {
    flex: 1,
    background: "#fff1f2",
    color: "#be123c",
    border: "1px solid #fecdd3",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },
  cancelBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #cfe8f7",
    background: "#ffffff",
    color: "#31556b",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
  },
};

const modal = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  box: {
    background: "#fff",
    width: 400,
    padding: 20,
    borderRadius: 15,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    fontSize: "14px",
  },
  // 🟢 สไตล์สำหรับอินพุตและ select เพื่อความกว้างที่เท่ากันและสวยงาม
  select: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  input: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
  },
  textarea: {
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "14px",
    outline: "none",
    minHeight: "60px",
    resize: "vertical",
  },
  saveBtn: {
    padding: 10,
    borderRadius: 10,
    background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    color: "#ffffff",
    border: "1px solid #0284c7",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 10px 22px rgba(14,165,233,0.22)",
  },
};

export default Notification;
