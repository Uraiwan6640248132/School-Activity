import React from 'react';

function HomeAdmin() {
  return (
    <div style={styles.card}>
      <h2 style={styles.title}>ยินดีต้อนรับสู่ระบบผู้ดูแลระบบ (Admin Panel)</h2>
      <p style={styles.desc}>คุณสามารถจัดการข้อมูลผู้ใช้และระบบห้องเรียนได้จากเมนูด้านซ้าย</p>
    </div>
  );
}

const styles = {
  card: { background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  title: { margin: '0 0 10px 0', color: '#1e293b', fontSize: '20px' },
  desc: { margin: 0, color: '#64748b', fontSize: '15px' }
};

export default HomeAdmin; // 🌟 ต้องมีบรรทัดนี้เสมอ