import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './navbar/nb';
import Navbarp from './navbar/nbp';
import Home from './teacher/home'; 
import StudentManagement from './teacher/student';
import Activity from './teacher/activity'; 
import PublicRelations from './teacher/publicrelation';
import Notification from "./teacher/notification";
import CalendarActivity from './teacher/calendar';
import PersonalData from './teacher/personal_data';
import Development from './teacher/development';
import Login from './login/login'; 
import ParticipatingActivities from './teacher/participating_activities'; 

function App() {
  // สร้าง State เช็คสถานะการเข้าสู่ระบบ
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ตรวจสอบสถานะจาก LocalStorage ทุกครั้งที่เปิดเว็บขึ้นมาใหม่
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  // ฟังก์ชันช่วยจัดการเมื่อล็อกอินสำเร็จ
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // 1. กรณีที่ "ยังไม่ได้เข้าสู่ระบบ" ให้ดึงหน้า Login ออกมาแสดงด้านนอกแบบเต็มหน้าจอ (ไม่มี Navbar ครอบ)
  if (!isAuthenticated) {
    return (
      <Routes>
        {/* ส่งฟังก์ชัน handleLoginSuccess ไปให้หน้า Login สั่งทำงานเมื่อรหัสถูกต้อง */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        {/* ถ้าพยายามพิมพ์ URL ไปหน้าอื่น ให้เตะกลับมาหน้า Login เสมอ */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 2. กรณีที่ "เข้าสู่ระบบสำเร็จแล้ว" จะเอา Navbar มาครอบ และเปิดให้เข้าถึงหน้าเมนูด้านในทั้งหมดตามปกติ
  return (
    <div>
      <Navbar>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/participating" element={<ParticipatingActivities />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/event" element={<CalendarActivity />} />
          <Route path="/publicrelations" element={<PublicRelations />} />
          <Route path="/personal" element={<PersonalData />} />
          <Route path="/development" element={<Development />} />
          {/* ถ้าล็อกอินแล้วและหลงมาหน้า /login ให้ดีดไปหน้าแรกทันที */}
          <Route path="/login" element={<Navigate to="/home" replace />} />
        </Routes>
      </Navbar>
    </div>
  );
}

export default App;