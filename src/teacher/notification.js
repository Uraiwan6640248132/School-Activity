import axios from "axios";
import { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Users,
  FileText,
  CalendarDays,
  Sparkles,
  ChevronRight
} from "lucide-react";

const BASE_URL = "http://localhost:3001";
const MY_CLASS_LEVEL = "อนุบาล 1 ห้องปกติ";

function Notification() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [class_level, setClassLevel] = useState(MY_CLASS_LEVEL);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/notifications`);
      setList(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setClassLevel(MY_CLASS_LEVEL);
    setSubject("");
    setDetails("");
    setDeadline("");
    setShowModal(false);
  };

  const saveData = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

    const data = {
      User_id: 1,
      Class_level: class_level,
      Subject: subject,
      Deadline: deadline || todayStr,
      Date: todayStr,
      Details: details || null
    };

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/notifications/${editId}`, data);
      } else {
        await axios.post(`${BASE_URL}/notifications`, data);
      }
      resetForm();
      getData();
    } catch (err) {
      console.log(err);
    }
  };

  const openEdit = (item) => {
    setEditId(item.Notification_id || item.notification_id);
    setClassLevel(item.Class_level || item.class_level || MY_CLASS_LEVEL);
    setSubject(item.Subject || item.subject || "");
    setDetails(item.Details || item.details || "");
    setDeadline((item.Deadline || item.deadline)?.split("T")[0] || "");
    setShowModal(true);
  };

  const deleteData = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/notifications/${id}`);
      setDeleteId(null);
      getData();
    } catch (err) {
      console.log(err);
    }
  };

  const filteredList = list.filter((item) => {
    const currentClass = item.Class_level || item.class_level;
    return currentClass === MY_CLASS_LEVEL;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลการแจ้งเตือน...</p>
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
              <Bell size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>การแจ้งเตือนการบ้าน</h1>
              <p style={styles.subTitle}>
                <span style={styles.countBadge}>{filteredList.length}</span> รายการแจ้งเตือน
                <span style={styles.classLabel}> | {MY_CLASS_LEVEL}</span>
              </p>
            </div>
          </div>
          <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
            <Plus size={18} />
            แจ้งเตือนใหม่
          </button>
        </div>

        {/* Notification Grid */}
        {filteredList.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={56} color="#CBD5E1" />
            <p style={styles.emptyText}>ไม่มีการแจ้งเตือน</p>
            <p style={styles.emptySubText}>ยังไม่มีข้อมูลการแจ้งเตือนการบ้านในขณะนี้</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredList.map((item) => (
              <div key={item.Notification_id || item.notification_id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardSubject}>
                    <BookOpen size={16} color="#4A90D9" />
                    <span style={styles.subjectText}>
                      {item.Subject || item.subject || "ไม่ระบุวิชา"}
                    </span>
                  </div>
                  <div style={styles.cardBadge}>
                    <Users size={12} color="#4A90D9" />
                    {item.Class_level || item.class_level}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.cardDetails}>
                    {item.Details || item.details || "ไม่มีรายละเอียด"}
                  </p>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.cardDates}>
                    <div style={styles.dateItem}>
                      <Calendar size={14} color="#94A3B8" />
                      <span>กำหนดส่ง: <strong>
                        {(item.Deadline || item.deadline)?.split("T")[0] || "-"}
                      </strong></span>
                    </div>
                    <div style={styles.dateItem}>
                      <Clock size={14} color="#94A3B8" />
                      <span>แจ้งเมื่อ: {(item.Date || item.date)?.split("T")[0] || "-"}</span>
                    </div>
                  </div>
                  <div style={styles.cardActions}>
                    <button onClick={() => openEdit(item)} style={styles.editBtn}>
                      <Edit2 size={14} />
                      แก้ไข
                    </button>
                    <button onClick={() => setDeleteId(item.Notification_id || item.notification_id)} style={styles.deleteBtn}>
                      <Trash2 size={14} />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) resetForm();
        }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editId ? <Edit2 size={20} color="#F39C12" /> : <Plus size={20} color="#4A90D9" />}
                {editId ? "แก้ไขการแจ้งเตือน" : "เพิ่มการแจ้งเตือน"}
              </h2>
              <button onClick={resetForm} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveData}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <Users size={14} style={styles.labelIcon} />
                  ระดับชั้น
                </label>
                <input
                  type="text"
                  value={class_level}
                  readOnly
                  style={styles.formInputReadonly}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <BookOpen size={14} style={styles.labelIcon} />
                  วิชา *
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  style={styles.formInput}
                  placeholder="กรอกชื่อวิชา"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <FileText size={14} style={styles.labelIcon} />
                  รายละเอียด
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  style={styles.formTextarea}
                  placeholder="กรอกรายละเอียดการบ้าน"
                  rows={3}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>
                  <CalendarDays size={14} style={styles.labelIcon} />
                  กำหนดส่ง
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={resetForm} style={styles.cancelBtn}>
                  ยกเลิก
                </button>
                <button type="submit" style={styles.submitBtn}>
                  <Send size={16} />
                  {editId ? "อัปเดต" : "บันทึก"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) setDeleteId(null);
        }}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteIcon}>🗑️</div>
            <h3 style={styles.deleteTitle}>ยืนยันการลบ</h3>
            <p style={styles.deleteText}>คุณแน่ใจหรือไม่ว่าต้องการลบการแจ้งเตือนนี้?</p>
            <p style={styles.deleteSubText}>การดำเนินการนี้ไม่สามารถกู้คืนได้</p>
            <div style={styles.deleteActions}>
              <button onClick={() => setDeleteId(null)} style={styles.cancelBtn}>
                ยกเลิก
              </button>
              <button onClick={() => deleteData(deleteId)} style={styles.confirmDeleteBtn}>
                <Trash2 size={16} />
                ลบข้อมูล
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
    marginBottom: '28px',
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
  countBadge: {
    fontWeight: '700',
    color: '#4A90D9',
  },
  classLabel: {
    color: '#94A3B8',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 18px 12px',
    borderBottom: '1px solid #F1F5F9',
  },
  cardSubject: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  subjectText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1A202C',
  },
  cardBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '500',
    color: '#4A90D9',
    backgroundColor: '#EBF3FB',
    padding: '3px 10px',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
  },
  cardBody: {
    padding: '12px 18px',
    flex: 1,
  },
  cardDetails: {
    fontSize: '14px',
    color: '#475569',
    margin: 0,
    lineHeight: '1.6',
  },
  cardFooter: {
    padding: '12px 18px 16px',
    borderTop: '1px solid #F1F5F9',
  },
  cardDates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  dateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94A3B8',
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  deleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '7px',
    backgroundColor: '#FDEDEC',
    color: '#E74C3C',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
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

  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#334155',
    marginBottom: '6px',
  },
  labelIcon: {
    color: '#94A3B8',
  },
  formInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#FAFBFC',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxSizing: 'border-box',
  },
  formInputReadonly: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#F1F5F9',
    color: '#64748B',
    outline: 'none',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxSizing: 'border-box',
    cursor: 'not-allowed',
  },
  formTextarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: '#FAFBFC',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '70px',
  },

  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '8px',
  },
  cancelBtn: {
    flex: 1,
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
  submitBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },

  // Delete Modal
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px 28px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  },
  deleteIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  deleteTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 8px 0',
  },
  deleteText: {
    fontSize: '15px',
    color: '#475569',
    margin: 0,
  },
  deleteSubText: {
    fontSize: '13px',
    color: '#94A3B8',
    margin: '4px 0 24px 0',
  },
  deleteActions: {
    display: 'flex',
    gap: '12px',
  },
  confirmDeleteBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#E74C3C',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.2)',
  },
};

// Global CSS animations
const styleSheet = document.createElement("style");
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
  
  .card {
    animation: fadeInUp 0.3s ease forwards;
  }
  
  .card:nth-child(1) { animation-delay: 0.05s; }
  .card:nth-child(2) { animation-delay: 0.1s; }
  .card:nth-child(3) { animation-delay: 0.15s; }
  .card:nth-child(4) { animation-delay: 0.2s; }
  .card:nth-child(5) { animation-delay: 0.25s; }
  .card:nth-child(6) { animation-delay: 0.3s; }
  
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
  }
  
  .edit-btn:hover {
    background-color: #D6E9FF !important;
  }
  
  .delete-btn:hover {
    background-color: #FCD5D5 !important;
  }
  
  @media (max-width: 768px) {
    .grid {
      grid-template-columns: 1fr !important;
    }
    .header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .btn-primary {
      width: 100% !important;
      justify-content: center !important;
    }
    .card-actions {
      flex-direction: column !important;
    }
  }
  
  @media (max-width: 480px) {
    .modal-content {
      padding: 20px !important;
    }
    .delete-modal {
      padding: 24px 20px !important;
    }
    .form-actions {
      flex-direction: column !important;
    }
    .card-header {
      flex-wrap: wrap !important;
      gap: 8px !important;
    }
    .main-title {
      font-size: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Notification;