import React, { useState } from 'react';

const styles = {
    bodyContainer: {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: '#f9f9f9',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        margin: 0,
    },
    registerContainer: {
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        borderRadius: '15px',
        padding: '30px',
        width: '320px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontSize: '14px',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '8px 10px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxSizing: 'border-box',
        fontSize: '14px',
        backgroundColor: '#fff',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
    },
    btnSubmit: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '18px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        marginTop: '10px',
    },
    alertDanger: { color: 'red', fontSize: '13px', textAlign: 'center', marginBottom: '15px' },
    alertSuccess: { color: 'green', fontSize: '13px', textAlign: 'center', marginBottom: '15px' }
};

function Register() {
    const [formData, setFormData] = useState({
        Name: '',
        Phone: '',
        UserName: '',
        Role: '',
        Password: '',
        ConfirmPassword: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (formData.Password !== formData.ConfirmPassword) {
            setMessage({ text: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน!', type: 'danger' });
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage({ text: data.message, type: 'success' });
                setFormData({ Name: '', Phone: '', UserName: '', Role: '', Password: '', ConfirmPassword: '' });
            } else {
                setMessage({ text: data.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', type: 'danger' });
            }
        } catch (error) {
            setMessage({ text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', type: 'danger' });
        }
    };

    return (
        <div style={styles.bodyContainer}>
            <div style={styles.registerContainer}>

                {message.text && (
                    <div style={message.type === 'danger' ? styles.alertDanger : styles.alertSuccess}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>ชื่อ-นามสกุล</label>
                        <input type="text" name="Name" value={formData.Name} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>เบอร์โทร</label>
                        <input type="text" name="Phone" value={formData.Phone} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>ชื่อผู้ใช้</label>
                        <input type="text" name="UserName" value={formData.UserName} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>สถานะ</label>
                        <select name="Role" value={formData.Role} onChange={handleChange} style={styles.input} required>
                            <option value="">-- เลือกสถานะ --</option>
                            <option value="ครูผู้สอน">ครูผู้สอน</option>
                            <option value="ผู้ปกครอง">ผู้ปกครอง</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>รหัสผ่าน</label>
                        <input type="password" name="Password" value={formData.Password} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>ยืนยันรหัสผ่าน</label>
                        <input type="password" name="ConfirmPassword" value={formData.ConfirmPassword} onChange={handleChange} style={styles.input} required />
                    </div>

                    <button type="submit" style={styles.btnSubmit}>ลงทะเบียน</button>
                </form>
            </div>
        </div>
    );
}

export default Register;