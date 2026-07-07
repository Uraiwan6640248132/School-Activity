import axios from "axios";
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3001";

function Notification() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/notifications`);
      setList(res.data);
    } catch (err) {
      console.log("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page.container}>
      <div style={page.header}>
        <h2 style={{ margin: 0, color: '#0369a1' }}>แจ้งเตือนการบ้าน</h2>
        {loading && <span style={page.loadingText}>กำลังอัปเดตข้อมูล...</span>}
      </div>

      <div style={page.grid}>
        {list
          // 🟢 1. ใส่ filter ดักไว้ตรงนี้เพื่อล็อกเอาเฉพาะห้องเรียนของลูกเรา
          .filter((item) => {
            const currentClass = item.Class_level || item.class_level;
            return currentClass === "อนุบาล 1 ห้องปกติ";
          })
          // 2. นำข้อมูลเฉพาะห้องที่กรองแล้วมาวาดการ์ดแสดงผลต่อ
          .map((item) => {
            // ตรวจสอบว่าเป็นห้อง 3 ภาษาเพื่อปรับแต่งธีมขอบการ์ดให้เด่นขึ้น (ถ้าต้องการ)
            const isSpecialClass = (item.Class_level || item.class_level)?.includes("3 ภาษา");

            return (
              <div
                key={item.Notification_id || item.notification_id}
                style={{
                  ...page.card,
                  borderTop: isSpecialClass ? "5px solid #e67e22" : "5px solid #3498db"
                }}
              >
                <span style={{
                  ...page.badge,
                  background: isSpecialClass ? "#edf2f7" : "#ebf8ff",
                  color: isSpecialClass ? "#b7791f" : "#2b6cb0"
                }}>
                  {item.Class_level || item.class_level}
                </span>

                <h3 style={page.subjectText}>
                  <b>วิชา:</b> {item.Subject || item.subject}
                </h3>

                <p style={page.detailsText}>
                  {item.Details || item.details || "— ไม่มีรายละเอียดเพิ่มเติม —"}
                </p>

                <hr style={page.divider} />

                <div style={page.dateInfo}>
                  <p style={page.dateText}>
                    📅 <b>ส่งงานภายใน:</b> {(item.Deadline || item.deadline) ? (item.Deadline || item.deadline).split("T")[0] : "-"}
                  </p>
                  <p style={page.dateNotifyText}>
                    🔔 <b>วันที่แจ้งงาน:</b> {(item.Date || item.date) ? (item.Date || item.date).split("T")[0] : "-"}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {!loading && list.length === 0 && (
        <div style={page.emptyState}>ไม่มีรายการแจ้งเตือนการบ้านในขณะนี้</div>
      )}
    </div>
  );
}

const page = {
  container: {
    padding: "20px",
    fontFamily: "inherit"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    borderBottom: "2px solid #edf2f7",
    paddingBottom: "10px"
  },
  loadingText: {
    fontSize: "14px",
    color: "#4a5568"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  badge: {
    alignSelf: "flex-start",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "12px"
  },
  subjectText: {
    margin: "0 0 10px 0",
    fontSize: "16px",
    color: "#2d3748"
  },
  detailsText: {
    margin: "0 0 15px 0",
    color: "#718096",
    fontSize: "14px",
    lineHeight: "1.5",
    whiteSpace: "pre-line" // รองรับการขึ้นบรรทัดใหม่จากข้อความดั้งเดิม
  },
  divider: {
    border: "0",
    borderTop: "1px solid #edf2f7",
    margin: "10px 0"
  },
  dateInfo: {
    fontSize: "13px"
  },
  dateText: {
    margin: "4px 0",
    color: "#e53e3e" // เน้นสีแดงที่วันส่งงานเพื่อความชัดเจน
  },
  dateNotifyText: {
    margin: "4px 0",
    color: "#4a5568"
  },
  emptyState: {
    textAlign: "center",
    padding: "4px 0",
    color: "#a0aec0",
    marginTop: "4px"
  }
};

export default Notification;