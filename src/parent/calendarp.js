import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const BASE_URL = "http://localhost:3001";

function NotificationCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/notifications`);
      
      // 🟢 ดึงข้อมูลมาแปลงเป็น Event รูปแบบ Read-Only
      const formattedEvents = res.data.map((item) => {
        const deadlineDate = item.Deadline || item.deadline;
        
        return {
          id: item.Notification_id || item.notification_id,
          title: `[${item.Class_level || item.class_level}] ${item.Subject || item.subject}`,
          start: deadlineDate ? deadlineDate.split("T")[0] : null, 
          description: item.Details || item.details,
          // แยกสีตามประเภทห้องเรียนเพื่อให้อ่านง่าย
          backgroundColor: (item.Class_level || item.class_level)?.includes("3 ภาษา") ? "#e67e22" : "#3498db",
          borderColor: "transparent"
        };
      }).filter(event => event.start);

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Error fetching calendar data:", err);
    }
  };

  // 🟢 ฟังก์ชันสำหรับคลิกดูรายละเอียดอย่างเดียว (แก้ไขไม่ได้)
  const handleEventClick = (info) => {
    alert(`
      📌 ระดับชั้นและวิชา: ${info.event.title}
      📅 กำหนดส่งงาน: ${info.event.startStr}
      📝 รายละเอียดเพิ่มเติม: ${info.event.extendedProps.description || "ไม่มีรายละเอียด"}
    `);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📅 ปฏิทินกำหนดส่งการบ้าน (ดูข้อมูล)</h2>
        <div style={styles.legend}>
          <span style={{ ...styles.dot, background: "#3498db" }}></span> ห้องปกติ
          <span style={{ ...styles.dot, background: "#e67e22", marginLeft: 15 }}></span> ห้อง 3 ภาษา
        </div>
      </div>
      
      <div style={styles.calendarBox}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick} // คลิกเพื่อดูได้อย่างเดียว
          locale="th" 
          height="auto"
          editable={false} // 🔒 ล็อกไม่ให้ลากวางหรือขยับแถบวันบนปฏิทิน
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#f8f9fa",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  legend: {
    fontSize: "14px",
    display: "flex",
    alignItems: "center"
  },
  dot: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    marginRight: "5px"
  },
  calendarBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 5px 15px rgba(0,0,0,.08)",
  }
};

export default NotificationCalendar;