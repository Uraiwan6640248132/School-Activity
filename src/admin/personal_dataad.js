import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  User,
  Phone,
  UserCircle,
  Shield,
  Lock,
  Key,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  UserCheck
} from 'lucide-react';

// ฟังก์ชันส่วนกลางสำหรับแกะเอา User_id จาก LocalStorage
const getActiveUserId = () => {
  let id = localStorage.getItem('User_id') || localStorage.getItem('userId') || localStorage.getItem('id');

  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      id = parsedUser.User_id || parsedUser.userId || parsedUser.id || id;
    } catch (e) {
      if (storedUser && !isNaN(storedUser)) {
        id = storedUser;
      }
    }
  }
  return id;
};

function EditProfile() {
  const [formData, setFormData] = useState({
    Name: '',
    Phone: '',
    Username: '',
    Role: '',
    NewPassword: '',
    ConfirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // ใช้ useCallback ครอบฟังก์ชันที่ถูกเรียกใช้ใน useEffect
  const fetchProfileData = useCallback(async (id) => {
    try {
      const res = await axios.get(`http://127.0.0.1:3001/users/${id}`);
      const data = res.data;

      const foundUsername = data.UserName || data.Username || data.username || '';
      const foundRole = data.Role || data.role || data.Status || data.status || 'ผู้ใช้งาน';

      setFormData({
        Name: data.Name || '',
        Phone: data.Phone || '',
        Username: foundUsername,
        Role: foundRole,
        NewPassword: '',
        ConfirmPassword: ''
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("ไม่สามารถโหลดข้อมูลส่วนตัวได้");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = getActiveUserId();

    if (!userId) {
      alert("ไม่พบข้อมูลเซสชันการเข้าสู่ระบบ กรุณาล็อกอินใหม่อีกครั้ง");
      setLoading(false);
      return;
    }

    fetchProfileData(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name || formData.Name.trim().length < 2) {
      newErrors.Name = 'กรุณากรอกชื่อ-นามสกุลให้ถูกต้อง';
    }
    
    if (!formData.Phone || !/^[0-9]{10}$/.test(formData.Phone.replace(/[-\s]/g, ''))) {
      newErrors.Phone = 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก';
    }
    
    if (!formData.Username || formData.Username.trim().length < 3) {
      newErrors.Username = 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
    }

    if (formData.NewPassword && formData.NewPassword.length < 6) {
      newErrors.NewPassword = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (formData.NewPassword && formData.NewPassword !== formData.ConfirmPassword) {
      newErrors.ConfirmPassword = 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userId = getActiveUserId();
    if (!userId) {
      alert("ไม่พบรหัสผู้ใช้งานในการบันทึกข้อมูล");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        Name: formData.Name.trim(),
        Phone: formData.Phone.trim(),
        Username: formData.Username.trim(),
        UserName: formData.Username.trim(),
        Role: formData.Role
      };

      if (formData.NewPassword.trim() !== "") {
        payload.Password = formData.NewPassword;
      }

      await axios.put(`http://127.0.0.1:3001/users/${userId}`, payload);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.Name = formData.Name.trim();
          localStorage.setItem('user', JSON.stringify(parsedUser));
        } catch (e) { }
      }

      setFormData(prev => ({ ...prev, NewPassword: '', ConfirmPassword: '' }));
      fetchProfileData(userId);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("เกิดข้อผิดพลาด ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'แอดมิน': '#C62828',
      'ครูผู้สอน': '#1565C0',
      'ผู้ปกครอง': '#2E7D32',
      'ถูกระงับสิทธิ์': '#9E9E9E'
    };
    return colors[role] || '#6A1B9A';
  };

  const getRoleBgColor = (role) => {
    const colors = {
      'แอดมิน': '#FCE4EC',
      'ครูผู้สอน': '#E3F2FD',
      'ผู้ปกครอง': '#E8F5E9',
      'ถูกระงับสิทธิ์': '#F5F5F5'
    };
    return colors[role] || '#F3E5F5';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader2 size={48} style={styles.spinner} />
        <p style={styles.loadingText}>กำลังโหลดข้อมูลส่วนตัว...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button 
        onClick={() => window.history.back()} 
        style={styles.backButton}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
      >
        <ArrowLeft size={18} />
        กลับ
      </button>

      {/* Header */}
      <div style={styles.headerArea}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}>
            {formData.Name?.charAt(0) || 'U'}
          </div>
          <div style={styles.avatarBadge}>
            <Edit3 size={14} color="#FFFFFF" />
          </div>
        </div>
        <div style={styles.headerText}>
          <h1 style={styles.mainTitle}>แก้ไขข้อมูลส่วนตัว</h1>
          <p style={styles.subTitle}>ปรับปรุงข้อมูลของคุณให้เป็นปัจจุบัน</p>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div style={styles.successMessage}>
          <CheckCircle size={20} color="#27AE60" />
          <span>บันทึกข้อมูลสำเร็จ! 🎉</span>
        </div>
      )}

      {/* Form Card */}
      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={16} color="#4A90D9" style={styles.labelIcon} />
              ชื่อ-นามสกุล <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="Name"
              style={{ ...styles.input, borderColor: errors.Name ? '#E74C3C' : '#E2E8F0' }}
              value={formData.Name}
              onChange={handleChange}
              placeholder="กรุณากรอกชื่อ-นามสกุล"
              required
            />
            {errors.Name && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.Name}
              </div>
            )}
          </div>

          {/* Phone */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Phone size={16} color="#27AE60" style={styles.labelIcon} />
              เบอร์โทรศัพท์ <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="Phone"
              style={{ ...styles.input, borderColor: errors.Phone ? '#E74C3C' : '#E2E8F0' }}
              value={formData.Phone}
              onChange={handleChange}
              placeholder="0XX-XXX-XXXX"
              required
            />
            {errors.Phone && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.Phone}
              </div>
            )}
          </div>

          {/* Username */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <UserCircle size={16} color="#E67E22" style={styles.labelIcon} />
              ชื่อผู้ใช้ <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="Username"
              style={{ ...styles.input, borderColor: errors.Username ? '#E74C3C' : '#E2E8F0' }}
              value={formData.Username}
              onChange={handleChange}
              placeholder="กรุณากรอกชื่อผู้ใช้"
              required
            />
            {errors.Username && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.Username}
              </div>
            )}
          </div>

          {/* Role (Read-only) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Shield size={16} color="#8E44AD" style={styles.labelIcon} />
              สถานะ
            </label>
            <div style={styles.roleDisplay}>
              <div style={{ 
                ...styles.roleBadge, 
                backgroundColor: getRoleBgColor(formData.Role),
                color: getRoleColor(formData.Role)
              }}>
                <UserCheck size={14} />
                {formData.Role || 'ผู้ใช้งาน'}
              </div>
              <span style={styles.readOnlyHint}>ไม่สามารถเปลี่ยนแปลงได้</span>
            </div>
          </div>

          {/* New Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Lock size={16} color="#E74C3C" style={styles.labelIcon} />
              รหัสผ่านใหม่
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="NewPassword"
                style={{ ...styles.input, borderColor: errors.NewPassword ? '#E74C3C' : '#E2E8F0', paddingRight: '44px' }}
                value={formData.NewPassword}
                onChange={handleChange}
                placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </button>
            </div>
            {errors.NewPassword && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.NewPassword}
              </div>
            )}
            <div style={styles.hintText}>
              <Key size={12} color="#94A3B8" />
              ต้องมีความยาวอย่างน้อย 6 ตัวอักษร
            </div>
          </div>

          {/* Confirm Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Key size={16} color="#E67E22" style={styles.labelIcon} />
              ยืนยันรหัสผ่านใหม่
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="ConfirmPassword"
                style={{ ...styles.input, borderColor: errors.ConfirmPassword ? '#E74C3C' : '#E2E8F0', paddingRight: '44px' }}
                value={formData.ConfirmPassword}
                onChange={handleChange}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </button>
            </div>
            {errors.ConfirmPassword && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.ConfirmPassword}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            style={{ ...styles.submitButton, opacity: saving ? 0.7 : 1 }}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={18} style={styles.spinnerSmall} />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save size={18} />
                บันทึกการเปลี่ยนแปลง
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxSizing: 'border-box',
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    gap: '16px',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
    color: '#4A90D9',
  },
  spinnerSmall: {
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: '16px',
    margin: 0,
  },

  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#4A90D9',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '8px 0',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  headerArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginTop: '8px',
    marginBottom: '28px',
  },
  avatarWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '600',
    border: '3px solid #FFFFFF',
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.15)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: '#4A90D9',
    borderRadius: '50%',
    padding: '4px',
    border: '2px solid #FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  headerText: {
    flex: 1,
  },
  mainTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1A202C',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subTitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '4px 0 0 0',
  },

  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#E8F8ED',
    color: '#27AE60',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid #A9DFBF',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'fadeIn 0.3s ease',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    padding: '28px 32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    boxSizing: 'border-box',
  },

  formGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#334155',
    fontWeight: '500',
    marginBottom: '8px',
  },
  labelIcon: {
    flexShrink: 0,
  },
  required: {
    color: '#E74C3C',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    boxSizing: 'border-box',
    fontSize: '14px',
    color: '#1A202C',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#FAFBFC',
  },
  inputReadOnly: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F1F5F9',
    borderRadius: '10px',
    boxSizing: 'border-box',
    fontSize: '14px',
    color: '#94A3B8',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },

  passwordWrapper: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
  },
  readOnlyHint: {
    fontSize: '12px',
    color: '#94A3B8',
  },

  errorText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#E74C3C',
    marginTop: '6px',
  },
  hintText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '6px',
  },

  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    marginTop: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
  },
};

// Global CSS animations
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 640px) {
    .header-area {
      flex-direction: column;
      text-align: center;
    }
    .form-card {
      padding: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default EditProfile;