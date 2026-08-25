import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Calendar,
  MapPin,
  FileText,
  Image,
  User,
  Loader2,
  Sparkles,
  Eye,
  X
} from 'lucide-react';

export default function PublicRelationsP() {
  const [prList, setPrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Modal สรุปรายละเอียดข่าวสาร
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const API_URL = 'http://localhost:3001/api/publicrelations';
  const USERS_API_URL = 'http://localhost:3001/users';
  const BACKEND_IMAGE_URL = 'http://localhost:3001/uploads/';

  const displayThaiDate = (dateStr) => {
    if (!dateStr) return '-';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      return `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]} ${parseInt(parts[0]) + 543}`;
    }
    return dateStr;
  };

  const getUserNameById = useCallback((userId) => {
    if (!userId) return "ไม่ระบุชื่อ";
    const found = users.find(u => Number(u.User_id || u.id || u.user_id) === Number(userId));
    if (found) {
      return found.Name || found.name || found.Username || found.username;
    }
    return `ผู้ใช้งานรหัส ${userId}`;
  }, [users]);

  const fetchUsersData = async () => {
    try {
      const res = await fetch(USERS_API_URL);
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching users list:", err);
    }
  };

  const fetchPRData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setPrList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchPRData();
  }, []);

  const openDetailModal = (item) => {
    setSelectedDetail(item);
    setIsDetailOpen(true);
  };

  const getImageUrl = (imageSrc) => {
    if (!imageSrc) return null;
    if (imageSrc.startsWith("data:") || imageSrc.startsWith("http")) {
      return imageSrc;
    }
    return `${BACKEND_IMAGE_URL}${imageSrc}`;
  };

  if (loading && prList.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังอัปเดตประกาศข่าวสารใหม่ล่าสุด...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header & Stats Inline */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <Megaphone size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>ข่าวสารประชาสัมพันธ์</h1>
              <p style={styles.subTitle}>
                <Sparkles size={14} color="#4A90D9" />
                ติดตามข่าวสารและกิจกรรมประชาสัมพันธ์สำหรับผู้ปกครอง
              </p>
            </div>
          </div>

          {/* Stats Card at Top Right */}
          <div style={styles.statCard}>
            <div style={{ ...styles.statIconWrapper, backgroundColor: '#EBF3FB' }}>
              <Megaphone size={20} color="#4A90D9" />
            </div>
            <div style={styles.statContent}>
              <span style={styles.statLabel}>ข่าวสารทั้งหมด</span>
              <span style={styles.statValue}>{prList.length} รายการ</span>
            </div>
          </div>
        </div>

        {/* PR List */}
        <div style={styles.cardContainer}>
          {prList.length === 0 ? (
            <div style={styles.emptyState}>
              <Megaphone size={56} color="#CBD5E1" />
              <p style={styles.emptyText}>ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้</p>
              <p style={styles.emptySubText}>โปรดกลับมาตรวจสอบใหม่อีกครั้งในภายหลัง</p>
            </div>
          ) : (
            prList.map((item) => {
              const imgUrl = getImageUrl(item.Image);
              return (
                <div key={item.PublicRelation_id || item.id} style={styles.card}>
                  <div style={styles.cardLeft}>
                    <div style={styles.cardImageWrapper}>
                      {imgUrl ? (
                        <img src={imgUrl} alt="public relations" style={styles.cardImg} />
                      ) : (
                        <div style={styles.cardImgPlaceholder}>
                          <Image size={32} color="#CBD5E1" />
                          <span>ไม่มีรูป</span>
                        </div>
                      )}
                    </div>
                    <div style={styles.cardInfo}>
                      <h3 style={styles.cardTitle}>{item.Name_activity || item.Name}</h3>
                      <div style={styles.cardDetails}>
                        <div style={styles.cardDetail}>
                          <Calendar size={14} color="#94A3B8" />
                          <span>วันที่: {displayThaiDate(item.Date)}</span>
                        </div>
                        {item.Location && (
                          <div style={styles.cardDetail}>
                            <MapPin size={14} color="#94A3B8" />
                            <span>{item.Location}</span>
                          </div>
                        )}
                        {item.Detail && (
                          <div style={styles.cardDetail}>
                            <FileText size={14} color="#94A3B8" />
                            <span style={styles.cardDetailText}>{item.Detail}</span>
                          </div>
                        )}
                        <div style={styles.cardDetail}>
                          <User size={14} color="#94A3B8" />
                          <span>โดย: <strong style={{ color: '#4A90D9' }}>
                            {item.CreatedBy_Name || getUserNameById(item.User_id)}
                          </strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={styles.cardAction}>
                    <button style={styles.detailBtn} onClick={() => openDetailModal(item)}>
                      <Eye size={16} style={{ marginRight: '4px' }} />
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedDetail && (
        <div style={styles.modalOverlay} onClick={() => setIsDetailOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={20} color="#4A90D9" />
                รายละเอียดประชาสัมพันธ์
              </h2>
              <button onClick={() => setIsDetailOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <div style={styles.detailContent}>
              {getImageUrl(selectedDetail.Image) && (
                <div style={styles.detailImageWrapper}>
                  <img src={getImageUrl(selectedDetail.Image)} alt="detail" style={styles.detailImage} />
                </div>
              )}
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📌 ชื่อเรื่อง</span>
                <span style={styles.detailValue}>{selectedDetail.Name_activity || selectedDetail.Name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>📅 วันที่</span>
                <span style={styles.detailValue}>{displayThaiDate(selectedDetail.Date)}</span>
              </div>
              {selectedDetail.Location && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>📍 สถานที่</span>
                  <span style={styles.detailValue}>{selectedDetail.Location}</span>
                </div>
              )}
              {selectedDetail.Detail && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>📝 รายละเอียด</span>
                  <span style={styles.detailValue}>{selectedDetail.Detail}</span>
                </div>
              )}
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>👤 ประชาสัมพันธ์โดย</span>
                <span style={styles.detailValue}>
                  {selectedDetail.CreatedBy_Name || getUserNameById(selectedDetail.User_id)}
                </span>
              </div>
            </div>
            <button onClick={() => setIsDetailOpen(false)} style={styles.closeDetailBtn}>
              ปิด
            </button>
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
    maxWidth: '1100px',
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

  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    minWidth: '200px',
  },
  statIconWrapper: {
    width: '40px',
    height: '40px',
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
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A202C',
  },

  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '20px 24px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    gap: '16px',
  },
  cardLeft: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    flex: 1,
    minWidth: 0,
  },
  cardImageWrapper: {
    flexShrink: 0,
  },
  cardImg: {
    width: '120px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  cardImgPlaceholder: {
    width: '120px',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    color: '#94A3B8',
    fontSize: '12px',
    gap: '4px',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1A202C',
    margin: '0 0 8px 0',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  cardDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748B',
  },
  cardDetailText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardAction: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0,
  },
  detailBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 14px',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    border: '1px solid #B6D4F0',
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
    maxWidth: '520px',
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

  // Detail Modal
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailImageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  detailImage: {
    maxWidth: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    gap: '12px',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 0,
  },
  detailValue: {
    fontSize: '14px',
    color: '#1A202C',
    fontWeight: '500',
    textAlign: 'right',
    wordBreak: 'break-word',
  },
  closeDetailBtn: {
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
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.06);
    }
    
    @media (max-width: 768px) {
      .card {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .card-left {
        flex-direction: column !important;
        align-items: center !important;
      }
      .card-image-wrapper {
        width: 100% !important;
      }
      .card-img, .card-img-placeholder {
        width: 100% !important;
        height: 150px !important;
      }
      .card-action {
        justify-content: center !important;
      }
      .header {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      .stat-card {
        width: 100% !important;
      }
      .detail-item {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      .detail-value {
        text-align: left !important;
        width: 100% !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}