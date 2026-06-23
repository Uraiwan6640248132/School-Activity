import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './navbar/nb';
import Home from './teacher/home'; // ✅ ลิงก์เข้าหาไฟล์ในโฟลเดอร์ teacher ถูกต้องแล้ว
import StudentManagement from './teacher/student';
import Activity from './teacher/activity'; 
import PublicRelations from './teacher/publicrelation';
import Notification from "./teacher/notification";
import CalendarActivity from './teacher/calendar';
import PersonalData from './teacher/personal_data';
import Development from './teacher/development';

// จุดที่ 1: Import คอมโพเนนต์ "เข้าร่วมกิจกรรม" เข้ามาใช้งาน
import ParticipatingActivities from './teacher/participating_activities'; 

function App() {
  return (
    <div>
      {/* ใช้ Navbar ครอบเอาไว้ด้านนอกสุด เพื่อให้ Sidebar แสดงผลทุกหน้า */}
      <Navbar>
        <Routes>
          {/* 1. เมื่อเปิดมาหน้าแรกสุด (/) ให้แสดงหน้า Home */}
          <Route path="/" element={<Home />} />

          {/* 🌟 เพิ่มตรงนี้: รองรับเวลาลิงก์อื่นหรือ Sidebar สั่งวิ่งมาที่พาร์ท "/home" ให้เปิดหน้า Home เช่นกัน */}
          <Route path="/home" element={<Home />} />

          {/* 2. เมื่อ URL เป็น /students ให้แสดงหน้าจัดการข้อมูลนักเรียน */}
          <Route path="/students" element={<StudentManagement />} />

          {/* 3. ลิงก์ไปหน้ากิจกรรมตัวจริงที่เชื่อมฐานข้อมูลแล้ว */}
          <Route path="/activity" element={<Activity />} />
          
          {/* จุดที่ 2: เส้นทาง URL สำหรับหน้าเช็คชื่อ/ดูประวัติการเข้าร่วมกิจกรรม */}
          <Route path="/participating" element={<ParticipatingActivities />} />
          
          <Route path="/notification" element={<Notification />} />
          {/* เส้นทางปฏิทินกิจกรรม */}
          <Route path="/event" element={<CalendarActivity />} />
          <Route path="/publicrelations" element={<PublicRelations />} />
          <Route path="/personal" element={<PersonalData />} />
          <Route path="/development" element={<Development />} />
        </Routes>
      </Navbar>
    </div>
  );
}

export default App;