import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Navbar from './navbar/nb';
import StudentManagement from './teacher/student';

// 1. เพิ่มการ Import หน้าประชาสัมพันธ์ (ปรับพาร์ทที่อยู่ไฟล์ให้ตรงกับเครื่องของคุณ เช่นถ้าอยู่ในโฟลเดอร์เดียวกันให้ใช้ './teacher/publicrelations')
// บรรทัดที่ 7 แก้ไขจาก publicrelations เป็น publicrelation (เอา s ออก)
import PublicRelationsManagement from './teacher/publicrelation';

// คอมโพเนนต์จำลองหน้าอื่นที่ยังไม่ได้ทำ
const NotificationsPage = () => <h2 style={{ padding: 20 }}>หน้าแจ้งเตือนการบ้าน (กำลังพัฒนา)</h2>;

function App() {
  return (
    <div>
      {/* ใช้ Navbar ครอบเอาไว้ด้านนอกสุด เพื่อให้ Sidebar แสดงผลทุกหน้า */}
      <Navbar>
        <Routes>
          {/* หน้าแรกสุดให้เด้งไปที่หน้า /students อัตโนมัติ */}
          <Route path="/" element={<Navigate to="/students" />} />

          {/* หน้าแสดงข้อมูลจัดการนักเรียน */}
          <Route path="/students" element={<StudentManagement />} />

          {/* 2. เปลี่ยนจากหน้าจำลองอันเก่า ให้มาเปิดหน้าประชาสัมพันธ์ของจริงที่คุณเพิ่งสร้าง */}
          <Route path="/activity" element={<PublicRelationsManagement />} /> 

          {/* ลิงก์หน้าอื่นๆ ในระบบ Navbar */}
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </Navbar>
    </div>
  );
}

export default App;