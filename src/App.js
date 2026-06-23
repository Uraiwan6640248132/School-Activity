import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🗂️ 1. Import Navbar ของทุกสิทธิ์แยกออกจากกันให้ชัดเจน
import NavbarTeacher from './navbar/nb';    
import NavbarAdmin from './navbar/nba';     
import NavbarParent from './navbar/nbp';    

// 🚪 หน้า Login
import Login from './login/login'; 

// 🧑‍🏫 2. หน้าเนื้อหาฝั่ง "คุณครู" (Teacher)
import Home from './teacher/home'; 
import StudentManagement from './teacher/student';
import Activity from './teacher/activity'; 
import PublicRelations from './teacher/publicrelation';
import Notification from "./teacher/notification";
import CalendarActivity from './teacher/calendar';
import PersonalData from './teacher/personal_data';
import Development from './teacher/development';
import ParticipatingActivities from './teacher/participating_activities'; 

// ⚙️ 3. หน้าเนื้อหาฝั่ง "แอดมิน" (Admin)
import HomeAdmin from './admin/homeadmin'; 

// 👨‍👩‍👧 4. หน้าเนื้อหาฝั่ง "ผู้ปกครอง" (Parent)
import HomeParent from './parent/homeparent'; 

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันส่วนกลางสำหรับการดึงข้อมูลสิทธิ์และปิดสถานะ Loading เสมอ
  const updateRoleAccess = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        // ดักสิทธิ์จากระบบหลังบ้านทั้งตัวพิมพ์เล็กและตัวพิมพ์ใหญ่
        const rawRole = userData.role || userData.Role || userData.status || userData.Status || "";
        const role = String(rawRole).toLowerCase().trim();
        setUserRole(role);
      } catch (e) {
        console.error("Error reading role parsing:", e);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
    // 🌟 บังคับปิดสถานะโหลดข้อมูลตรงนี้ เพื่อแก้ปัญหาหน้าจอค้างคำว่ากำลังโหลด
    setIsLoading(false);
  };

  // เรียกใช้ครั้งแรกเมื่อเปิดหน้าเว็บ
  useEffect(() => {
    updateRoleAccess();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: 40, fontFamily: 'Kanit, sans-serif', textAlign: 'center', color: '#64748b' }}>
        <h2>กำลังเรียกข้อมูลสิทธิ์ระบบ...</h2>
      </div>
    );
  }

  // 🔒 [หมวดที่ 1: ยังไม่ได้เข้าสู่ระบบ]
  if (!userRole) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={updateRoleAccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // ⚙️ [หมวดที่ 2: ล็อกอินเป็น แอดมิน (admin / 1)]
  if (userRole === 'admin' || userRole === '1') {
    return (
      <NavbarAdmin>
        <Routes>
          <Route path="/" element={<Navigate to="/homeadmin" replace />} />
          <Route path="/homeadmin" element={<HomeAdmin />} />
          <Route path="*" element={<Navigate to="/homeadmin" replace />} />
        </Routes>
      </NavbarAdmin>
    );
  }

  // 🧑‍🏫 [หมวดที่ 3: ล็อกอินเป็น คุณครู (teacher / 2)]
  if (userRole === 'teacher' || userRole === '2') {
    return (
      <NavbarTeacher>
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
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </NavbarTeacher>
    );
  }

  // 👨‍👩‍👧 [หมวดที่ 4: ล็อกอินเป็น ผู้ปกครอง (parent / 3)]
  return (
    <NavbarParent>
      <Routes>
        <Route path="/" element={<Navigate to="/homeparent" replace />} />
        <Route path="/homeparent" element={<HomeParent />} />
        <Route path="*" element={<Navigate to="/homeparent" replace />} />
      </Routes>
    </NavbarParent>
  );
}

export default App;