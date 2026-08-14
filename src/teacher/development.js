import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// 📊 ลงทะเบียน Component ของ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// 📈 Component แสดงกราฟเปรียบเทียบแต่ละเทอม (ปรับสีให้เข้ากับธีมฟ้า-น้ำเงิน)
function TermComparisonChart({ studentDevList }) {
  const term1Data = studentDevList.find(d => (d.Term || d.term || '').includes('1'));
  const term2Data = studentDevList.find(d => (d.Term || d.term || '').includes('2'));

  const calculateScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const validScores = scores.map(s => isNaN(Number(s)) || s === '' ? 0 : Number(s));
    const sum = validScores.reduce((a, b) => a + b, 0);
    const avg = sum / validScores.length;
    return Math.round(avg * 20);
  };

  const getScores = (data) => {
    if (!data) return [0, 0, 0, 0];
    const body = data.Weight && data.Height ? 100 : 75;
    const intellect = calculateScore([data.Problem_solving, data.Communication, data.Remembering]);
    const emotion = calculateScore([data.Emotion, data.Emotion_control, data.Confidence]);
    const social = calculateScore([data.Stress, data.Interaction, data.Assistance]);
    return [body, intellect, emotion, social];
  };

  const scoresTerm1 = getScores(term1Data);
  const scoresTerm2 = getScores(term2Data);

  const chartData = {
    labels: ['ด้านร่างกาย', 'ด้านสติปัญญา', 'ด้านอารมณ์', 'ด้านสังคม'],
    datasets: [
      {
        label: 'ภาคเรียนที่ 1',
        data: scoresTerm1,
        backgroundColor: '#FFEBCD',
        borderColor: '#FFEBCD',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 48, // 👈 ขยายแท่งกราฟให้หนาขึ้น (เดิม 36)
      },
      {
        label: 'ภาคเรียนที่ 2',
        data: scoresTerm2,
        backgroundColor: '#d0d9ff',
        borderColor: '#d0d9ff',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 48, // 👈 ขยายแท่งกราฟให้หนาขึ้น
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    devicePixelRatio: 3,
    layout: { padding: { left: 20, right: 20, top: 15, bottom: 15 } },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#334155', padding: 20, font: { family: 'Tahoma', size: 14, weight: 'bold' } }
      },
      title: {
        display: true,
        text: '📊 กราฟเปรียบเทียบพัฒนาการรายภาคเรียน (คะแนนเต็ม 100)',
        color: '#1e293b',
        padding: { top: 10, bottom: 20 },
        font: { family: 'Tahoma', size: 16, weight: 'bold' }
      },
      tooltip: { titleFont: { family: 'Tahoma', size: 14 }, bodyFont: { family: 'Tahoma', size: 13 } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#334155', padding: 8, font: { family: 'Tahoma', size: 13, weight: 'bold' } } },
      y: { beginAtZero: true, max: 100, ticks: { stepSize: 20, color: '#334155', padding: 10, font: { family: 'Tahoma', size: 13, weight: 'bold' } }, grid: { color: '#e2e8f0', lineWidth: 1 } }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '380px', marginTop: '16px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default function Development() {
  const [devList, setDevList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [activeTab, setActiveTab] = useState('body');

  const [selectedId, setSelectedId] = useState(null);

  const initialFormState = {
    Student_id: '', Year: 2569, Term: 'ภาคเรียนที่ 1', date: new Date().toISOString().split('T')[0],
    Physical: '', Weight: '', Height: '', Dental_health: '', Vaccination: '', Motor_skills: '',
    Emotional: '', Emotion: '', Emotion_control: '', Confidence: '',
    Social: '', Stress: '', Interaction: '', Assistance: '',
    Intellectual: '', Problem_solving: '', Communication: '', Remembering: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const API_URL = 'http://localhost:3001/api/development';
  const STUDENTS_API_URL = 'http://localhost:3001/api/students?id=all';

  const getLoggedInUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  };

  const loggedInUser = getLoggedInUser();
  const loggedInRole = String(loggedInUser?.Role || loggedInUser?.role || '').trim();
  const teacherClassLevel = (loggedInRole === 'ครูผู้สอน')
    ? (loggedInUser?.Class_level || loggedInUser?.class_level || null)
    : null;

  const getCurrentClassLevel = (studentId) => {
    if (teacherClassLevel) return teacherClassLevel;
    const targetId = studentId || formData.Student_id;
    if (!targetId && students.length > 0) {
      const first = students[0];
      return first.Class_level || first.class_level || first.Level || first.level;
    }
    const found = students.find(s => String(s.Student_id || s.id || s.student_id) === String(targetId));
    return found ? (found.Class_level || found.class_level || found.Level || found.level) : null;
  };

  const isStudentAllowed = (studentId) => {
    if (!teacherClassLevel) return true;
    return students.some(s => String(s.Student_id || s.id || s.student_id) === String(studentId));
  };

  const fetchStudentsData = async () => {
    try {
      const res = await fetch(STUDENTS_API_URL);
      if (res.ok) {
        const data = await res.json();
        const allData = Array.isArray(data) ? data : [];

        const cleanData = teacherClassLevel
          ? allData.filter(s => {
            const level = s.Class_level || s.class_level || s.Level || s.level;
            return String(level) === String(teacherClassLevel);
          })
          : allData;

        setStudents(cleanData);

        if (cleanData.length > 0) {
          const firstStudent = cleanData[0];
          const firstId = String(firstStudent.Student_id || firstStudent.id || firstStudent.student_id);
          setFormData(prev => ({ ...prev, Student_id: firstId }));
        }

        if (teacherClassLevel) {
          fetchDevelopmentData(teacherClassLevel);
        } else if (cleanData.length > 0) {
          const level = cleanData[0].Class_level || cleanData[0].class_level || cleanData[0].Level || cleanData[0].level;
          if (level) {
            fetchDevelopmentData(level);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching students list:", err);
    }
  };

  const fetchDevelopmentData = async (classLevel) => {
    if (!classLevel) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?class_level=${encodeURIComponent(classLevel)}`);
      if (res.ok) {
        const data = await res.json();
        setDevList(data);
      }
    } catch (err) {
      console.error("Error fetching development data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, []);

  const getStudentName = useCallback((studentId) => {
    if (!students || students.length === 0) return `รหัส: ${studentId}`;
    const found = students.find(s => Number(s.Student_id || s.id || s.student_id) === Number(studentId));
    if (found) {
      return found.Name || found.name || `${found.First_name || ''} ${found.Last_name || ''}`.trim();
    }
    return `รหัสนักเรียน: ${studentId} (ไม่พบรายชื่อ)`;
  }, [students]);

  const calculateSectionScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const validScores = scores.map(s => isNaN(Number(s)) || s === '' ? 0 : Number(s));
    const sum = validScores.reduce((a, b) => a + b, 0);
    const avg = sum / validScores.length;
    return Math.round(avg * 20);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: String(value) }));
  };

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      Student_id: students.length > 0 ? String(students[0].Student_id || students[0].id || students[0].student_id) : ''
    });
    setSelectedId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!isStudentAllowed(formData.Student_id)) {
      alert("คุณสามารถเพิ่มพัฒนาการได้เฉพาะนักเรียนในห้องของคุณเท่านั้น");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("บันทึกการประเมินพัฒนาการเรียบร้อย!");
        setIsAddOpen(false);
        const currentLevel = getCurrentClassLevel(formData.Student_id);
        resetForm();
        fetchDevelopmentData(currentLevel);
      } else {
        alert("ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const openDetailModal = (item, tabCategory = 'body') => {
    setSelectedDetailItem(item);
    setActiveTab(tabCategory);
    setIsDetailOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedId(item.Development_id || item.development_id);

    let cleanDate = '';
    if (item.date_clean) {
      cleanDate = item.date_clean;
    } else if (item.Date) {
      cleanDate = String(item.Date).split('T')[0];
    } else if (item.date) {
      cleanDate = String(item.date).split('T')[0];
    }

    let dbTerm = item.Term || item.term || 'ภาคเรียนที่ 1';
    if (dbTerm.trim() === 'ภาคเรียนที่') {
      dbTerm = 'ภาคเรียนที่ 1';
    }

    setFormData({
      Student_id: String(item.Student_id || ''),
      Year: item.Year || 2569,
      Term: dbTerm,
      date: cleanDate,
      Physical: item.Physical || '',
      Weight: item.Weight || '',
      Height: item.Height || '',
      Dental_health: item.Dental_health || '',
      Vaccination: item.Vaccination || '',
      Motor_skills: item.Motor_skills || '',
      Emotional: item.Emotional || '',
      Emotion: item.Emotion ? String(item.Emotion) : '',
      Emotion_control: item.Emotion_control ? String(item.Emotion_control) : '',
      Confidence: item.Confidence ? String(item.Confidence) : '',
      Social: item.Social || '',
      Stress: item.Stress ? String(item.Stress) : '',
      Interaction: item.Interaction ? String(item.Interaction) : '',
      Assistance: item.Assistance ? String(item.Assistance) : '',
      Intellectual: item.Intellectual || '',
      Problem_solving: item.Problem_solving ? String(item.Problem_solving) : '',
      Communication: item.Communication ? String(item.Communication) : '',
      Remembering: item.Remembering ? String(item.Remembering) : ''
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    if (!isStudentAllowed(formData.Student_id)) {
      alert("คุณสามารถแก้ไขพัฒนาการได้เฉพาะนักเรียนในห้องของคุณเท่านั้น");
      return;
    }
    try {
      const studentClassLevel = getCurrentClassLevel(formData.Student_id);

      const res = await fetch(`${API_URL}/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          class_level: studentClassLevel
        })
      });

      if (res.ok) {
        alert("แก้ไขข้อมูลการประเมินสำเร็จ!");
        setIsEditOpen(false);
        const currentLevel = getCurrentClassLevel(formData.Student_id);
        resetForm();
        fetchDevelopmentData(currentLevel);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || errData.error || "ไม่สามารถแก้ไขข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("ลบข้อมูลการประเมินเรียบร้อย!");
        setIsDeleteOpen(false);
        const currentLevel = getCurrentClassLevel(formData.Student_id);
        resetForm();
        fetchDevelopmentData(currentLevel);
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const scoreLevels = [
    { label: 'ดีมาก', val: 5 },
    { label: 'ดี', val: 4 },
    { label: 'ปานกลาง', val: 3 },
    { label: 'พอใช้', val: 2 },
    { label: 'ปรับปรุง', val: 1 }
  ];

  const renderBadge = (scoreVal) => {
    const val = Number(scoreVal);
    let style = { backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' };
    let label = 'ไม่มีข้อมูล';

    if (val === 5) {
      label = 'ดีมาก (5)';
      style = { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
    } else if (val === 4) {
      label = 'ดี (4)';
      style = { backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' };
    } else if (val === 3) {
      label = 'ปานกลาง (3)';
      style = { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde047' };
    } else if (val === 2) {
      label = 'พอใช้ (2)';
      style = { backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fdba74' };
    } else if (val === 1) {
      label = 'ปรับปรุง (1)';
      style = { backgroundColor: '#ffe4e6', color: '#be123c', border: '1px solid #fca5a5' };
    }

    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textAlign: 'center',
        ...style
      }}>
        {label}
      </span>
    );
  };

  const groupedByStudent = devList.reduce((acc, item) => {
    const sId = String(item.Student_id);
    if (!acc[sId]) acc[sId] = [];
    acc[sId].push(item);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={styles.cardMain}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0369a1' }}>บันทึกพัฒนาการเด็ก</h2>
            {teacherClassLevel && (
              <p style={styles.studentNameDisplay}>
                <strong>ห้องที่รับผิดชอบ:</strong> {teacherClassLevel}
              </p>
            )}
          </div>
          <button
            style={styles.btnAddDev}
            onClick={() => { resetForm(); setIsAddOpen(true); }}
            disabled={teacherClassLevel !== null && students.length === 0}
          >
            + พัฒนาการ
          </button>
        </div>

        {loading && <p style={{ fontSize: '13px', color: '#666' }}>กำลังโหลดข้อมูล...</p>}

        <div style={styles.listContainer}>
          {teacherClassLevel && students.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>ไม่พบนักเรียนในห้อง "{teacherClassLevel}" ของคุณ</div>
          ) : devList.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>ยังไม่มีข้อมูลการประเมินพัฒนาการ</div>
          ) : (
            devList.map((item, idx) => {
              const scoreBody = item.Weight && item.Height ? 100 : 75;
              const scoreEmotion = calculateSectionScore([item.Emotion, item.Emotion_control, item.Confidence]);
              const scoreSocial = calculateSectionScore([item.Stress, item.Interaction, item.Assistance]);
              const scoreIntellect = calculateSectionScore([item.Problem_solving, item.Communication, item.Remembering]);

              const displayDate = item.date_clean ||
                (item.Date ? String(item.Date).split('T')[0] : '') ||
                (item.date ? String(item.date).split('T')[0] : 'ไม่ได้ระบุ');

              let displayTerm = item.Term || item.term || "ภาคเรียนที่ 1";
              if (displayTerm.trim() === 'ภาคเรียนที่') {
                displayTerm = 'ภาคเรียนที่ 1';
              }

              const studentDevs = groupedByStudent[String(item.Student_id)] || [];

              return (
                <div key={idx} style={styles.devCardItem}>
                  <div style={styles.cardItemHeader}>
                    <span style={styles.yearText}>
                      <strong style={{ color: '#0f172a', fontSize: '16px' }}>{item.Student_name || getStudentName(item.Student_id)}</strong><br />
                      ปีการศึกษา {item.Year || item.year || '2569'} - {displayTerm}<br />
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal' }}>วันที่ประเมิน: {displayDate}</span>
                    </span>
                    <div style={styles.actionGroup}>
                      <button style={{ ...styles.actionBtnSmall, ...styles.actionBtnEdit }} onClick={() => openEditModal(item)}>แก้ไข</button>
                      <button style={{ ...styles.actionBtnSmall, ...styles.actionBtnDelete }} onClick={() => { setSelectedId(item.Development_id || item.development_id); setIsDeleteOpen(true); }}>ลบ</button>
                    </div>
                  </div>

                  <div style={styles.circlesRow}>
                    <div style={styles.circleUnit} onClick={() => openDetailModal(item, 'body')} title="คลิกดูพัฒนาการด้านร่างกาย">
                      <div style={styles.circleScore}>{isNaN(scoreBody) ? 0 : scoreBody}</div>
                      <span style={styles.circleLabel}>ด้านร่างกาย</span>
                    </div>
                    <div style={styles.circleUnit} onClick={() => openDetailModal(item, 'intellect')} title="คลิกดูพัฒนาการด้านสติปัญญา">
                      <div style={styles.circleScore}>{isNaN(scoreIntellect) ? 0 : scoreIntellect}</div>
                      <span style={styles.circleLabel}>ด้านสติปัญญา</span>
                    </div>
                    <div style={styles.circleUnit} onClick={() => openDetailModal(item, 'emotion')} title="คลิกดูพัฒนาการด้านอารมณ์">
                      <div style={styles.circleScore}>{isNaN(scoreEmotion) ? 0 : scoreEmotion}</div>
                      <span style={styles.circleLabel}>ด้านอารมณ์</span>
                    </div>
                    <div style={styles.circleUnit} onClick={() => openDetailModal(item, 'social')} title="คลิกดูพัฒนาการด้านสังคม">
                      <div style={styles.circleScore}>{isNaN(scoreSocial) ? 0 : scoreSocial}</div>
                      <span style={styles.circleLabel}>ด้านสังคม</span>
                    </div>
                  </div>

                  <TermComparisonChart studentDevList={studentDevs} />

                  <div style={styles.bodyDetailsSummary}>
                    <span>น้ำหนัก: <strong>{item.Weight || '-'}</strong> กก.</span>
                    <span>ส่วนสูง: <strong>{item.Height || '-'}</strong> ซม.</span>
                    <span>สุขภาพฟัน: <strong style={{ color: '#2e7d32' }}>{item.Dental_health || 'ปกติ'}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL DETAIL */}
      {isDetailOpen && selectedDetailItem && (
        <div style={styles.overlay} onClick={() => setIsDetailOpen(false)}>
          <div style={styles.modalDev} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>
                ปีการศึกษา {selectedDetailItem.Year || '2569'} ({selectedDetailItem.Term || 'ภาคเรียนที่ 1'})
              </span>
              <strong style={{ fontSize: '16px', color: '#0369a1' }}>รายละเอียดพัฒนาการเด็ก</strong>
              <span style={styles.closeX} onClick={() => setIsDetailOpen(false)}>✕</span>
            </div>

            <div style={styles.formScrollable}>
              <div style={styles.detailStudentCard}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                  นักเรียน: {selectedDetailItem.Student_name || getStudentName(selectedDetailItem.Student_id)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  วันที่ประเมิน: {selectedDetailItem.date_clean || (selectedDetailItem.date ? String(selectedDetailItem.date).split('T')[0] : 'ไม่ระบุ')}
                </div>
              </div>

              <h4 style={styles.detailSectionHeader}>📌 ข้อมูลกายภาพหลัก (ด้านร่างกาย)</h4>
              <div style={styles.detailBodyGrid}>
                <div style={styles.detailBodyItem}>น้ำหนัก: <strong>{selectedDetailItem.Weight || '-'} กก.</strong></div>
                <div style={styles.detailBodyItem}>ส่วนสูง: <strong>{selectedDetailItem.Height || '-'} ซม.</strong></div>
                <div style={styles.detailBodyItem}>สุขภาพฟัน: <strong>{selectedDetailItem.Dental_health || 'ไม่ได้ระบุ'}</strong></div>
                <div style={styles.detailBodyItem}>วัคซีน: <strong>{selectedDetailItem.Vaccination || 'ไม่ได้ระบุ'}</strong></div>
                <div style={{ ...styles.detailBodyItem, gridColumn: 'span 2' }}>การเคลื่อนไหว (Motor): <strong>{selectedDetailItem.Motor_skills || 'ไม่ได้ระบุ'}</strong></div>
              </div>

              <div style={styles.tabContainer}>
                <button style={{ ...styles.tabBtn, ...(activeTab === 'body' ? styles.tabBtnActive : {}) }} onClick={() => setActiveTab('body')}>
                  ด้านร่างกาย
                </button>
                <button style={{ ...styles.tabBtn, ...(activeTab === 'emotion' ? styles.tabBtnActive : {}) }} onClick={() => setActiveTab('emotion')}>
                  ด้านอารมณ์
                </button>
                <button style={{ ...styles.tabBtn, ...(activeTab === 'social' ? styles.tabBtnActive : {}) }} onClick={() => setActiveTab('social')}>
                  ด้านสังคม
                </button>
                <button style={{ ...styles.tabBtn, ...(activeTab === 'intellect' ? styles.tabBtnActive : {}) }} onClick={() => setActiveTab('intellect')}>
                  ด้านสติปัญญา
                </button>
              </div>

              <h4 style={styles.detailSectionHeader}>
                📋 รายละเอียดหัวข้อย่อย
                {activeTab === 'body' && ' (ด้านร่างกาย)'}
                {activeTab === 'emotion' && ' (ด้านอารมณ์)'}
                {activeTab === 'social' && ' (ด้านสังคม)'}
                {activeTab === 'intellect' && ' (ด้านสติปัญญา)'}
              </h4>

              <table style={styles.detailTable}>
                <thead>
                  <tr>
                    <th style={{ ...styles.detailTh, textAlign: 'left' }}>หัวข้อพัฒนาการ</th>
                    <th style={{ ...styles.detailTh, textAlign: 'center', width: '130px' }}>ระดับผลประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'body' && (
                    <>
                      <tr style={styles.detailCategoryRow}><td colSpan="2">• พัฒนาการด้านร่างกายและการเคลื่อนไหว</td></tr>
                      <tr><td style={styles.detailTdLeft}>ทักษะการเคลื่อนไหวและการทรงตัว</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Motor_skills ? 4 : 3)}</td></tr>
                      <tr><td style={styles.detailTdLeft}>ความสมบูรณ์ของร่างกายตามเกณฑ์</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Weight && selectedDetailItem.Height ? 5 : 3)}</td></tr>
                    </>
                  )}

                  {activeTab === 'emotion' && (
                    <>
                      <tr style={styles.detailCategoryRow}><td colSpan="2">• พัฒนาการด้านอารมณ์</td></tr>
                      <tr><td style={styles.detailTdLeft}>การแสดงออกทางอารมณ์</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Emotion)}</td></tr>
                      <tr><td style={styles.detailTdLeft}>การควบคุมอารมณ์</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Emotion_control)}</td></tr>
                      <tr><td style={styles.detailTdLeft}>ความมั่นใจในตัวเอง</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Confidence)}</td></tr>
                    </>
                  )}

                  {activeTab === 'social' && (
                    <>
                      <tr style={styles.detailCategoryRow}><td colSpan="2">• พัฒนาการด้านสังคม</td></tr>
                      <tr><td style={styles.detailTdLeft}>การจัดการความเครียด</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Stress)}</td></tr>
                      <tr><td style={styles.detailTdLeft}>การมีปฏิสัมพันธ์กับผู้อื่น</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Interaction)}</td></tr>
                      <tr><td style={styles.detailTdLeft}>การเอื้อเฟื้อช่วยเหลือ</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Assistance)}</td></tr>
                    </>
                  )}

                  {activeTab === 'intellect' && (
                    <>
                      <tr style={styles.detailCategoryRow}><td colSpan="2">• พัฒนาการด้านสติปัญญา</td></tr>
                      <tr><td style={styles.detailTdLeft}>การคิดแก้ปัญหา</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Problem_solving)}</td></tr>
                      <tr><td style={styles.detailTdLeft}>ทักษะการสื่อสาร</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Communication)}</td></tr>
                      <tr><td style={styles.detailTdLeft}>ความสามารถในการจดจำ</td><td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Remembering)}</td></tr>
                    </>
                  )}
                </tbody>
              </table>

              <div style={styles.criteriaCard}>
                <div style={styles.criteriaTitle}>ℹ️ คำอธิบายเกณฑ์ระดับผลการประเมิน</div>
                <ul style={styles.criteriaList}>
                  <li><strong style={{ color: '#15803d' }}>ดีมาก (5):</strong> ปฏิบัติได้ถูกต้อง รวดเร็ว สม่ำเสมอ และสามารถช่วยเหลือผู้อื่นได้</li>
                  <li><strong style={{ color: '#0369a1' }}>ดี (4):</strong> ปฏิบัติได้ด้วยตนเอง มีความคล่องแคล่วและถูกต้องเป็นส่วนใหญ่</li>
                  <li><strong style={{ color: '#b45309' }}>ปานกลาง (3):</strong> ปฏิบัติได้ตามเกณฑ์มาตรฐาน มีความพร้อมในระดับทั่วไป</li>
                  <li><strong style={{ color: '#c2410c' }}>พอใช้ (2):</strong> ปฏิบัติได้เมื่อได้รับการแนะนำ กระตุ้น หรือช่วยเหลือในบางครั้ง</li>
                  <li><strong style={{ color: '#be123c' }}>ปรับปรุง (1):</strong> ยังไม่สามารถปฏิบัติได้ หรือต้องได้รับการดูแลช่วยเหลืออย่างใกล้ชิด</li>
                </ul>
              </div>

              <button type="button" style={styles.btnSaveEvaluation} onClick={() => setIsDetailOpen(false)}>
                ปิดหน้าต่างรายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่ม / แก้ไข */}
      {(isAddOpen || isEditOpen) && (
        <div style={styles.overlay}>
          <div style={styles.modalDev}>
            <div style={styles.modalHeader}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>ปีการศึกษา {formData.Year}</span>
              <strong style={{ fontSize: '15px' }}>{isAddOpen ? "เพิ่มการพัฒนา" : "แก้ไขการพัฒนา"}</strong>
              <span style={styles.closeX} onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>✕</span>
            </div>

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} style={styles.formScrollable}>
              <div style={{ marginBottom: '15px' }}>
                <label style={styles.labelMini}>เลือกนักเรียนที่ต้องการประเมิน</label>
                <select
                  name="Student_id"
                  value={String(formData.Student_id)}
                  onChange={handleChange}
                  style={{ ...styles.inputMini, padding: '6px' }}
                  required
                >
                  <option value="" disabled>-- กรุณาเลือกนักเรียน --</option>
                  {students.map((std) => {
                    const id = String(std.Student_id || std.id || std.student_id);
                    const name = std.Name || std.name || `${std.First_name || ''} ${std.Last_name || ''}`;
                    return (
                      <option key={id} value={id}>
                        รหัส {id} - {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ ...styles.bodyMetricsRow, marginBottom: '15px' }}>
                <div style={{ ...styles.inputMiniGroup, width: '31%' }}>
                  <label style={styles.labelMini}>ปีการศึกษา (พ.ศ.)</label>
                  <input type="number" name="Year" value={formData.Year} onChange={handleChange} style={styles.inputMini} required />
                </div>
                <div style={{ ...styles.inputMiniGroup, width: '35%' }}>
                  <label style={styles.labelMini}>ภาคเรียน</label>
                  <select name="Term" value={formData.Term} onChange={handleChange} style={{ ...styles.inputMini, padding: '5px' }}>
                    <option value="ภาคเรียนที่ 1">ภาคเรียนที่ 1</option>
                    <option value="ภาคเรียนที่ 2">ภาคเรียนที่ 2</option>
                  </select>
                </div>
                <div style={{ ...styles.inputMiniGroup, width: '31%' }}>
                  <label style={styles.labelMini}>วันที่ประเมิน</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} style={styles.inputMini} required />
                </div>
              </div>

              <h4 style={{ ...styles.tableSectionTitle, marginTop: '0px' }}>พัฒนาการด้านร่างกาย</h4>
              <div style={styles.bodyMetricsRow}>
                <div style={styles.inputMiniGroup}>
                  <label style={styles.labelMini}>น้ำหนัก (กก.)</label>
                  <input type="text" name="Weight" value={formData.Weight} onChange={handleChange} style={styles.inputMini} />
                </div>
                <div style={styles.inputMiniGroup}>
                  <label style={styles.labelMini}>ส่วนสูง (ซม.)</label>
                  <input type="text" name="Height" value={formData.Height} onChange={handleChange} style={styles.inputMini} />
                </div>
                <div style={styles.inputMiniGroup}>
                  <label style={styles.labelMini}>สุขภาพฟัน</label>
                  <input type="text" name="Dental_health" value={formData.Dental_health} onChange={handleChange} style={styles.inputMini} placeholder="เช่น ปกติ/ผุ" />
                </div>
              </div>

              <div style={{ ...styles.bodyMetricsRow, marginTop: '10px' }}>
                <div style={{ ...styles.inputMiniGroup, width: '48%' }}>
                  <label style={styles.labelMini}>การได้รับวัคซีน</label>
                  <input type="text" name="Vaccination" value={formData.Vaccination} onChange={handleChange} style={styles.inputMini} placeholder="เช่น ครบตามเกณฑ์" />
                </div>
                <div style={{ ...styles.inputMiniGroup, width: '48%' }}>
                  <label style={styles.labelMini}>การเคลื่อนไหว</label>
                  <input type="text" name="Motor_skills" value={formData.Motor_skills} onChange={handleChange} style={styles.inputMini} placeholder="เช่น คล่องแคล่ว" />
                </div>
              </div>

              <h4 style={styles.tableSectionTitle}>พัฒนาการด้านอารมณ์</h4>
              <table style={styles.evalTable}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>หัวข้อ</th>
                    {scoreLevels.map(l => <th key={l.val} style={styles.thCenter}>{l.label}<br />{l.val}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'การแสดงออกทางอารมณ์', key: 'Emotion' },
                    { label: 'การควบคุมอารมณ์', key: 'Emotion_control' },
                    { label: 'ความมั่นใจ', key: 'Confidence' }
                  ].map(row => (
                    <tr key={row.key}>
                      <td style={styles.tdLeft}>{row.label}</td>
                      {scoreLevels.map(l => (
                        <td key={l.val} style={styles.tdCenter}>
                          <input type="radio" name={row.key} checked={String(formData[row.key]) === String(l.val)} onChange={() => handleRadioChange(row.key, l.val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 style={styles.tableSectionTitle}>พัฒนาการด้านสังคม</h4>
              <table style={styles.evalTable}>
                <tbody>
                  {[
                    { label: 'การจัดการความเครียด', key: 'Stress' },
                    { label: 'การมีปฏิสัมพันธ์กับผู้อื่น', key: 'Interaction' },
                    { label: 'การช่วยเหลือ', key: 'Assistance' }
                  ].map(row => (
                    <tr key={row.key}>
                      <td style={styles.tdLeft}>{row.label}</td>
                      {scoreLevels.map(l => (
                        <td key={l.val} style={styles.tdCenter}>
                          <input type="radio" name={row.key} checked={String(formData[row.key]) === String(l.val)} onChange={() => handleRadioChange(row.key, l.val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 style={styles.tableSectionTitle}>พัฒนาการด้านสติปัญญา</h4>
              <table style={styles.evalTable}>
                <tbody>
                  {[
                    { label: 'การแก้ปัญหา', key: 'Problem_solving' },
                    { label: 'การสื่อสาร', key: 'Communication' },
                    { key: 'Remembering', label: 'การจดจำ' }
                  ].map(row => (
                    <tr key={row.key}>
                      <td style={styles.tdLeft}>{row.label}</td>
                      {scoreLevels.map(l => (
                        <td key={l.val} style={styles.tdCenter}>
                          <input type="radio" name={row.key} checked={String(formData[row.key]) === String(l.val)} onChange={() => handleRadioChange(row.key, l.val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="submit" style={styles.btnSaveEvaluation}>{isAddOpen ? "บันทึกการประเมิน" : "บันทึกการแก้ไข"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal ลบ */}
      {isDeleteOpen && (
        <div style={styles.overlay}>
          <div style={styles.deleteModal}>
            <h3 style={styles.deleteTitle}>ยืนยันการลบ</h3>
            <p style={styles.deleteSubtitle}>คุณต้องการลบข้อมูลประเมินชุดนี้ใช่หรือไม่</p>
            <div style={styles.deleteBtnRow}>
              <button type="button" style={styles.btnCancel} onClick={() => { setIsDeleteOpen(false); resetForm(); }}>ยกเลิก</button>
              <button type="button" style={styles.btnConfirmDelete} onClick={handleDeleteSubmit}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 สไตล์หลักทั้งหมด (ปรับขนาดการ์ดกว้าง 1000px เติมเต็มหน้าจอ)
const styles = {
  container: { padding: '24px', width: '100%', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif', boxSizing: 'border-box' },
  cardMain: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '880px', backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', boxSizing: 'border-box' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' },
  studentNameDisplay: { margin: '6px 0 0 0', fontSize: '14px', color: '#64748b' },
  btnAddDev: { padding: '10px 18px', border: '1px solid #0284c7', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  devCardItem: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  cardItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  yearText: { fontSize: '14px', fontWeight: '500', color: '#475569', lineHeight: '1.6' },
  actionGroup: { display: 'flex', gap: '8px' },
  actionBtnSmall: { borderRadius: '8px', cursor: 'pointer', padding: '6px 12px', fontSize: '12px', fontWeight: '700' },
  actionBtnEdit: { border: '1px solid #bae6fd', backgroundColor: '#eff8ff', color: '#0369a1' },
  actionBtnDelete: { border: '1px solid #fecdd3', backgroundColor: '#fff1f2', color: '#be123c' },
  
  // ⭕ ปรับระยะห่างของวงกลมคะแนนให้สมดุล
  circlesRow: { display: 'flex', justifyContent: 'center', gap: '48px', alignItems: 'center', marginTop: '16px', marginBottom: '20px' },
  circleUnit: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', borderRadius: '10px', transition: 'all 0.2s' },
  circleScore: { width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', backgroundColor: '#f0f9ff', color: '#0369a1', boxShadow: '0 2px 6px rgba(14,165,233,0.15)' },
  circleLabel: { fontSize: '13px', color: '#334155', fontWeight: 'bold' },

  bodyDetailsSummary: { display: 'flex', justifyContent: 'space-around', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0', marginTop: '16px' },

  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modalDev: { backgroundColor: '#fff', width: '90%', maxWidth: '560px', height: '85vh', borderRadius: '14px', border: '1px solid #cbd5e1', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#94a3b8', fontSize: '16px' },
  formScrollable: { overflowY: 'auto', flex: 1, paddingRight: '6px', marginTop: '16px' },

  bodyMetricsRow: { display: 'flex', gap: '12px', justifyContent: 'space-between' },
  inputMiniGroup: { display: 'flex', flexDirection: 'column', gap: '4px', width: '32%' },
  labelMini: { fontSize: '12px', color: '#334155', fontWeight: '600' },
  inputMini: { padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', width: '100%', boxSizing: 'border-box' },

  tableSectionTitle: { fontSize: '13px', margin: '18px 0 8px 0', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', fontWeight: 'bold' },
  evalTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '12px', tableLayout: 'fixed' },
  thLeft: { textAlign: 'left', fontSize: '11px', color: '#334155', padding: '6px', fontWeight: 'bold', backgroundColor: '#f1f5f9', width: '40%' },
  tdLeft: { fontSize: '12px', padding: '8px 6px', borderBottom: '1px solid #f1f5f9', color: '#334155', width: '40%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  thCenter: { textAlign: 'center', fontSize: '11px', color: '#334155', padding: '6px', fontWeight: '500', backgroundColor: '#f1f5f9', width: '12%' },
  tdCenter: { textAlign: 'center', padding: '8px 6px', borderBottom: '1px solid #f1f5f9', width: '12%' },
  btnSaveEvaluation: { width: '100%', padding: '12px', marginTop: '20px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: '#ffffff', border: '1px solid #0284c7', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' },

  deleteModal: { backgroundColor: '#fff', width: '340px', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  deleteTitle: { margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a', fontWeight: 'bold' },
  deleteSubtitle: { margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' },
  deleteBtnRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  btnCancel: { padding: '8px 20px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '700' },
  btnConfirmDelete: { padding: '8px 20px', backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },

  detailStudentCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '10px', marginBottom: '12px' },
  detailSectionHeader: { fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' },
  detailBodyGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '14px' },
  detailBodyItem: { fontSize: '12px', color: '#334155', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px' },

  tabContainer: { display: 'flex', gap: '6px', marginBottom: '14px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  tabBtn: { flex: 1, padding: '7px 0', fontSize: '12px', fontWeight: '500', border: 'none', borderRadius: '4px', backgroundColor: 'transparent', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease' },
  tabBtnActive: { backgroundColor: '#ffffff', color: '#0284c7', fontWeight: '600', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },

  detailTable: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' },
  detailTh: { backgroundColor: '#f1f5f9', color: '#334155', padding: '8px 10px', fontSize: '11px', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0' },
  detailCategoryRow: { backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', fontSize: '11px', padding: '6px 10px' },
  detailTdLeft: { padding: '8px 10px 8px 16px', fontSize: '12px', color: '#334155', borderBottom: '1px solid #f1f5f9' },
  detailTdCenter: { padding: '6px 10px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' },

  criteriaCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', fontSize: '12px', color: '#334155', marginTop: '12px' },
  criteriaTitle: { fontWeight: '600', color: '#0f172a', marginBottom: '6px', fontSize: '12px' },
  criteriaList: { margin: 0, paddingLeft: '18px', lineHeight: '1.7', color: '#475569' }
};