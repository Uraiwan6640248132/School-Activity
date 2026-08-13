import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PromoteClass() {
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [promotions, setPromotions] = useState({}); // เก็บค่า class_level ใหม่ของแต่ละคน { student_id: new_class_level }

  // 1. ดึงข้อมูลนักเรียนและปีการศึกษาเมื่อโหลดหน้า
  useEffect(() => {
    fetchAcademicYears();
    fetchStudents();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/academic-years');
      setAcademicYears(res.data);
      // ถ้ามีปีที่เป็น active ให้เลือกเป็นค่าเริ่มต้น
      const activeYear = res.data.find(y => y.is_active);
      if (activeYear) setSelectedYear(activeYear.year_id);
    } catch (err) {
      console.error("ดึงข้อมูลปีการศึกษาล้มเหลว", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/students?id=all');
      setStudents(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลนักเรียนล้มเหลว", err);
    }
  };

  // ดักจับการเปลี่ยนชั้นเรียนในตาราง
  const handleClassChange = (studentId, newClass) => {
    setPromotions(prev => ({
      ...prev,
      [studentId]: newClass
    }));
  };

  // บันทึกการเปลี่ยนชั้นเรียน (ยิง API ไป Backend)
  const handleSave = async (studentId) => {
    const newClassLevel = promotions[studentId];
    if (!newClassLevel) {
      alert("กรุณาเลือกชั้นเรียนใหม่ก่อนกดบันทึก");
      return;
    }
    if (!selectedYear) {
      alert("กรุณาเลือกปีการศึกษา");
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/students/promote', {
        Student_id: studentId,
        year_id: selectedYear,
        new_class_level: newClassLevel
      });
      alert("อัปเดตชั้นเรียนสำเร็จ!");
      fetchStudents(); // ดึงข้อมูลใหม่
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตชั้นเรียน");
    }
  };

  // กรองรายชื่อนักเรียนตามชั้นเรียนเดิม
  const filteredStudents = selectedClassFilter 
    ? students.filter(s => s.Class_level === selectedClassFilter)
    : students;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>🎓 จัดการเลื่อนชั้นเรียน / อัปเดตชั้นเรียน</h2>

      {/* เลือกปีการศึกษา */}
      <div style={{ marginBottom: '15px' }}>
        <label><b>ปีการศึกษาที่ดำเนินการ: </b></label>
        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ padding: '5px 10px', marginLeft: '10px' }}
        >
          <option value="">-- เลือกปีการศึกษา --</option>
          {academicYears.map((y) => (
            <option key={y.year_id} value={y.year_id}>
              ปีการศึกษา {y.year_name} {y.is_active ? '(ปัจจุบัน)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* กรองห้องเรียนเดิม */}
      <div style={{ marginBottom: '20px' }}>
        <label><b>กรองตามชั้นเรียนเดิม: </b></label>
        <select 
          value={selectedClassFilter} 
          onChange={(e) => setSelectedClassFilter(e.target.value)}
          style={{ padding: '5px 10px', marginLeft: '10px' }}
        >
          <option value="">-- แสดงทั้งหมด --</option>
          <option value="อนุบาล 1">อนุบาล 1</option>
          <option value="อนุบาล 2">อนุบาล 2</option>
          <option value="อนุบาล 3">อนุบาล 3</option>
        </select>
      </div>

      {/* ตารางนักเรียน */}
      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textIndent: 'initial' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>รหัส</th>
            <th>ชื่อ-นามสกุล</th>
            <th>ชั้นเรียนปัจจุบัน</th>
            <th>เลือกชั้นเรียนใหม่ (เลื่อนชั้น)</th>
            <th>ดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student) => (
            <tr key={student.Student_id}>
              <td>{student.Student_id}</td>
              <td>{student.Name}</td>
              <td>{student.Class_level || '-'}</td>
              <td>
                <select 
                  defaultValue=""
                  onChange={(e) => handleClassChange(student.Student_id, e.target.value)}
                  style={{ padding: '5px' }}
                >
                  <option value="" disabled>-- เลือกชั้นเรียนใหม่ --</option>
                  <option value="อนุบาล 1">อนุบาล 1</option>
                  <option value="อนุบาล 2">อนุบาล 2</option>
                  <option value="อนุบาล 3">อนุบาล 3</option>
                  <option value="จบการศึกษา">จบการศึกษา</option>
                </select>
              </td>
              <td>
                <button 
                  onClick={() => handleSave(student.Student_id)}
                  style={{ padding: '5px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                >
                  บันทึก
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PromoteClass;