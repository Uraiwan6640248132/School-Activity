import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Eye,
  X,
  School,
  Droplet,
  Loader2,
  Sparkles
} from 'lucide-react';

const StudentData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);

  const BACKEND_IMAGE_URL = 'http://localhost:3001/uploads/';

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        const userId = userData.id || userData.User_id || userData.user_id;

        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:3001/api/students`);

        if (Array.isArray(res.data)) {
          const myChildren = res.data.filter((student) => {
            const studentParentId = student.User_id || student.user_id;

            if (
              !userId ||
              !studentParentId ||
              userId === 'undefined' ||
              studentParentId === 'undefined'
            ) {
              return false;
            }

            return String(studentParentId) === String(userId);
          });

          setStudents(myChildren);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const formatThaiDate = (dateString) => {
    if (!dateString) return 'ไม่ได้ระบุ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleOpenViewModal = (student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  const getGenderLabel = (gender) => {
    if (gender === 2 || gender === '2' || gender === 'หญิง') return 'หญิง';
    return 'ชาย';
  };

  const getGenderIcon = (gender) => {
    const isFemale = gender === 2 || gender === '2' || gender === 'หญิง';
    return isFemale ? '👩' : '👦';
  };

  const getImageUrl = (imageSrc) => {
    if (!imageSrc) return null;
    if (imageSrc.startsWith('data:') || imageSrc.startsWith('http')) {
      return imageSrc;
    }
    return `${BACKEND_IMAGE_URL}${imageSrc}`;
  };

  if (loading && students.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลนักเรียน...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header พร้อมย้ายกล่องสถิติไปไว้มุมขวาบน */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <Users size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>ข้อมูลนักเรียน</h1>
              <p style={styles.subTitle}>
                <Sparkles size={14} color="#4A90D9" />
                แสดงข้อมูลบุตรหลานที่เชื่อมโยงกับบัญชีผู้ปกครองของคุณ
              </p>
            </div>
          </div>

          {/* Stat Card มุมขวาบน */}
          <div style={styles.statCardTop}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#EBF3FB' }}>
              <Users size={18} color="#4A90D9" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>บุตรหลานในระบบ</span>
              <span style={styles.statValue}>{students.length} คน</span>
            </div>
          </div>
        </div>

        {/* Student Grid (การ์ดกะทัดรัด ไม่ยาวเต็มจอ) */}
        <div style={styles.studentGrid}>
          {students.length === 0 ? (
            <div style={styles.emptyState}>
              <Users size={56} color="#CBD5E1" />
              <p style={styles.emptyText}>ไม่พบข้อมูลนักเรียน</p>
              <p style={styles.emptySubText}>
                ยังไม่มีข้อมูลนักเรียนที่เชื่อมโยงกับบัญชีผู้ปกครองนี้ในระบบ
              </p>
            </div>
          ) : (
            students.map((student, index) => {
              const imgUrl = getImageUrl(student.Image);
              return (
                <div
                  key={student.Student_id || student.student_id || index}
                  style={styles.studentCard}
                  onClick={() => handleOpenViewModal(student)}
                >
                  <div style={styles.cardTop}>
                    <div style={styles.cardImageWrapper}>
                      {imgUrl ? (
                        <img src={imgUrl} alt="student" style={styles.cardImage} />
                      ) : (
                        <div style={styles.cardImagePlaceholder}>
                          {getGenderIcon(student.Gender)}
                        </div>
                      )}
                    </div>
                    <div style={styles.cardInfo}>
                      <h4 style={styles.cardName}>{student.Name || 'ไม่ระบุชื่อ-นามสกุล'}</h4>
                      <div style={styles.cardMeta}>
                        <span style={styles.cardMetaItem}>
                          <School size={12} color="#94A3B8" />
                          {student.Class_level || 'ไม่ได้ระบุ'}
                        </span>
                        <span style={styles.cardMetaItem}>
                          <Droplet size={12} color="#94A3B8" />
                          {student.Blood_group || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      style={styles.viewBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenViewModal(student);
                      }}
                    >
                      <Eye size={14} />
                      ดูรายละเอียดทั้งหมด
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewingStudent && (
        <div style={styles.modalOverlay} onClick={() => setIsViewModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={20} color="#4A90D9" />
                รายละเอียดข้อมูลนักเรียน
              </h2>
              <button onClick={() => setIsViewModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.viewContent}>
              <div style={styles.viewAvatar}>
                {getImageUrl(viewingStudent.Image) ? (
                  <img
                    src={getImageUrl(viewingStudent.Image)}
                    alt="profile"
                    style={styles.viewAvatarImg}
                  />
                ) : (
                  <div style={styles.viewAvatarPlaceholder}>
                    {getGenderIcon(viewingStudent.Gender)}
                  </div>
                )}
              </div>
              <div style={styles.viewInfo}>
                <div style={styles.viewItem}>
                  <span style={styles.viewLabel}>ชื่อ-นามสกุล</span>
                  <span style={styles.viewValue}>{viewingStudent.Name || '-'}</span>
                </div>
                <div style={styles.viewItem}>
                  <span style={styles.viewLabel}>วันเกิด</span>
                  <span style={styles.viewValue}>{formatThaiDate(viewingStudent.Birthday)}</span>
                </div>
                <div style={styles.viewRow}>
                  <div style={{ ...styles.viewItem, flex: 1 }}>
                    <span style={styles.viewLabel}>ระดับชั้น</span>
                    <span style={styles.viewValue}>{viewingStudent.Class_level || '-'}</span>
                  </div>
                  <div style={{ ...styles.viewItem, flex: 1 }}>
                    <span style={styles.viewLabel}>เพศ</span>
                    <span style={styles.viewValue}>
                      {getGenderIcon(viewingStudent.Gender)} {getGenderLabel(viewingStudent.Gender)}
                    </span>
                  </div>
                </div>
                <div style={styles.viewItem}>
                  <span style={styles.viewLabel}>กรุ๊ปเลือด</span>
                  <span style={styles.viewValue}>{viewingStudent.Blood_group || 'ไม่ได้ระบุ'}</span>
                </div>
              </div>
            </div>
            <button style={styles.closeViewBtn} onClick={() => setIsViewModalOpen(false)}>
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  wrapper: {
    maxWidth: '1200px',
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
    gap: '16px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },

  // สไตล์สำหรับกล่องสถิติที่ย้ายไปมุมขวาบน
  statCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#FFFFFF',
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
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
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1A202C',
  },

  // ปรับให้การ์ดไม่กว้างเต็มจอ (กำหนด max-width และจัดกลุ่ม)
  studentGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
  },

  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '320px', // จำกัดความกว้างไม่ให้ยืดยาวจนเกินไป
  },
  cardTop: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardImageWrapper: {
    flexShrink: 0,
  },
  cardImage: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid #E2E8F0',
  },
  cardImagePlaceholder: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    border: '1px solid #E2E8F0',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 4px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  cardMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#94A3B8',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  viewBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: '1px solid #B6D4F0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  emptyState: {
    width: '100%',
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
  emptySubText: {
    fontSize: '14px',
    color: '#94A3B8',
    margin: 0,
  },

  // Modal
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
    maxWidth: '480px',
    padding: '28px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9',
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

  // View Modal
  viewContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  viewAvatar: {
    marginBottom: '4px',
  },
  viewAvatarImg: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #E2E8F0',
  },
  viewAvatarPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    border: '3px solid #E2E8F0',
  },
  viewInfo: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  viewItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    gap: '4px',
  },
  viewRow: {
    display: 'flex',
    gap: '12px',
  },
  viewLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '500',
  },
  viewValue: {
    fontSize: '15px',
    color: '#1A202C',
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
  },
  closeViewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '10px',
    marginTop: '16px',
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

// Injection Style for Animation & Responsive
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .student-card {
      animation: fadeInUp 0.3s ease forwards;
    }
    .student-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.08);
    }
    
    @media (max-width: 768px) {
      .student-card {
        max-width: 100% !important;
      }
      .header {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      .stat-card-top {
        width: 100% !important;
        justify-content: flex-start !important;

        
      }
      .view-row {
        flex-direction: column !important;
        gap: 0 !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default StudentData;