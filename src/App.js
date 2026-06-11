import './App.css';
import Navbar from './navbar/nb';
import StudentManagement from './teacher/student';

function App() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>ระบบบันทึกกิจกรรมโรงเรียน</h1>
        {/* ต้องมีบรรทัดนี้อยู่ด้านล่างนะครับ หน้าเว็บถึงจะโผล่ */}
        <StudentManagement /> 
      </div>
    </div>
  );
}

export default App;