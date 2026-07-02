import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [counts, setCounts] = useState({ students: 0, users: 0, activities: 0 });
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const studentRes = await axios.get("http://localhost:3001/api/students");
        const userRes = await axios.get("http://localhost:3001/users");
        const activityRes = await axios.get("http://localhost:3001/activities");
        const notificationRes = await axios.get("http://localhost:3001/notifications");

        setCounts({
          students: studentRes.data.length,
          users: userRes.data.length,
          activities: activityRes.data.length,
        });

        setLatestNotifications(notificationRes.data.slice(0, 4));
        setLatestActivities(activityRes.data.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหน้า Home:", error);
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    // 🌟 เอาส่วนหัวแถบสีทึบเดิมออกเรียบร้อยแล้ว ปล่อยพื้นที่ให้การ์ดเรียงตัวสวยงามทันที
    <div className="max-w-7xl w-full mx-auto space-y-8 flex-grow">

      {/* 🟢 ส่วนบน: เมนูการ์ดตัวนับจำนวนสไตล์ลอยตัวนุ่มนวล (Soft Shadow) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* การ์ดนักเรียน */}
        <Link to="/students" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-sky-200 hover:shadow-md transition-all text-auto no-underline">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">นักเรียนทั้งหมด</p>
            <h3 className="text-3xl font-black text-slate-800">
              {loading ? <span className="text-xl font-medium text-slate-300">...</span> : counts.students}
              {!loading && <span className="text-sm font-normal text-slate-400 ml-1">คน</span>}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold shadow-inner group-hover:scale-105 transition-transform">🧑‍🎓</div>
        </Link>

        {/* การ์ดครูผู้สอน */}
        <Link to="/users" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-purple-200 hover:shadow-md transition-all text-auto no-underline">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">ครูผู้สอน</p>
            <h3 className="text-3xl font-black text-slate-800">
              {loading ? <span className="text-xl font-medium text-slate-300">...</span> : counts.users}
              {!loading && <span className="text-sm font-normal text-slate-400 ml-1">คน</span>}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold shadow-inner group-hover:scale-105 transition-transform">👩‍🏫</div>
        </Link>

        {/* การ์ดกิจกรรม */}
        <Link to="/activity" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-amber-200 hover:shadow-md transition-all text-auto no-underline">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">กิจกรรมระบบ</p>
            <h3 className="text-3xl font-black text-slate-800">
              {loading ? <span className="text-xl font-medium text-slate-300">...</span> : counts.activities}
              {!loading && <span className="text-sm font-normal text-slate-400 ml-1">กิจกรรม</span>}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold shadow-inner group-hover:scale-105 transition-transform">🎯</div>
        </Link>
      </div>

      {/* 🔵 ส่วนล่าง: กล่องข้อมูลอัปเดตล่าสุด 2 ฝั่งแบ่งคอลัมน์ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* กล่องการบ้านล่าสุด (กว้าง 3 ส่วน) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">📝 การบ้านล่าสุด</h4>
            <Link to="/notification" className="text-xs text-sky-600 font-semibold hover:underline no-underline">ดูทั้งหมด</Link>
          </div>

          <div className="space-y-3 flex-1">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-8 animate-pulse">กำลังโหลดข้อมูล...</p>
            ) : latestNotifications.length > 0 ? (
              latestNotifications.map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="truncate pr-4">
                    <strong className="text-sm font-bold text-slate-700 block md:inline">{item.Subject}</strong>
                    <span className="text-xs text-slate-400 md:ml-2">— {item.Details || "ไม่มีรายละเอียด"}</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 bg-white border border-slate-200/60 text-slate-500 rounded-lg font-medium shadow-sm shrink-0">
                    ชั้น: {item.Class_level}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">ไม่มีข้อมูลการบ้านล่าสุด</p>
            )}
          </div>
        </div>

        {/* กล่องกิจกรรมล่าสุด (กว้าง 2 ส่วน) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">🚩 กิจกรรมล่าสุด</h4>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-8 animate-pulse">กำลังโหลดข้อมูล...</p>
            ) : latestActivities.length > 0 ? (
              latestActivities.map((item, index) => (
                <Link to="/activity" key={index} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0 hover:bg-slate-50/60 px-2 rounded-xl transition-colors no-underline group">
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-600 transition-colors">{item.Name_activity}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-50 group-hover:bg-white px-2 py-1 rounded-md border border-transparent group-hover:border-slate-100 transition-all shadow-sm">
                    📍 {item.Location || "ไม่ระบุสถานที่"}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">ไม่มีข้อมูลกิจกรรมล่าสุด</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;