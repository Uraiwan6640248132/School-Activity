import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// Navbar
import NavbarTeacher from './navbar/nb';
import NavbarAdmin from './navbar/nba';
import NavbarParent from './navbar/nbp';

// Login
import Login from './login/login';

// Teacher
import Home from './teacher/home';
import StudentManagement from './teacher/student';
import Activity from './teacher/activity';
import PublicRelations from './teacher/publicrelation';
import Notification from './teacher/notification';
import CalendarActivity from './teacher/calendar';
import PersonalData from './teacher/personal_data';
import Development from './teacher/development';
import ParticipatingActivities from './teacher/participating_activities';

// Admin
import HomeAdmin from './admin/homeadmin';
import UserInformation from './admin/user_information'; 

// Parent
import HomeParent from './parent/homeparent';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateRoleAccess = () => {
    const user = localStorage.getItem("user");

    if (user) {
      try {
        const userData = JSON.parse(user);

        // รองรับ role หลายรูปแบบ
        const rawRole =
          userData.role ||
          userData.Role ||
          userData.status ||
          userData.Status ||
          "";

        // แปลงเป็นตัวพิมพ์เล็ก และตัดช่องว่างออก
        const role = String(rawRole).toLowerCase().trim();

        console.log("Role =", role);
        setUserRole(role);
      } catch (err) {
        console.error("Error parsing user :", err);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    updateRoleAccess();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>กำลังโหลด...</h2>
      </div>
    );
  }

  // ยังไม่ได้ Login
  if (!userRole) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login onLoginSuccess={updateRoleAccess} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // --------------------------------------------------------
  // 🛡️ ADMIN ACCESS (แก้ไขจุดนี้ ย้ายหน้ากำหนดสิทธิ์มาอยู่นี่แล้ว)
  // --------------------------------------------------------
  if (
    userRole === "admin" ||
    userRole === "1" ||
    userRole === "แอดมิน"
  ) {
    return (
      <NavbarAdmin>
        <Routes>
          <Route path="/" element={<Navigate to="/homeadmin" replace />} />
          <Route path="/homeadmin" element={<HomeAdmin />} />
          {/* ✨ [แก้ไข] เปิดเส้นทางหน้าจัดการสิทธิ์ผู้ใช้งานให้แอดมิน และตั้งชื่อให้ตรงเนฟบาร์ */}
          <Route path="/user_information" element={<UserInformation />} /> 
          <Route path="*" element={<Navigate to="/homeadmin" replace />} />
        </Routes>
      </NavbarAdmin>
    );
  }

  // --------------------------------------------------------
  // 👩‍🏫 TEACHER ACCESS
  // --------------------------------------------------------
  if (
    userRole === "teacher" ||
    userRole === "2" ||
    userRole === "ครู" ||
    userRole === "ครูผู้สอน"
  ) {
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

  // --------------------------------------------------------
  // 👨‍👩‍👦 PARENT ACCESS
  // --------------------------------------------------------
  if (
    userRole === "parent" ||
    userRole === "3" ||
    userRole === "ผู้ปกครอง"
  ) {
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
}

export default App;