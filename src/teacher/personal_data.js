import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Phone,
  UserCircle,
  Shield,
  School,
  Lock,
  Key,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  UserCheck,
  Sparkles
  
} from "lucide-react";

const PersonalData = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    role: "ครูผู้สอน",
    class_level: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const storedUser = localStorage.getItem("user");
  const userObj = storedUser ? JSON.parse(storedUser) : null;
  const userId = userObj?.id || userObj?.ID || userObj?.id_user || 1;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/${userId}`);
        if (response.data) {
          setFormData({
            name: response.data.Name || "",
            phone: response.data.Phone || "",
            username: response.data.UserName || response.data.Username || "",
            role: response.data.Role || "ครูผู้สอน",
            class_level: response.data.Class_level || "ไม่มี",
            password: "",
            confirmPassword: "",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("ดึงข้อมูลส่วนตัวไม่สำเร็จ:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = "กรุณากรอกชื่อ-นามสกุลให้ถูกต้อง";
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก";
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านใหม่ และ ยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        Name: formData.name.trim(),
        Phone: formData.phone.trim(),
        Username: formData.username.trim(),
        Class_level: formData.class_level,
      };

      if (formData.password) {
        updateData.Password = formData.password;
      }

      await axios.put(`http://localhost:3001/users/${userId}`, updateData);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      alert("บันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวสำเร็จเรียบร้อยครับ!");
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (error) {
      console.error("บันทึกข้อมูลไม่สำเร็จ:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลส่วนตัว");
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
                {formData.name?.charAt(0) || 'U'}
              </div>
              <div style={styles.avatarBadge}>
                <Edit3 size={14} color="#FFFFFF" />
              </div>
            </div>
            <h3 style={styles.teacherName}>{formData.name || "ครูผู้สอน"}</h3>
            <div style={styles.roleBadge}>
              <UserCheck size={14} />
              <span style={{ ...styles.roleText, color: getRoleColor(formData.role) }}>
                {formData.role}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <User size={16} color="#4A90D9" style={styles.labelIcon} />
              ชื่อ-นามสกุล <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{ ...styles.input, borderColor: errors.name ? '#E74C3C' : '#E2E8F0' }}
              placeholder="กรุณากรอกชื่อ-นามสกุล"
            />
            {errors.name && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.name}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Phone size={16} color="#27AE60" style={styles.labelIcon} />
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              style={{ ...styles.input, borderColor: errors.phone ? '#E74C3C' : '#E2E8F0' }}
              placeholder="0XX-XXX-XXXX"
            />
            {errors.phone && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.phone}
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <UserCircle size={16} color="#E67E22" style={styles.labelIcon} />
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled
              style={styles.inputDisabled}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Shield size={16} color="#8E44AD" style={styles.labelIcon} />
              สถานะ
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              disabled
              style={styles.inputDisabled}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <School size={16} color="#4A90D9" style={styles.labelIcon} />
              ครูผู้สอนระดับชั้น
            </label>
            <input
              type="text"
              name="class_level"
              value={formData.class_level || "ไม่มี"}
              disabled
              style={styles.inputDisabled}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Lock size={16} color="#E74C3C" style={styles.labelIcon} />
              รหัสผ่านใหม่
              <span style={styles.hintText}>(ปล่อยว่างหากไม่เปลี่ยน)</span>
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="กรอกรหัสผ่านใหม่"
                value={formData.password}
                onChange={handleInputChange}
                style={{ ...styles.input, borderColor: errors.password ? '#E74C3C' : '#E2E8F0', paddingRight: '44px' }}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </button>
            </div>
            {errors.password && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.password}
              </div>
            )}
            <div style={styles.hintTextSmall}>
              <Key size={12} color="#94A3B8" />
              ต้องมีความยาวอย่างน้อย 6 ตัวอักษร
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              <Key size={16} color="#E67E22" style={styles.labelIcon} />
              ยืนยันรหัสผ่านใหม่
            </label>
            <div style={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="กรอกยืนยันรหัสผ่านใหม่อีกครั้ง"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{ ...styles.input, borderColor: errors.confirmPassword ? '#E74C3C' : '#E2E8F0', paddingRight: '44px' }}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div style={styles.errorText}>
                <AlertCircle size={14} />
                {errors.confirmPassword}
              </div>
            )}
          </div>

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
};

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
  teacherName: {
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
  
  .input:focus {
    border-color: #4A90D9 !important;
    box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.1) !important;
  }
  
  .btn-save:hover:not(:disabled) {
    background-color: #3A7BC8 !important;
    transform: translateY(-1px);
  }
  
  .btn-save:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 640px) {
    .profile-card {
      padding: 24px 20px !important;
    }
    .main-title {
      font-size: 20px !important;
    }
    .header {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
  
  @media (max-width: 480px) {
    .profile-card {
      padding: 20px 16px !important;
    }
    .avatar {
      width: 64px !important;
      height: 64px !important;
      font-size: 24px !important;
    }
    .teacher-name {
      font-size: 18px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default PersonalData;