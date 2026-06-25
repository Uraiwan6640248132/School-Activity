import React, { useState, useEffect, useCallback } from 'react';

export default function Development() {
  const [devList, setDevList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const [selectedId, setSelectedId] = useState(null);

  // ค่าเริ่มต้นที่สะอาดไม่มีข้อมูลของเด็กคนอื่นค้าง
  const initialFormState = {
    Student_id: '',
    Year: 2569,
    Term: 'ภาคเรียนที่ 1',
    date: new Date().toISOString().split('T')[0],
    Physical: '',
    Weight: '',
    Height: '',
    Dental_health: '',
    Vaccination: '',
    Motor_skills: '',
    Emotional: '',
    Emotion: '4',
    Emotion_control: '3',
    Confidence: '4',
    Social: '',
    Stress: '2',
    Interaction: '5',
    Assistance: '5',
    Intellectual: '',
    Problem_solving: '2',
    Communication: '3',
    Remembering: '3'
  };

  const [formData, setFormData] = useState(initialFormState);

  const API_URL = 'http://localhost:3001/api/development';
  const STUDENTS_API_URL = 'http://localhost:3001/api/students';

  const fetchStudentsData = async () => {
    try {
      const res = await fetch(STUDENTS_API_URL);
      if (res.ok) {
        const data = await res.json();
        const cleanData = Array.isArray(data) ? data : [];
        setStudents(cleanData);
        // กำหนดค่าแรกเริ่มของนักเรียนให้กับฟอร์มว่างเพื่อไม่ให้เป็นค่าว่างเปล่าหลุดลอย

      }
    } catch (err) {
      console.error("Error fetching students list:", err);
    }
  };

  const fetchDevelopmentData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setDevList(data);
      }
    } catch (err) {
      console.error("Error fetching development data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
    fetchDevelopmentData();
  }, []);

  const getStudentName = useCallback((studentId) => {
    if (!students || students.length === 0) return `รหัส: ${studentId}`;
    const found = students.find(s => Number(s.Student_id || s.id || s.student_id) === Number(studentId));
    if (found) {
      return found.Name || found.name || `${found.First_name || ''} ${found.Last_name || ''}`.trim();
    }
    return `รหัสนักเรียน: ${studentId} (ไม่พบรายชื่อ)`;
  }, [students]);

  const calculateSectionScore = (scores) => {
    if (!scores || scores.length === 0) return 0;
    // แปลงค่าและกรองค่า NaN ออกป้องกันวงกลมขึ้น NaN ดื้อๆ
    const validScores = scores.map(s => isNaN(Number(s)) ? 0 : Number(s));
    const sum = validScores.reduce((a, b) => a + b, 0);
    const avg = sum / validScores.length;
    return Math.round(avg * 20);
  };

  // 🌟 ปรับปรุงการรับค่าเพื่อให้ทำงานร่วมกับ Dropdown <select> ได้เสถียรและไม่ล็อกค่า
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: String(value) }));
  };

  // 🌟 ปรับล้างฟอร์มใหม่ให้สะอาดหมดจด ดึงรหัสนักเรียนคนแรกแบบ Dynamic
  const resetForm = () => {
    setFormData(initialFormState);
    setSelectedId(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("บันทึกการประเมินพัฒนาการเรียบร้อย!");
        setIsAddOpen(false);
        resetForm();
        fetchDevelopmentData();
      } else {
        alert("ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const openDetailModal = (item) => {
    setSelectedDetailItem(item);
    setIsDetailOpen(true);
  };

  // 🌟 แปลงประเภท Student_id ให้กลายเป็น String เสมอเพื่อให้ตรงกับ Value ของตระกูล <option> ตัวค้างถึงจะหายไป
  const openEditModal = (item) => {
    setSelectedId(item.Development_id || item.development_id);

    let cleanDate = '';
    if (item.date_clean) {
      cleanDate = item.date_clean;
    } else if (item.Date) {
      cleanDate = String(item.Date).split('T')[0];
    } else if (item.date) {
      cleanDate = String(item.date).split('T')[0];
    }

    let dbTerm = item.Term || item.term || 'ภาคเรียนที่ 1';
    if (dbTerm.trim() === 'ภาคเรียนที่') {
      dbTerm = 'ภาคเรียนที่ 1';
    }

    setFormData({
      Student_id: String(item.Student_id || ''), // 🌟 แปลงเป็น String ป้องกัน Dropdown ค้างหรือล็อกเปลี่ยนไม่ได้
      Year: item.Year || 2569,
      Term: dbTerm,
      date: cleanDate,
      Physical: item.Physical || '',
      Weight: item.Weight || '',
      Height: item.Height || '',
      Dental_health: item.Dental_health || '',
      Vaccination: item.Vaccination || '',
      Motor_skills: item.Motor_skills || '',
      Emotional: item.Emotional || '',
      Emotion: String(item.Emotion || '3'),
      Emotion_control: String(item.Emotion_control || '3'),
      Confidence: String(item.Confidence || '3'),
      Social: item.Social || '',
      Stress: String(item.Stress || '3'),
      Interaction: String(item.Interaction || '3'),
      Assistance: String(item.Assistance || '3'),
      Intellectual: item.Intellectual || '',
      Problem_solving: String(item.Problem_solving || '3'),
      Communication: String(item.Communication || '3'),
      Remembering: String(item.Remembering || '3')
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("แก้ไขข้อมูลการประเมินสำเร็จ!");
        setIsEditOpen(false);
        resetForm();
        fetchDevelopmentData();
      } else {
        alert("ไม่สามารถแก้ไขข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`${API_URL}/${selectedId}`, { method: 'DELETE' });
      if (res.ok) {
        alert("ลบข้อมูลการประเมินเรียบร้อย!");
        setIsDeleteOpen(false);
        resetForm();
        fetchDevelopmentData();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const scoreLevels = [
    { label: 'ดีมาก', val: 5 },
    { label: 'ดี', val: 4 },
    { label: 'ปานกลาง', val: 3 },
    { label: 'พอใช้', val: 2 },
    { label: 'ปรับปรุง', val: 1 }
  ];

  const getScoreLabel = (val) => {
    const found = scoreLevels.find(l => String(l.val) === String(val));
    return found ? `${found.label} (${val})` : val || 'ไม่มีข้อมูล';
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardMain}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.mainTitle}>บันทึกพัฒนาการเด็ก</h2>
            <p style={styles.studentNameDisplay}>
              <strong>กำลังแสดงผลฟอร์มของ:</strong> {getStudentName(formData.Student_id)}
            </p>
          </div>
          <button style={styles.btnAddDev} onClick={() => { resetForm(); setIsAddOpen(true); }}>+ พัฒนาการ</button>
        </div>

        {loading && <p style={{ fontSize: '13px', color: '#666' }}>กำลังโหลดข้อมูล...</p>}

        <div style={styles.listContainer}>
          {devList.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>ยังไม่มีข้อมูลการประเมินพัฒนาการ</div>
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
                displayTerm = 'ภาคเรียนที่ 1';
              }

              return (
                <div key={idx} style={styles.devCardItem}>
                  <div style={styles.cardItemHeader}>
                    <span style={styles.yearText}>
                      <strong style={{ color: '#1e3a8a' }}>{getStudentName(item.Student_id)}</strong><br />
                      ปีการศึกษา {item.Year || item.year || '2569'} - {displayTerm}<br />
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>วันที่ประเมิน: {displayDate}</span>
                    </span>
                    <div style={styles.actionGroup}>
                      <button style={styles.actionBtnSmall} onClick={() => { setSelectedId(item.Development_id || item.development_id); setIsDeleteOpen(true); }}>🗑️</button>
                      <button style={styles.actionBtnSmall} onClick={() => openEditModal(item)}>📝</button>
                    </div>
                  </div>

                  <div style={{ ...styles.circlesRow, cursor: 'pointer' }} onClick={() => openDetailModal(item)} title="คลิกเพื่อดูรายละเอียดเพิ่มเติม">
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{isNaN(scoreBody) ? 0 : scoreBody}</div>
                      <span style={styles.circleLabel}>ด้านร่างกาย</span>
                    </div>
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{isNaN(scoreIntellect) ? 0 : scoreIntellect}</div>
                      <span style={styles.circleLabel}>ด้านสติปัญญา</span>
                    </div>
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{isNaN(scoreEmotion) ? 0 : scoreEmotion}</div>
                      <span style={styles.circleLabel}>ด้านอารมณ์</span>
                    </div>
                    <div style={styles.circleUnit}>
                      <div style={styles.circleScore}>{isNaN(scoreSocial) ? 0 : scoreSocial}</div>
                      <span style={styles.circleLabel}>ด้านสังคม</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isDetailOpen && selectedDetailItem && (
        <div style={styles.overlay} onClick={() => setIsDetailOpen(false)}>
          <div style={styles.modalDev} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>
                ปีการศึกษา {selectedDetailItem.Year || '2569'} ({selectedDetailItem.Term || 'ภาคเรียนที่ 1'})
              </span>
              <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>รายละเอียดพัฒนาการเด็ก</strong>
              <span style={styles.closeX} onClick={() => setIsDetailOpen(false)}>X</span>
            </div>

            <div style={styles.formScrollable}>
              <div style={{ backgroundColor: '#f0f4f8', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px', color: '#000' }}>
                  นักเรียน: {getStudentName(selectedDetailItem.Student_id)}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  วันที่ทำรายการประเมิน: {selectedDetailItem.date_clean || (selectedDetailItem.date ? String(selectedDetailItem.date).split('T')[0] : 'ไม่ระบุ')}
                </div>
              </div>

              <h4 style={{ ...styles.tableSectionTitle, marginTop: '0px', color: '#1e3a8a' }}>📊 1. ข้อมูลด้านร่างกาย</h4>
              <div style={{ ...styles.bodyMetricsRow, flexWrap: 'wrap', backgroundColor: '#fafafa', padding: '10px', borderRadius: '6px', gap: '8px' }}>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>น้ำหนัก:</strong> {selectedDetailItem.Weight || '-'} กก.</div>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>ส่วนสูง:</strong> {selectedDetailItem.Height || '-'} ซม.</div>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>สุขภาพฟัน:</strong> {selectedDetailItem.Dental_health || 'ไม่ได้ระบุ'}</div>
                <div style={{ width: '47%', fontSize: '13px' }}><strong>การได้รับวัคซีน:</strong> {selectedDetailItem.Vaccination || 'ไม่ได้ระบุ'}</div>
                <div style={{ width: '98%', fontSize: '13px' }}><strong>การเคลื่อนไหว (Motor):</strong> {selectedDetailItem.Motor_skills || 'ไม่ได้ระบุ'}</div>
              </div>

              <h4 style={{ ...styles.tableSectionTitle, color: '#1e3a8a' }}>🎭 2. รายละเอียดคะแนนหัวข้อย่อย</h4>
              <table style={{ ...styles.evalTable, border: '1px solid #e5e7eb' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ ...styles.thLeft, padding: '8px' }}>หัวข้อพัฒนาการ</th>
                    <th style={{ ...styles.thCenter, padding: '8px', width: '120px' }}>ระดับผลประเมิน</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ ...styles.tdLeft, fontWeight: 'bold' }} colSpan="2">ด้านอารมณ์</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การแสดงออกทางอารมณ์</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Emotion)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การควบคุมอารมณ์</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Emotion_control)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• ความมั่นใจในตัวเอง</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Confidence)}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ ...styles.tdLeft, fontWeight: 'bold' }} colSpan="2">ด้านสังคม</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การจัดการความเครียด</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Stress)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การมีปฏิสัมพันธ์กับผู้อื่น</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Interaction)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การเอื้อเฟื้อช่วยเหลือ</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Assistance)}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{ ...styles.tdLeft, fontWeight: 'bold' }} colSpan="2">ด้านสติปัญญา</td></tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• การคิดแก้ปัญหา</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Problem_solving)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• ทักษะการสื่อสาร</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Communication)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...styles.tdLeft, paddingLeft: '15px' }}>• ความสามารถในการจดจำ</td>
                    <td style={styles.tdCenter}>{getScoreLabel(selectedDetailItem.Remembering)}</td>
                  </tr>
                </tbody>
              </table>

              <button
                type="button"
                style={{ ...styles.btnSaveEvaluation, backgroundColor: '#3b82f6', color: '#fff', border: 'none', marginTop: '15px' }}
                onClick={() => setIsDetailOpen(false)}
              >
                ปิดหน้าต่างรายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}

      {(isAddOpen || isEditOpen) && (
        <div style={styles.overlay}>
          <div style={styles.modalDev}>
            <div style={styles.modalHeader}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>ปีการศึกษา {formData.Year}</span>
              <strong style={{ fontSize: '15px' }}>{isAddOpen ? "เพิ่มการพัฒนา" : "แก้ไขการพัฒนา"}</strong>
              <span style={styles.closeX} onClick={() => { setIsAddOpen(false); setIsEditOpen(false); resetForm(); }}>X</span>
            </div>

            <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} style={styles.formScrollable}>
              <div style={{ marginBottom: '15px' }}>
                <label style={styles.labelMini}>เลือกนักเรียนที่ต้องการประเมิน</label>
                <select
                  name="Student_id"
                  value={String(formData.Student_id)}
                  onChange={handleChange}
                  style={{ ...styles.inputMini, padding: '6px' }}
                  required
                >
                  <option value="" disabled>-- กรุณาเลือกนักเรียน --</option>
                  {students.map((std) => {
                    const id = String(std.Student_id || std.id || std.student_id);
                    const name = std.Name || std.name || `${std.First_name || ''} ${std.Last_name || ''}`;
                    return (
                      <option key={id} value={id}>
                        รหัส {id} - {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ ...styles.bodyMetricsRow, marginBottom: '15px' }}>
                <div style={{ ...styles.inputMiniGroup, width: '31%' }}>
                  <label style={styles.labelMini}>ปีการศึกษา (พ.ศ.)</label>
                  <input type="number" name="Year" value={formData.Year} onChange={handleChange} style={styles.inputMini} required />
                </div>
                <div style={{ ...styles.inputMiniGroup, width: '35%' }}>
                  <label style={styles.labelMini}>ภาคเรียน</label>
                  <select name="Term" value={formData.Term} onChange={handleChange} style={{ ...styles.inputMini, padding: '5px' }}>
                    <option value="ภาคเรียนที่ 1">ภาคเรียนที่ 1</option>
                    <option value="ภาคเรียนที่ 2">ภาคเรียนที่ 2</option>
                  </select>
                </div>
                <div style={{ ...styles.inputMiniGroup, width: '31%' }}>
                  <label style={styles.labelMini}>วันที่ประเมิน</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} style={styles.inputMini} required />
                </div>
              </div>

              <h4 style={{ ...styles.tableSectionTitle, marginTop: '0px' }}>พัฒนาการด้านร่างกาย</h4>
              <div style={styles.bodyMetricsRow}>
                <div style={styles.inputMiniGroup}>
                  <label style={styles.labelMini}>น้ำหนัก (กก.)</label>
                  <input type="text" name="Weight" value={formData.Weight} onChange={handleChange} style={styles.inputMini} />
                </div>
                <div style={styles.inputMiniGroup}>
                  <label style={styles.labelMini}>ส่วนสูง (ซม.)</label>
                  <input type="text" name="Height" value={formData.Height} onChange={handleChange} style={styles.inputMini} />
                </div>
                <div style={styles.inputMiniGroup}>
                  <label style={styles.labelMini}>สุขภาพฟัน</label>
                  <input type="text" name="Dental_health" value={formData.Dental_health} onChange={handleChange} style={styles.inputMini} placeholder="เช่น ปกติ/ผุ" />
                </div>
              </div>

              <div style={{ ...styles.bodyMetricsRow, marginTop: '10px' }}>
                <div style={{ ...styles.inputMiniGroup, width: '48%' }}>
                  <label style={styles.labelMini}>การได้รับวัคซีน</label>
                  <input type="text" name="Vaccination" value={formData.Vaccination} onChange={handleChange} style={styles.inputMini} placeholder="เช่น ครบตามเกณฑ์" />
                </div>
                <div style={{ ...styles.inputMiniGroup, width: '48%' }}>
                  <label style={styles.labelMini}>การเคลื่อนไหว</label>
                  <input type="text" name="Motor_skills" value={formData.Motor_skills} onChange={handleChange} style={styles.inputMini} placeholder="เช่น คล่องแคล่ว" />
                </div>
              </div>

              <h4 style={styles.tableSectionTitle}>พัฒนาการด้านอารมณ์</h4>
              <table style={styles.evalTable}>
                <thead>
                  <tr>
                    <th style={styles.thLeft}>หัวข้อ</th>
                    {scoreLevels.map(l => <th key={l.val} style={styles.thCenter}>{l.label}<br />{l.val}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'การแสดงออกทางอารมณ์', key: 'Emotion' },
                    { label: 'การควบคุมอารมณ์', key: 'Emotion_control' },
                    { label: 'ความมั่นใจ', key: 'Confidence' }
                  ].map(row => (
                    <tr key={row.key}>
                      <td style={styles.tdLeft}>{row.label}</td>
                      {scoreLevels.map(l => (
                        <td key={l.val} style={styles.tdCenter}>
                          <input type="radio" name={row.key} checked={String(formData[row.key]) === String(l.val)} onChange={() => handleRadioChange(row.key, l.val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 style={styles.tableSectionTitle}>พัฒนาการด้านสังคม</h4>
              <table style={styles.evalTable}>
                <tbody>
                  {[
                    { label: 'การจัดการความเครียด', key: 'Stress' },
                    { label: 'การมีปฏิสัมพันธ์กับผู้อื่น', key: 'Interaction' },
                    { label: 'การช่วยเหลือ', key: 'Assistance' }
                  ].map(row => (
                    <tr key={row.key}>
                      <td style={styles.tdLeft}>{row.label}</td>
                      {scoreLevels.map(l => (
                        <td key={l.val} style={styles.tdCenter}>
                          <input type="radio" name={row.key} checked={String(formData[row.key]) === String(l.val)} onChange={() => handleRadioChange(row.key, l.val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 style={styles.tableSectionTitle}>พัฒนาการด้านสติปัญญา</h4>
              <table style={styles.evalTable}>
                <tbody>
                  {[
                    { label: 'การแก้ปัญหา', key: 'Problem_solving' },
                    { label: 'การสื่อสาร', key: 'Communication' },
                    { key: 'Remembering', label: 'การจดจำ' }
                  ].map(row => (
                    <tr key={row.key}>
                      <td style={styles.tdLeft}>{row.label}</td>
                      {scoreLevels.map(l => (
                        <td key={l.val} style={styles.tdCenter}>
                          <input type="radio" name={row.key} checked={String(formData[row.key]) === String(l.val)} onChange={() => handleRadioChange(row.key, l.val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <button type="submit" style={styles.btnSaveEvaluation}>{isAddOpen ? "บันทึกการประเมิน" : "บันทึกการแก้ไข"}</button>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div style={styles.overlay}>
          <div style={styles.deleteModal}>
            <div style={styles.deleteIcon}>🗑️</div>
            <h3 style={styles.deleteTitle}>ยืนยันการลบ</h3>
            <p style={styles.deleteSubtitle}>คุณต้องการลบข้อมูลประเมินชุดนี้ใช่หรือไม่</p>
            <div style={styles.deleteBtnRow}>
              <button type="button" style={styles.btnCancel} onClick={() => { setIsDeleteOpen(false); resetForm(); }}>ยกเลิก</button>
              <button type="button" style={styles.btnConfirmDelete} onClick={handleDeleteSubmit}>ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', width: '100%', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif' },
  cardMain: { border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '100%', maxWidth: '650px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' },
  mainTitle: { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' },
  studentNameDisplay: { margin: '4px 0 0 0', fontSize: '14px', color: '#666' },
  btnAddDev: { padding: '6px 16px', border: '1px solid #333', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '16px' },
  devCardItem: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', backgroundColor: '#fafafa' },
  cardItemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  yearText: { fontSize: '14px', fontWeight: '500', color: '#444', lineHeight: '1.5' },
  actionGroup: { display: 'flex', gap: '8px' },
  actionBtnSmall: { border: '1px solid #ccc', backgroundColor: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '4px 6px', fontSize: '12px' },
  circlesRow: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '10px' },
  circleUnit: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  circleScore: { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', backgroundColor: '#fff' },
  circleLabel: { fontSize: '11px', color: '#555' },

  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  modalDev: { backgroundColor: '#fff', width: '90%', maxWidth: '520px', height: '85vh', borderRadius: '12px', border: '1px solid #999', padding: '20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #eee' },
  closeX: { cursor: 'pointer', fontWeight: 'bold', color: '#999' },
  formScrollable: { overflowY: 'auto', flex: 1, paddingRight: '5px', marginTop: '15px' },

  bodyMetricsRow: { display: 'flex', gap: '10px', justifyContent: 'space-between' },
  inputMiniGroup: { display: 'flex', flexDirection: 'column', gap: '4px', width: '32%' },
  labelMini: { fontSize: '12px', color: '#333' },
  inputMini: { padding: '6px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', width: '100%', boxSizing: 'border-box' },

  tableSectionTitle: { fontSize: '13px', margin: '16px 0 6px 0', color: '#000', borderBottom: '1px solid #ccc', paddingBottom: '2px', fontWeight: 'bold' },
  evalTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '10px' },
  thLeft: { textAlign: 'left', fontSize: '11px', color: '#333', padding: '6px', fontWeight: 'bold', backgroundColor: '#f5f5f5' },
  thCenter: { textAlign: 'center', fontSize: '11px', color: '#333', padding: '6px', fontWeight: '500', minWidth: '45px', backgroundColor: '#f5f5f5' },
  tdLeft: { fontSize: '12px', padding: '8px 6px', borderBottom: '1px solid #eee', color: '#444' },
  tdCenter: { textAlign: 'center', padding: '8px 6px', borderBottom: '1px solid #eee' },
  btnSaveEvaluation: { width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },

  deleteModal: { backgroundColor: '#fff', width: '320px', padding: '25px', borderRadius: '12px', border: '1px solid #bbb', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
  deleteIcon: { fontSize: '40px', marginBottom: '12px' },
  deleteTitle: { margin: '0 0 6px 0', fontSize: '16px', color: '#000', fontWeight: 'bold' },
  deleteSubtitle: { margin: '0 0 20px 0', fontSize: '13px', color: '#666' },
  deleteBtnRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  btnCancel: { padding: '8px 20px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#333' },
  btnConfirmDelete: { padding: '8px 20px', backgroundColor: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }
};