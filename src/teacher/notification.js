import axios from "axios";
import { useEffect, useState } from "react";


const BASE_URL = "http://localhost:3001";

function Notification() {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // สเตตสำหรับเก็บค่าอินพุต
  const [class_level, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [date, setDate] = useState("");

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
    setClassLevel("");
    setSubject("");
    setDetails("");
    setDeadline("");
    setDate("");
    setShowModal(false);
  };

  const saveData = async (e) => {
    e.preventDefault();

    // 🟢 ปรับโครงสร้างข้อมูลให้ตรงตาม Column ในฐานข้อมูลจริง (ใช้คีย์ Date ตัวใหญ่)
    const data = {
      User_id: 1, 
      Class_level: class_level, 
      Subject: subject, 
      Deadline: deadline || null, 
      Date: date || null, // 👈 ใช้คีย์ "Date" ตามภาพจริงในฐานข้อมูลของคุณ
      Details: details || null 
    };

    try {
      if (editId) {
        await axios.put(
          `${BASE_URL}/notifications/${editId}`,
          data
        );
      } else {
        await axios.post(
          `${BASE_URL}/notifications`,
          data
        );
      }

      resetForm();
      getData();
    } catch (err) {
      console.log(err);
    }
  };

  const openEdit = (item) => {
    // 🟢 ดึงข้อมูลมาใส่ Form โดยเช็กทั้งแบบพิมพ์ใหญ่-เล็กให้ปลอดภัย
    setEditId(item.Notification_id || item.notification_id);
    setClassLevel(item.Class_level || item.class_level || "");
    setSubject(item.Subject || item.subject || "");
    setDetails(item.Details || item.details || "");
    setDeadline((item.Deadline || item.deadline)?.split("T")[0] || "");
    setDate((item.Date || item.date)?.split("T")[0] || ""); // 👈 อ้างอิงจากฟิลด์ Date
    setShowModal(true);
  };

  const deleteData = async (id) => {
    try {
      await axios.delete(
        `${BASE_URL}/notifications/${id}`
      );

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

        <button
          style={page.addBtn}
          onClick={() => setShowModal(true)}
        >
          + แจ้งเตือนใหม่
        </button>
      </div>

      <div style={page.grid}>
        {list.map((item) => (
          <div
            key={item.Notification_id || item.notification_id}
            style={page.card}
          >
            <h3>{item.Class_level || item.class_level}</h3>

            <p>
              <b>วิชา :</b> {item.Subject || item.subject}
            </p>

            <p>{item.Details || item.details}</p>

            <p>
              📅 ส่งงาน : 
              {(item.Deadline || item.deadline) ? (item.Deadline || item.deadline).split("T")[0] : "-"}
            </p>

            <p>
              🔔 แจ้งเมื่อ : 
              {(item.Date || item.date) ? (item.Date || item.date).split("T")[0] : "-"}
            </p>

            <div style={page.actions}>
              <button
                style={page.editBtn}
                onClick={() => openEdit(item)}
              >
                แก้ไข
              </button>

              <button
                style={page.deleteBtn}
                onClick={() =>
                  setDeleteId(item.Notification_id || item.notification_id)
                }
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>




      {showModal && (
        <div style={modal.overlay}>
          <div style={modal.box}>
            <h3>
              {editId
                ? "แก้ไขการแจ้งเตือน"
                : "เพิ่มการแจ้งเตือน"}
            </h3>

            <form onSubmit={saveData}>
              <div style={modal.field}>
                <label>ระดับชั้น</label>
                <input
                  value={class_level}
                  onChange={(e) => setClassLevel(e.target.value)}
                  required
                />
              </div>

              <div style={modal.field}>
                <label>วิชา</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div style={modal.field}>
                <label>รายละเอียด</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>

              <div style={modal.field}>
                <label>กำหนดส่ง</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div style={modal.field}>
                <label>วันที่แจ้ง</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
                <button 
                  type="button" 
                  onClick={resetForm}
                  style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc", background: "#fff" }}
                >
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
              <button
                onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc", background: "#fff" }}
              >
                ยกเลิก
              </button>
              <button
                style={page.deleteBtn}
                onClick={() => deleteData(deleteId)}
              >
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
    padding: 12,
    border: "none",
    borderRadius: 10,
    background: "#2ecc71",
    color: "#fff",
    cursor: "pointer",
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
    background: "#3498db",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
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
  saveBtn: {
    padding: 10,
    borderRadius: 10,
    border: "none",
    background: "#2ecc71",
    color: "#fff",
    cursor: "pointer",
  },
};

export default Notification;