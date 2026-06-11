import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom'; // เอา BrowserRouter ออกไป
import Navbar from './navbar/nb';
import StudentManagement from './teacher/student';

// สร้างคอมโพเนนต์จำลองหน้าอื่นไว้เพื่อให้ลิงก์กดไปแล้วไม่พัง
const ActivityPage = () => <h2 style={{ padding: 20 }}>หน้ากิจกรรม (กำลังพัฒนา)</h2>;
const NotificationsPage = () => <h2 style={{ padding: 20 }}>หน้าแจ้งเตือนการบ้าน (กำลังพัฒนา)</h2>;

function App() {
  return (
    <div>
      {/* ใช้ Navbar ครอบเอาไว้ด้านนอกสุด เพื่อให้ Sidebar แสดงผลทุกหน้า */}
      <Navbar>
        <Routes>
          {/* 1. หน้าแรกสุดให้เด้งไปที่หน้า /students อัตโนมัติ */}
          <Route path="/" element={<Navigate to="/students" />} />

          {/* 2. เมื่อ URL เป็น /students หรือเมื่อกดเมนู ข้อมูลนักเรียน ให้แสดงหน้านี้ */}
          <Route path="/students" element={<StudentManagement />} />

          {/* 3. ลิงก์หน้าอื่นๆ ที่มีในระบบ Navbar ของคุณ */}
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </Navbar>
    </div>
  );
}

export default App;