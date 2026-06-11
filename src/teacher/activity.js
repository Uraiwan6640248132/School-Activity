import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  // 1. สร้าง State แลกเปลี่ยนข้อมูลให้ตรงตามฟิลด์ตารางฐานข้อมูล activity
  const [activities, setActivities] = useState([]);
  const [nameActivity, setNameActivity] = useState(""); // ฟิลด์ Name_activity
  const [location, setLocation] = useState("");         // ฟิลด์ Location
  const [activityDate, setActivityDate] = useState("");   // ฟิลด์ Activity_date
  const [editId, setEditId] = useState(null);           // ฟิลด์ Activity_id
  
  const [showForm, setShowForm] = useState(false);

  // เปลี่ยนเป็น IP ตรง 127.0.0.1 เพื่อบังคับเบราว์เซอร์ส่งข้ามพอร์ตและเคลียร์แคช
  const API_URL = "http://127.0.0.1:3001/activities"; 

  useEffect(() => {
    fetchActivities();
  }, []);

  // 🔄 ฟังก์ชันดึงข้อมูลกิจกรรม (GET)
  const fetchActivities = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลไม่สำเร็จ! ตรวจสอบการเชื่อมต่อ API:", err);
    }
  };

  // 💾 ฟังก์ชันบันทึกข้อมูล (สร้างใหม่ POST / แก้ไข PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameActivity) return alert("กรุณากรอกชื่อกิจกรรม");

    // จัดระเบียบ Object ส่งเข้าหลังบ้านตัวใหญ่ตัวเล็กตรงกัน
    const activityData = {
      Name_activity: nameActivity,
      Location: location,
      Activity_date: activityDate,
      User_id: 1 
    };

    try {
      if (editId) {
        // แก้ไขข้อมูลเก่าตาม ID
        await axios.put(`${API_URL}/${editId}`, activityData);
      } else {
        // บันทึกสร้างกิจกรรมใหม่
        await axios.post(API_URL, activityData);
      }

      clearForm();
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล ลองตรวจสอบ Console หลังบ้าน");
    }
  };

  // ❌ ฟังก์ชันลบกิจกรรม (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchActivities();
      } catch (err) {
        console.error(err);
        alert("ไม่สามารถลบข้อมูลได้");
      }
    }
  };

  // ✏️ ฟังก์ชันดึงข้อมูลแถวที่เลือกขึ้นไปตั้งต้นบนฟอร์มเพื่อเตรียมแก้ไข
  const handleEdit = (item) => {
    setEditId(item.Activity_id);
    setNameActivity(item.Name_activity);
    setLocation(item.Location);
    setActivityDate(item.Activity_date ? item.Activity_date.split("T")[0] : "");
    setShowForm(true);
  };

  const clearForm = () => {
    setNameActivity("");
    setLocation("");
    setActivityDate("");
    setEditId(null);
    setShowForm(false);
  };

  // จัดการจัดแสดงวันที่รูปแบบของประเทศไทย
  const formatDate = (dateStr) => {
    if (!dateStr) return "ไม่ระบุวันเวลา";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ส่วนหัวแสดงประเภทเมนู */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <button className="bg-white border border-slate-400 text-black font-medium px-8 py-2 rounded-md shadow-sm text-lg">
              กิจกรรม
            </button>
            <h1 className="text-xl font-bold mt-3 pl-2 text-slate-900">จัดการข้อมูลกิจกรรม</h1>
          </div>

          <button 
            onClick={() => { if(showForm) clearForm(); else setShowForm(true); }}
            className="bg-white border border-slate-300 text-black font-bold px-5 py-2 rounded-md shadow-md text-lg hover:bg-gray-50 transition"
          >
            {showForm ? "✕ ปิดฟอร์ม" : "+ เพิ่มกิจกรรม"}
          </button>
        </div>

        {/* หน้าต่างสไลด์ฟอร์มกรอกข้อมูลกิจกรรม */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-2xl p-6 mb-8 max-w-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">{editId ? "✏️ แก้ไขข้อมูลกิจกรรม" : "➕ เพิ่มกิจกรรมใหม่"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ชื่อกิจกรรม</label>
                <input
                  type="text"
                  className="w-full border border-slate-400 rounded-md p-2"
                  placeholder="กรอกชื่อกิจกรรม"
                  value={nameActivity}
                  onChange={(e) => setNameActivity(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">สถานที่</label>
                <input
                  type="text"
                  className="w-full border border-slate-400 rounded-md p-2"
                  placeholder="กรอกสถานที่จัดกิจกรรม"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">วัน/เดือน/ปี</label>
                <input
                  type="date"
                  className="w-full border border-slate-400 rounded-md p-2"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition">
                  {editId ? "อัปเดตข้อมูล" : "บันทึกข้อมูล"}
                </button>
                <button type="button" onClick={clearForm} className="bg-gray-300 text-black font-bold px-4 py-2 rounded-md hover:bg-gray-400 transition">
                  ยกเลิก
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 🗂️ Grid การ์ดรายการแสดงกิจกรรมดึงตรงจากตาราง MySQL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {activities.length === 0 ? (
            <p className="text-slate-400 col-span-2 text-center py-12">ไม่พบข้อมูลกิจกรรมในระบบ หรือเซิร์ฟเวอร์หลังบ้านยังไม่ได้เปิด</p>
          ) : (
            activities.map((item) => (
              <div key={item.Activity_id} className="bg-white border border-slate-400 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-3 text-black truncate">{item.Name_activity}</h2>
                  <p className="text-slate-400 text-lg mb-2">{formatDate(item.Activity_date)}</p>
                  <p className="text-slate-400 text-lg mb-6 break-words">{item.Location || "ไม่ระบุสถานที่"}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="bg-white border border-slate-400 text-black text-center py-1.5 rounded-md shadow-sm hover:bg-gray-50 transition"
                  >
                    แก้ไข
                  </button>
                  <button 
                    onClick={() => handleDelete(item.Activity_id)}
                    className="bg-white border border-slate-400 text-black text-center py-1.5 rounded-md shadow-sm hover:bg-gray-50 transition"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Activity;