import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  // เปลี่ยนชื่อ State ให้สอดคล้องกับคอลัมน์ใน Database เพื่อไล่โค้ดง่ายขึ้น
  const [activities, setActivities] = useState([]);
  const [nameActivity, setNameActivity] = useState(""); // ตรงกับ Name_activity
  const [location, setLocation] = useState("");         // ตรงกับ Location
  const [activityDate, setActivityDate] = useState("");   // ตรงกับ Activity_date
  const [editId, setEditId] = useState(null);           // ตรงกับ Activity_id
  
  const [showForm, setShowForm] = useState(false);

  // ตรวจสอบพอร์ตเซิร์ฟเวอร์หลังบ้าน (Backend) ของคุณให้ถูกต้อง (เช่น 3001)
  const API_URL = "http://localhost:3001/activities"; 

  useEffect(() => {
    fetchActivities();
  }, []);

  // 1. ดึงข้อมูลกิจกรรม (GET)
  const fetchActivities = async () => {
    try {
      const res = await axios.get(API_URL);
      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลไม่สำเร็จ! กรุณาตรวจสอบว่าเปิด API Server หรือยัง:", err);
    }
  };

  // 2. บันทึกข้อมูล เพิ่มใหม่ (POST) / แก้ไข (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameActivity) return alert("กรุณากรอกชื่อกิจกรรม");

    // โครงสร้าง Object ที่จะส่งไปหา Backend (Key ต้องตรงกับที่ Backend และ DB รอรับ)
    const activityData = {
      Name_activity: nameActivity,
      Location: location,
      Activity_date: activityDate,
      User_id: 1 // ใส่ตุนไว้ก่อนตามโครงสร้างที่มีคอลัมน์ User_id ใน DB
    };

    try {
      if (editId) {
        // อัปเดตข้อมูลกิจกรรมเดิม
        await axios.put(`${API_URL}/${editId}`, activityData);
      } else {
        // สร้างกิจกรรมใหม่
        await axios.post(API_URL, activityData);
      }

      // ล้างค่าข้อมูลในฟอร์มเมื่อบันทึกสำเร็จ
      clearForm();
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล (ตรวจสอบ Route ที่ Backend หรือแก้ปัญหา 404)");
    }
  };

  // 3. ลบข้อมูลกิจกรรม (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchActivities();
      } catch (err) {
        console.error(err);
        alert("ลบข้อมูลไม่สำเร็จ");
      }
    }
  };

  // 4. จิ้มเลือกการ์ดเพื่อนำข้อมูลเดิมขึ้นมาแก้ไข
  const handleEdit = (item) => {
    setEditId(item.Activity_id); // อ้างอิงตามคอลัมน์ Activity_id จากฐานข้อมูล
    setNameActivity(item.Name_activity); // อ้างอิงตามคอลัมน์ Name_activity
    setLocation(item.Location);         // อ้างอิงตามคอลัมน์ Location
    setActivityDate(item.Activity_date ? item.Activity_date.split("T")[0] : ""); // ตัด Format วันที่ให้เข้ากับ Input type="date"
    setShowForm(true);
  };

  const clearForm = () => {
    setNameActivity("");
    setLocation("");
    setActivityDate("");
    setEditId(null);
    setShowForm(false);
  };

  // ฟังก์ชันช่วยแสดงผลวันที่แบบไทย (เช่น 03/06/2026)
  const formatDate = (dateStr) => {
    if (!dateStr) return "ไม่ระบุวันเวลา";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 text-slate-800 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ส่วนหัวของหน้าเว็บ */}
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

        {/* หน้าต่างฟอร์ม เพิ่ม/แก้ไข ข้อมูล */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-2xl p-6 mb-8 max-w-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">{editId ? "✏️ แก้ไขกิจกรรม" : "➕ เพิ่มกิจกรรมใหม่"}</h3>
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

        {/* ส่วนแสดงรายการการ์ดกิจกรรมที่ดึงมาจาก Database */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {activities.length === 0 ? (
            <p className="text-slate-400 col-span-2 text-center py-12">ไม่พบข้อมูลกิจกรรมในระบบ หรือเซิร์ฟเวอร์หลังบ้านปิดอยู่</p>
          ) : (
            activities.map((item) => (
              <div key={item.Activity_id} className="bg-white border border-slate-400 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  {/* แสดงข้อมูลตามชื่อฟิลด์จาก phpMyAdmin */}
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