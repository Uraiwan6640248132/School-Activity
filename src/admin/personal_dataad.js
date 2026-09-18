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
  UserCheck,
  Sparkles
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

  const fetchProfileData = useCallback(async (id) => {
    try {
      const res = await axios.get(`http://127.0.0.1:3001/users/${id}`);
      const data = res.data;

      const foundUsername = data.UserName || data.Username || data.username || '';
      const foundRole = data.Role || data.role || data.Status || data.status || 'แอดมิน';

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
  }, [fetchProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name || formData.Name.trim().length < 2) {
      newErrors.Name = 'กรุณากรอกชื่อ-นามสกุลให้ถูกต้อง';
    }
    
    if (formData.Phone && !/^[0-9]{10}$/.test(formData.Phone.replace(/[-\s]/g, ''))) {
      newErrors.Phone = 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก';
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
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <User size={24} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={styles.mainTitle}>ข้อมูลส่วนตัว</h1>
              <p style={styles.subTitle}>
                <Sparkles size={14} color="#4A90D9" />
                จัดการข้อมูลส่วนตัวของคุณ
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.history.back()} 
            style={styles.backButton}
          >
            <ArrowLeft size={16} />
            กลับ
          </button>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div style={styles.successMessage}>
            <CheckCircle size={20} color="#27AE60" />
            <span>บันทึกข้อมูลสำเร็จ! 🎉</span>
          </div>
        )}

        {/* Profile Card */}
        <form onSubmit={handleSubmit} style={styles.profileCard}>
          {/* Avatar Section */}
          <div style={styles.avatarSection}>
            <div style={styles.avatarWrapper}>
              <div style={styles.avatar}>
                {formData.Name?.charAt(0) || 'U'}
              </div>
              <div style={styles.avatarBadge}>
                <Edit3 size={14} color="#FFFFFF" />
              </div>
            </div>
            <h3 style={styles.userName}>{formData.Name || "ผู้ดูแลระบบ"}</h3>
            <div style={styles.roleBadge}>
              <UserCheck size={14} />
              <span style={{ ...styles.roleText, color: getRoleColor(formData.Role) }}>
                {formData.Role || 'แอดมิน'}
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={16} color="#4A90D9" style={styles.labelIcon} />
              ชื่อ-นามสกุล <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
              style={{ ...styles.input, borderColor: errors.Name ? '#E74C3C' : '#E2E8F0' }}
              placeholder="กรุณากรอกชื่อ-นามสกุล"
            />
            {errors.Name && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.Name}
              </div>
            )}
          </div>

          {/* Phone Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Phone size={16} color="#27AE60" style={styles.labelIcon} />
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              style={{ ...styles.input, borderColor: errors.Phone ? '#E74C3C' : '#E2E8F0' }}
              placeholder="0XX-XXX-XXXX"
            />
            {errors.Phone && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.Phone}
              </div>
            )}
          </div>

          {/* Username Field (Readonly/Disabled) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <UserCircle size={16} color="#E67E22" style={styles.labelIcon} />
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              name="Username"
              value={formData.Username}
              disabled
              style={styles.inputDisabled}
            />
          </div>

          {/* Role Field (Readonly/Disabled) */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Shield size={16} color="#8E44AD" style={styles.labelIcon} />
              สถานะ
            </label>
            <input
              type="text"
              name="Role"
              value={formData.Role || 'ผู้ใช้งาน'}
              disabled
              style={styles.inputDisabled}
            />
          </div>

          {/* New Password Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Lock size={16} color="#E74C3C" style={styles.labelIcon} />
              รหัสผ่านใหม่
              <span style={styles.hintText}>(ปล่อยว่างหากไม่เปลี่ยน)</span>
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="NewPassword"
                placeholder="กรอกรหัสผ่านใหม่"
                value={formData.NewPassword}
                onChange={handleChange}
                style={{ ...styles.input, borderColor: errors.NewPassword ? '#E74C3C' : '#E2E8F0', paddingRight: '44px' }}
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
            <div style={styles.hintTextSmall}>
              <Key size={12} color="#94A3B8" />
              ต้องมีความยาวอย่างน้อย 6 ตัวอักษร
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Key size={16} color="#E67E22" style={styles.labelIcon} />
              ยืนยันรหัสผ่านใหม่
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="ConfirmPassword"
                placeholder="กรอกยืนยันรหัสผ่านใหม่อีกครั้ง"
                value={formData.ConfirmPassword}
                onChange={handleChange}
                style={{ ...styles.input, borderColor: errors.ConfirmPassword ? '#E74C3C' : '#E2E8F0', paddingRight: '44px' }}
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

          {/* Submit Button */}
          <button type="submit" style={styles.btnSave} disabled={saving}>
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
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
  },
  wrapper: {
    maxWidth: '560px',
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
  spinnerSmall: {
    animation: 'spin 1s linear infinite',
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
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    color: '#4A90D9',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '8px 14px',
    transition: 'all 0.2s ease',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
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

  profileCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    padding: '32px 36px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '8px',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: '12px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#EBF3FB',
    color: '#4A90D9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
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
  userName: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A202C',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    backgroundColor: '#F1F5F9',
    borderRadius: '20px',
  },
  roleText: {
    fontSize: '14px',
    fontWeight: '500',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#334155',
    fontWeight: '500',
  },
  labelIcon: {
    flexShrink: 0,
  },
  required: {
    color: '#E74C3C',
    fontSize: '14px',
  },
  hintText: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: '400',
    marginLeft: '4px',
  },
  hintTextSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: '4px',
  },
  input: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    backgroundColor: '#FAFBFC',
    transition: 'all 0.2s ease',
    color: '#1A202C',
  },
  inputDisabled: {
    padding: '10px 14px',
    fontSize: '14px',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
    cursor: 'not-allowed',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
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
  errorText: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#E74C3C',
  },

  btnSave: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    backgroundColor: '#4A90D9',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontFamily: "'Kanit', 'Sarabun', system-ui, sans-serif",
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.2)',
    transition: 'all 0.2s ease',
    marginTop: '4px',
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

  input:focus {
    border-color: #4A90D9 !important;
    box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1) !important;
  }
  
  @media (max-width: 640px) {
    .profile-card {
      padding: 24px 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default EditProfile;