import React from 'react';

function HomeParent() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={styles.title}>การแจ้งเตือนการบ้านล่าสุด</h3>
        <p style={styles.empty}>ไม่มีการแจ้งเตือนในขณะนี้</p>
      </div>
      <div style={styles.card}>
        <h3 style={styles.title}>กิจกรรมล่าสุด</h3>
        <p style={styles.empty}>ไม่มีกิจกรรมใหม่ในขณะนี้</p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', gap: '20px' },
  card: { flex: 1, background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '200px' },
  title: { margin: '0 0 15px 0', color: '#334155', fontSize: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  empty: { color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginTop: '40px' }
};

export default HomeParent; // 🌟 ต้องมีบรรทัดนี้เสมอ