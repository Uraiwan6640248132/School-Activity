import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './navbar/nb';
import StudentManagement from './teacher/student';
import Activity from './teacher/activity'; // ดึงไฟล์กิจกรรมตัวจริงมาใช้แล้ว
import PublicRelations from './teacher/publicrelation';

// สร้างคอมโพเนนต์จำลองหน้าอื่นไว้เพื่อให้ลิงก์กดไปแล้วไม่พัง
const NotificationsPage = () => <h2 style={{ padding: 20 }}>หน้าแจ้งเตือนการบ้าน (กำลังพัฒนา)</h2>;

function App() {
  return (
    <div>
      {/* ใช้ Navbar ครอบเอาไว้ด้านนอกสุด เพื่อให้ Sidebar แสดงผลทุกหน้า */}
      <Navbar>
        <Routes>
          {/* 1. หน้าแรกสุดให้เด้งไปที่หน้า /students อัตโนมัติ */}
          <Route path="/" element={<Navigate to="/students" />} />

          {/* 2. เมื่อ URL เป็น /students ให้แสดงหน้าจัดการข้อมูลนักเรียน */}
          <Route path="/students" element={<StudentManagement />} />

          {/* 3. ลิงก์ไปหน้ากิจกรรมตัวจริงที่เชื่อมฐานข้อมูลแล้ว */}
          <Route path="/activity" element={<Activity />} />
          
          {/* 4. หน้าแจ้งเตือนการบ้าน */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/publicRelations" element={<PublicRelations />} />
        </Routes>
      </Navbar>
    </div>
  );
}

export default App;