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
import {
  Eye,
  Calendar,
  Award,
  TrendingUp,
  Heart,
  Brain,
  Users,
  Activity,
  Weight,
  Ruler,
  Shield,
  Syringe,
  Move,
  Handshake,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
        backgroundColor: '#2baf2b',
        borderColor: '#2baf2b',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 48,
      },
      {
        label: 'ภาคเรียนที่ 2',
        data: scoresTerm2,
        backgroundColor: '#dd191d',
        borderColor: '#dd191d',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 48,
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
        labels: { color: '#334155', padding: 20, font: { family: "'Kanit', sans-serif", size: 14, weight: 'bold' } }
      },
      title: {
        display: true,
        text: '📊 กราฟเปรียบเทียบพัฒนาการรายภาคเรียน (คะแนนเต็ม 100)',
        color: '#1e293b',
        padding: { top: 10, bottom: 20 },
        font: { family: "'Kanit', sans-serif", size: 16, weight: 'bold' }
      },
      tooltip: { titleFont: { family: "'Kanit', sans-serif", size: 14 }, bodyFont: { family: "'Kanit', sans-serif", size: 13 } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#334155', padding: 8, font: { family: "'Kanit', sans-serif", size: 13, weight: 'bold' } } },
      y: { beginAtZero: true, max: 100, ticks: { stepSize: 20, color: '#334155', padding: 10, font: { family: "'Kanit', sans-serif", size: 13, weight: 'bold' } }, grid: { color: '#e2e8f0', lineWidth: 1 } }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '380px', marginTop: '16px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default function Developmentp() {
  const [devList, setDevList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [activeTab, setActiveTab] = useState('body');

  const [studentIdOfParent, setStudentIdOfParent] = useState(null);

  const API_URL = `http://localhost:3001/api/development/student`;
  const STUDENTS_API_URL = 'http://localhost:3001/api/students';

  const fetchStudentsData = async (userId) => {
    try {
      const res = await fetch(`${STUDENTS_API_URL}?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const cleanData = Array.isArray(data) ? data : [];
        setStudents(cleanData);

        if (cleanData.length > 0) {
          const childIds = cleanData.map(s => Number(s.Student_id || s.id || s.student_id || s.Student_Id));
          return childIds;
        }
      }
    } catch (err) {
      console.error("Error fetching students list:", err);
    }
    return null;
  };

  const fetchDevelopmentData = async (targetStudentIds) => {
    if (!targetStudentIds || (Array.isArray(targetStudentIds) && targetStudentIds.length === 0)) return;
    setLoading(true);
    try {
      const singleStudentId = Array.isArray(targetStudentIds) ? targetStudentIds[0] : targetStudentIds;
      const res = await fetch(`${API_URL}?Student_id=${singleStudentId}`);

      if (res.ok) {
        const data = await res.json();
        setDevList(Array.isArray(data) ? data : []);
      } else {
        console.error("เซิร์ฟเวอร์ปฏิเสธคำขอสถานะ:", res.status);
      }
    } catch (err) {
      console.error("Error fetching student development data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const userData = JSON.parse(storedUser);
      const userId = userData.User_id || userData.id || userData.user_id;

      if (!userId || userId === "undefined") {
        console.warn("หน้าบ้านระงับการทำงานเนื่องจากไม่พบ userId ของผู้ปกครอง");
        return;
      }

      const loadParentDashboard = async () => {
        const childIds = await fetchStudentsData(userId);

        if (childIds && childIds.length > 0) {
          setStudentIdOfParent(childIds[0]);
          await fetchDevelopmentData(childIds);
        } else {
          console.warn("ไม่พบข้อมูลนักเรียนที่ผูกกับบัญชีผู้ปกครองนี้");
          setStudentIdOfParent(null);
        }
      };

      loadParentDashboard();

    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอ่านข้อมูลผู้ใช้:", error);
    }
  }, []);

  const getStudentName = useCallback((studentId) => {
    if (!studentId) return "ไม่ระบุรหัส";
    if (!students || students.length === 0) return `กำลังค้นหารหัส: ${studentId}...`;

    const found = students.find(s => {
      const currentId = Number(s.Student_id || s.id || s.student_id || s.Student_Id);
      return currentId === Number(studentId);
    });

    if (found) {
      return found.Name || found.name || found.Student_name || found.student_name || `${found.First_name || ''} ${found.Last_name || ''}`.trim();
    }
    return `รหัสนักเรียน: ${studentId}`;
  }, [students]);

  const calculateSectionScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    const validScores = scores.map(s => isNaN(Number(s)) || s === '' ? 0 : Number(s));
    const sum = validScores.reduce((a, b) => a + b, 0);
    const avg = sum / validScores.length;
    return Math.round(avg * 20);
  };

  const openDetailModal = (item, tabCategory = 'body') => {
    setSelectedDetailItem(item);
    setActiveTab(tabCategory);
    setIsDetailOpen(true);
  };

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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลพัฒนาการ...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <TrendingUp size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>บันทึกพัฒนาการเด็ก</h1>
              <p style={styles.subTitle}>
                นักเรียนในความปกครอง:{' '}
                {studentIdOfParent ? (
                  <strong style={{ color: '#4A90D9' }}>{getStudentName(studentIdOfParent)}</strong>
                ) : (
                  <strong style={{ color: '#E74C3C' }}>ไม่พบข้อมูลนักเรียนที่ผูกกับบัญชีของคุณ</strong>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#EBF3FB' }}>
              <Users size={20} color="#4A90D9" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>นักเรียนในปกครอง</span>
              <span style={styles.statValue}>{students.length} คน</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#E8F8ED' }}>
              <Award size={20} color="#27AE60" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>การประเมินทั้งหมด</span>
              <span style={styles.statValue}>{devList.length} ครั้ง</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#FEF9E7' }}>
              <Calendar size={20} color="#F39C12" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>ภาคเรียนปัจจุบัน</span>
              <span style={styles.statValue}>ภาคเรียนที่ 1</span>
            </div>
          </div>
        </div>

        {/* Development List */}
        <div style={styles.listContainer}>
          {devList.length === 0 ? (
            <div style={styles.emptyState}>
              <TrendingUp size={48} color="#CBD5E1" />
              <p style={styles.emptyText}>ยังไม่มีข้อมูลการประเมินพัฒนาการจากคุณครูในขณะนี้</p>
            </div>
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
                displayTerm = idx === 0 ? 'ภาคเรียนที่ 1' : 'ภาคเรียนที่ 2';
              }

              const currentItemStudentId = item.Student_id || item.student_id || item.Student_Id;

              return (
                <div key={idx} style={styles.devCard}>
                  <div style={styles.cardHeader}>
                    <div style={styles.studentInfo}>
                      <div style={styles.studentAvatar}>
                        {item.Student_name?.charAt(0) || getStudentName(currentItemStudentId).charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 style={styles.studentName}>
                          {item.Student_name || getStudentName(currentItemStudentId)}
                        </h3>
                        <div style={styles.studentMeta}>
                          <span style={styles.metaItem}>
                            <Calendar size={12} color="#94A3B8" />
                            {displayDate}
                          </span>
                          <span style={styles.metaItem}>
                            <Award size={12} color="#94A3B8" />
                            ปี {item.Year || item.year || '2569'} - {displayTerm}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.scoreCircles}>
                    <div style={styles.scoreCircle} onClick={() => openDetailModal(item, 'body')} title="คลิกดูพัฒนาการด้านร่างกาย">
                      <div style={styles.scoreCircleValue}>{isNaN(scoreBody) ? 0 : scoreBody}</div>
                      <span style={styles.scoreCircleLabel}>ร่างกาย</span>
                      <Activity size={14} color="#4A90D9" />
                    </div>
                    <div style={styles.scoreCircle} onClick={() => openDetailModal(item, 'intellect')} title="คลิกดูพัฒนาการด้านสติปัญญา">
                      <div style={styles.scoreCircleValue}>{isNaN(scoreIntellect) ? 0 : scoreIntellect}</div>
                      <span style={styles.scoreCircleLabel}>สติปัญญา</span>
                      <Brain size={14} color="#8E44AD" />
                    </div>
                    <div style={styles.scoreCircle} onClick={() => openDetailModal(item, 'emotion')} title="คลิกดูพัฒนาการด้านอารมณ์">
                      <div style={styles.scoreCircleValue}>{isNaN(scoreEmotion) ? 0 : scoreEmotion}</div>
                      <span style={styles.scoreCircleLabel}>อารมณ์</span>
                      <Heart size={14} color="#E74C3C" />
                    </div>
                    <div style={styles.scoreCircle} onClick={() => openDetailModal(item, 'social')} title="คลิกดูพัฒนาการด้านสังคม">
                      <div style={styles.scoreCircleValue}>{isNaN(scoreSocial) ? 0 : scoreSocial}</div>
                      <span style={styles.scoreCircleLabel}>สังคม</span>
                      <Handshake size={14} color="#F39C12" />
                    </div>
                  </div>

                  <TermComparisonChart studentDevList={devList} />

                  <div style={styles.bodySummary}>
                    <span style={styles.bodySummaryItem}>
                      <Weight size={14} color="#94A3B8" />
                      น้ำหนัก: <strong>{item.Weight || '-'}</strong> กก.
                    </span>
                    <span style={styles.bodySummaryItem}>
                      <Ruler size={14} color="#94A3B8" />
                      ส่วนสูง: <strong>{item.Height || '-'}</strong> ซม.
                    </span>
                    <span style={styles.bodySummaryItem}>
                      <Shield size={14} color="#94A3B8" />
                      ฟัน: <strong style={{ color: '#27AE60' }}>{item.Dental_health || 'ปกติ'}</strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedDetailItem && (
        <div style={styles.modalOverlay} onClick={() => setIsDetailOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalBadge}>
                  ปี {selectedDetailItem.Year || '2569'} - {selectedDetailItem.Term || 'ภาคเรียนที่ 1'}
                </span>
                <h2 style={styles.modalTitle}>
                  <Eye size={20} color="#4A90D9" />
                  รายละเอียดพัฒนาการ
                </h2>
              </div>
              <button onClick={() => setIsDetailOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailStudentCard}>
                <div style={styles.detailStudentAvatar}>
                  {selectedDetailItem.Student_name?.charAt(0) || getStudentName(selectedDetailItem.Student_id || selectedDetailItem.student_id || selectedDetailItem.Student_Id).charAt(0) || 'S'}
                </div>
                <div>
                  <div style={styles.detailStudentName}>
                    {selectedDetailItem.Student_name || getStudentName(selectedDetailItem.Student_id || selectedDetailItem.student_id || selectedDetailItem.Student_Id)}
                  </div>
                  <div style={styles.detailStudentDate}>
                    <Calendar size={14} color="#94A3B8" />
                    วันที่ประเมิน: {selectedDetailItem.date_clean || (selectedDetailItem.date ? String(selectedDetailItem.date).split('T')[0] : 'ไม่ระบุ')}
                  </div>
                </div>
              </div>

              <h4 style={styles.detailSectionTitle}>
                <Activity size={16} color="#4A90D9" style={styles.sectionIcon} />
                ข้อมูลกายภาพ
              </h4>
              <div style={styles.detailBodyGrid}>
                <div style={styles.detailBodyItem}>
                  <Weight size={14} color="#94A3B8" />
                  <span>น้ำหนัก: <strong>{selectedDetailItem.Weight || '-'} กก.</strong></span>
                </div>
                <div style={styles.detailBodyItem}>
                  <Ruler size={14} color="#94A3B8" />
                  <span>ส่วนสูง: <strong>{selectedDetailItem.Height || '-'} ซม.</strong></span>
                </div>
                <div style={styles.detailBodyItem}>
                  <Shield size={14} color="#94A3B8" />
                  <span>ฟัน: <strong>{selectedDetailItem.Dental_health || 'ปกติ'}</strong></span>
                </div>
                <div style={styles.detailBodyItem}>
                  <Syringe size={14} color="#94A3B8" />
                  <span>วัคซีน: <strong>{selectedDetailItem.Vaccination || 'ไม่ได้ระบุ'}</strong></span>
                </div>
                <div style={{ ...styles.detailBodyItem, gridColumn: 'span 2' }}>
                  <Move size={14} color="#94A3B8" />
                  <span>การเคลื่อนไหว: <strong>{selectedDetailItem.Motor_skills || 'ไม่ได้ระบุ'}</strong></span>
                </div>
              </div>

              <div style={styles.tabContainer}>
                <button
                  style={{ ...styles.tabBtn, ...(activeTab === 'body' ? styles.tabBtnActive : {}) }}
                  onClick={() => setActiveTab('body')}
                >
                  <Activity size={14} />
                  ร่างกาย
                </button>
                <button
                  style={{ ...styles.tabBtn, ...(activeTab === 'emotion' ? styles.tabBtnActive : {}) }}
                  onClick={() => setActiveTab('emotion')}
                >
                  <Heart size={14} />
                  อารมณ์
                </button>
                <button
                  style={{ ...styles.tabBtn, ...(activeTab === 'social' ? styles.tabBtnActive : {}) }}
                  onClick={() => setActiveTab('social')}
                >



                  <Handshake size={14} />
                  สังคม
                </button>
                <button
                  style={{ ...styles.tabBtn, ...(activeTab === 'intellect' ? styles.tabBtnActive : {}) }}
                  onClick={() => setActiveTab('intellect')}
                >
                  <Brain size={14} />
                  สติปัญญา
                </button>
              </div>

              <h4 style={styles.detailSectionTitle}>
                📋 รายละเอียดหัวข้อย่อย
                {activeTab === 'body' && ' (ด้านร่างกาย)'}
                {activeTab === 'emotion' && ' (ด้านอารมณ์)'}
                {activeTab === 'social' && ' (ด้านสังคม)'}
                {activeTab === 'intellect' && ' (ด้านสติปัญญา)'}
              </h4>

              <table style={styles.detailTable}>
                <thead>
                  <tr>
                    <th style={styles.detailTh}>หัวข้อพัฒนาการ</th>
                    <th style={{ ...styles.detailTh, textAlign: 'center', width: '140px' }}>ระดับผลประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'body' && (
                    <>
                      <tr style={styles.detailCategoryRow}>
                        <td colSpan="2" style={styles.detailCategoryText}>• พัฒนาการด้านร่างกายและการเคลื่อนไหว</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>ทักษะการเคลื่อนไหวและการทรงตัว</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Motor_skills ? 4 : 3)}</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>ความสมบูรณ์ของร่างกายตามเกณฑ์</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Weight && selectedDetailItem.Height ? 5 : 3)}</td>
                      </tr>
                    </>
                  )}

                  {activeTab === 'emotion' && (
                    <>
                      <tr style={styles.detailCategoryRow}>
                        <td colSpan="2" style={styles.detailCategoryText}>• พัฒนาการด้านอารมณ์</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>การแสดงออกทางอารมณ์</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Emotion)}</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>การควบคุมอารมณ์</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Emotion_control)}</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>ความมั่นใจในตัวเอง</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Confidence)}</td>
                      </tr>
                    </>
                  )}

                  {activeTab === 'social' && (
                    <>
                      <tr style={styles.detailCategoryRow}>
                        <td colSpan="2" style={styles.detailCategoryText}>• พัฒนาการด้านสังคม</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>การจัดการความเครียด</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Stress)}</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>การมีปฏิสัมพันธ์กับผู้อื่น</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Interaction)}</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>การเอื้อเฟื้อช่วยเหลือ</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Assistance)}</td>
                      </tr>
                    </>
                  )}

                  {activeTab === 'intellect' && (
                    <>
                      <tr style={styles.detailCategoryRow}>
                        <td colSpan="2" style={styles.detailCategoryText}>• พัฒนาการด้านสติปัญญา</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>การคิดแก้ปัญหา</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Problem_solving)}</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>ทักษะการสื่อสาร</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Communication)}</td>
                      </tr>
                      <tr>
                        <td style={styles.detailTd}>ความสามารถในการจดจำ</td>
                        <td style={styles.detailTdCenter}>{renderBadge(selectedDetailItem.Remembering)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              <div style={styles.criteriaCard}>
                <div style={styles.criteriaTitle}>
                  <AlertCircle size={14} color="#4A90D9" />
                  คำอธิบายเกณฑ์ระดับผลการประเมิน
                </div>
                <ul style={styles.criteriaList}>
                  <li><strong style={{ color: '#15803d' }}>ดีมาก (5):</strong> ปฏิบัติได้ถูกต้อง รวดเร็ว สม่ำเสมอ และสามารถช่วยเหลือผู้อื่นได้</li>
                  <li><strong style={{ color: '#0369a1' }}>ดี (4):</strong> ปฏิบัติได้ด้วยตนเอง มีความคล่องแคล่วและถูกต้องเป็นส่วนใหญ่</li>
                  <li><strong style={{ color: '#b45309' }}>ปานกลาง (3):</strong> ปฏิบัติได้ตามเกณฑ์มาตรฐาน มีความพร้อมในระดับทั่วไป</li>
                  <li><strong style={{ color: '#c2410c' }}>พอใช้ (2):</strong> ปฏิบัติได้เมื่อได้รับการแนะนำ กระตุ้น หรือช่วยเหลือในบางครั้ง</li>
                  <li><strong style={{ color: '#be123c' }}>ปรับปรุง (1):</strong> ยังไม่สามารถปฏิบัติได้ หรือต้องได้รับการดูแลช่วยเหลืออย่างใกล้ชิด</li>
                </ul>
              </div>

              <button style={styles.closeDetailBtn} onClick={() => setIsDetailOpen(false)}>
                <X size={18} />
                ปิดหน้าต่างรายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  wrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#4A90D9',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.25)',
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
  },
  subTitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#FFFFFF',
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  statIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1A202C',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
  },
  emptyText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#475569',
    margin: '16px 0 4px 0',
  },
  devCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  studentAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  studentName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
  },
  studentMeta: {
    display: 'flex',
    gap: '12px',
    marginTop: '2px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#94A3B8',
  },
  scoreCircles: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginTop: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  scoreCircle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
  },
  scoreCircleValue: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '2px solid #4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    backgroundColor: '#F0F7FF',
    color: '#0369a1',
    boxShadow: '0 2px 8px rgba(74, 144, 217, 0.15)',
  },
  scoreCircleLabel: {
    fontSize: '13px',
    color: '#334155',
    fontWeight: '600',
  },
  bodySummary: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    padding: '12px 16px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    marginTop: '16px',
    flexWrap: 'wrap',
  },
  bodySummaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#475569',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 24px',
    borderBottom: '1px solid #F1F5F9',
    flexShrink: 0,
  },
  modalBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '4px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1A202C',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '8px',
    transition: 'background 0.2s ease',
  },
  modalBody: {
    padding: '20px 24px 24px',
    overflowY: 'auto',
    flex: 1,
  },
  detailStudentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    marginBottom: '16px',
  },
  detailStudentAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600',
    flexShrink: 0,
  },
  detailStudentName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1A202C',
  },
  detailStudentDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#94A3B8',
  },
  detailSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '10px',
    marginTop: '16px',
  },
  sectionIcon: {
    flexShrink: 0,
  },
  detailBodyGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#FAFBFC',
    borderRadius: '10px',
    border: '1px solid #F1F5F9',
    marginBottom: '16px',
  },
  detailBodyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#334155',
    padding: '4px 0',
  },
  tabContainer: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    marginBottom: '16px',
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 0',
    fontSize: '12px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#64748B',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    color: '#4A90D9',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
  },
  detailTable: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  detailTh: {
    backgroundColor: '#F8FAFC',
    color: '#334155',
    padding: '10px 14px',
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'left',
    borderBottom: '1px solid #E2E8F0',
  },
  detailCategoryRow: {
    backgroundColor: '#F0F7FF',
  },
  detailCategoryText: {
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4A90D9',
  },
  detailTd: {
    padding: '8px 14px',
    fontSize: '13px',
    color: '#334155',
    borderBottom: '1px solid #F1F5F9',
  },
  detailTdCenter: {
    padding: '8px 14px',
    textAlign: 'center',
    borderBottom: '1px solid #F1F5F9',
  },
  criteriaCard: {
    padding: '14px 18px',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    marginBottom: '16px',
  },
  criteriaTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: '6px',
    fontSize: '13px',
  },
  criteriaList: {
    margin: 0,
    paddingLeft: '18px',
    fontSize: '12px',
    lineHeight: '1.8',
    color: '#475569',
  },
  closeDetailBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
};