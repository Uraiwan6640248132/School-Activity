import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3001";

function Notification() {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // สเตตสำหรับเก็บค่าอินพุต
  const [class_level, setClassLevel] = useState("อนุบาล 1 ห้องปกติ");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");

  // รายการระดับชั้นเรียนแบบตัวเลือก
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
    setClassLevel("อนุบาล 1 ห้องปกติ");
    setSubject("");
    setDetails("");
    setDeadline("");
    setShowModal(false);
  };

  const saveData = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

    const data = {
      User_id: 1,
      Class_level: class_level,
      Subject: subject,
      Deadline: deadline || todayStr,
      Date: todayStr,
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
    <div style={page.container}>
      <div style={page.header}>
        <h2 style={page.title}>แจ้งเตือนการบ้าน</h2>

        <button style={page.addBtn} onClick={() => setShowModal(true)}>
          + แจ้งเตือนใหม่
        </button>
      </div>

      <div style={page.grid}>
        {list
          .filter((item) => {
            const currentClass = item.Class_level || item.class_level;
            return currentClass === "อนุบาล 1 ห้องปกติ";
          })
          .map((item) => (
            <div key={item.Notification_id || item.notification_id} style={page.card}>
              <h3 style={page.cardTitle}>{item.Class_level || item.class_level}</h3>
              <p style={page.cardText}>
                <span style={{ color: "#64748b" }}>วิชา :</span> <strong style={{ color: "#0f172a" }}>{item.Subject || item.subject}</strong>
              </p>
              <p style={{ ...page.cardText, color: "#475569", margin: "8px 0" }}>{item.Details || item.details}</p>

              <div style={page.dateGroup}>
                <p style={page.cardDate}>📅 ส่งงาน : {(item.Deadline || item.deadline) ? (item.Deadline || item.deadline).split("T")[0] : "-"}</p>
                <p style={page.cardDate}>🔔 แจ้งเมื่อ : {(item.Date || item.date) ? (item.Date || item.date).split("T")[0] : "-"}</p>
              </div>

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
            <h3 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "18px" }}>
              {editId ? "แก้ไขการแจ้งเตือน" : "เพิ่มการแจ้งเตือน"}
            </h3>

            <form onSubmit={saveData}>
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

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
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
            <h3 style={{ margin: "0 0 12px 0", color: "#1e293b" }}>ยืนยันการลบ</h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>คุณแน่ใจหรือไม่ว่าต้องการลบแจ้งเตือนนี้?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ ...page.cancelBtn, flex: 1 }}>
                ยกเลิก
              </button>
              <button style={{ ...page.deleteBtn, flex: 1 }} onClick={() => deleteData(deleteId)}>
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const page = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    margin: 0,
    color: '#0369a1',
    fontSize: "22px",
    fontWeight: "600"
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
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 24,
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 24,
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
  },
  cardTitle: {
    margin: "0 0 12px 0",
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: "600"
  },
  cardText: {
    margin: "4px 0",
    fontSize: "14px",
    color: "#334155"
  },
  dateGroup: {
    borderTop: "1px dashed #f1f5f9",
    paddingTop: 10,
    marginTop: 12,
  },
  cardDate: {
    margin: "4px 0",
    fontSize: "13px",
    color: "#64748b"
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
    background: "rgba(15, 23, 42, 0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  box: {
    background: "#ffffff",
    width: 380,
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
    fontSize: "13px",
    color: "#475569"
  },
  select: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: "14px",
    color: "#334155",
    outline: "none",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#334155",
    outline: "none",
  },
  textarea: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#334155",
    outline: "none",
    minHeight: "70px",
    resize: "vertical",
  },
  saveBtn: {
    padding: "8px 16px",
    borderRadius: 6,
    background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
    color: "#ffffff",
    border: "1px solid #0284c7",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 10px 22px rgba(14,165,233,0.22)",
  },
};

export default Notification;