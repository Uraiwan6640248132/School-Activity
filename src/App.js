import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './navbar/nb';
import StudentManagement from './teacher/student';
import Activity from './teacher/activity'; // ดึงไฟล์กิจกรรมตัวจริงมาใช้แล้ว
import PublicRelations from './teacher/publicrelation';
import Notification from "./teacher/notification";
import CalendarActivity from './teacher/calendar';

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
          
        {/* 🟢 แก้ไขจาก /notification เป็น /notifications เพื่อให้ตรงกับลิงก์ระบบ */}
          <Route path="/notifications" element={<Notification />} />
          <Route path="/publicRelations" element={<PublicRelations />} />
          {/* เปลี่ยนจาก path="/calendar" เป็น path="/event" */}
          <Route path="/event" element={<CalendarActivity />} />
        </Routes>
      </Navbar>
    </div>
  );
}

export default App;