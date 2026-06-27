import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

// Navbar
import NavbarTeacher from './navbar/nb';
import NavbarAdmin from './navbar/nba';
import NavbarParent from './navbar/nbp'; // นำเข้าเนฟบาร์ผู้ปกครอง

// Login
import Login from './login/login';
import Register from './login/register';

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
import PersonalDataAd from './admin/personal_dataad';


// Parent
import HomeParent from './parent/homeparent';
import PersonalDataParent from './parent/personal_dataparent'; // นำเข้าหน้าข้อมูลส่วนตัวผู้ปกครอง
import StudentData from './parent/student_data';
import Developmentp from './parent/developmentp'; //
import Calendarp from './parent/calendarp';
import Notificationp from './parent/notificationp';
import PublicRelationsp from './parent/publicrelationp'; // นำเข้าหน้าประชาสัมพันธ์ผู้ปกครอง
import ActivityP from "./parent/activityp";


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
        <Route
          path="/register"
          element={<Register onRegisterSuccess={updateRoleAccess} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // --------------------------------------------------------
  // 🛡️ ADMIN ACCESS
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
          <Route path="/user_information" element={<UserInformation />} />
          <Route path="/personal_dataad" element={<PersonalDataAd />} />

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
  // 👨‍👩‍👦 PARENT ACCESS (ย้ายเส้นทางข้อมูลส่วนตัวผู้ปกครองมากลุ่มนี้แล้ว ✨)
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

          {/* 🎯 เปิดเส้นทางให้สิทธิ์ผู้ปกครองสามารถเข้าหน้าแก้ไขข้อมูลส่วนตัวตัวเองได้ที่นี่ */}
          <Route path="/personal_dataparent" element={<PersonalDataParent />} />
          <Route path="/student_data" element={<StudentData />} />
          <Route path="/developmentp" element={<Developmentp />} />
          <Route path="/calendarp" element={<Calendarp />} />
          <Route path="/notificationp" element={<Notificationp />} />
          <Route path="/publicrelationp" element={<PublicRelationsp />} />
          <Route path="/activityp" element={<ActivityP />} />
          <Route path="*" element={<Navigate to="/homeparent" replace />} />
        </Routes>
      </NavbarParent>
    );
  }
}

export default App;