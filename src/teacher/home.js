import React from "react";

function Dashboard() {
  return (
    // 1. พื้นหลังหลักปรับเป็นไล่เฉดสีอ่อนๆ สบายตา
    <div className="min-h-screen bg-slate-50/50 flex font-sans antialiased text-slate-800">

      {/* SIDEBAR: ปรับให้ดูพรีเมียมด้วยสีเข้ม slate-900 และเมนูแบบมีสไตล์ */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl shrink-0">
        <div className="p-6 flex flex-col items-center border-b border-slate-800">
          {/* ส่วนโลโก้สถาบัน */}
          <div className="w-20 h-20 bg-white rounded-full p-2 shadow-inner mb-3 flex items-center justify-center">
            <img src="path-to-your-logo.png" alt="University Logo" className="object-contain" />
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">ระบบจัดการโรงเรียน</span>
        </div>

        {/* รายการเมนู: ใช้ hover effect อ่อนๆ และมีแถบสีเน้นหน้าปัจจุบัน */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-sky-600 text-white rounded-xl font-medium transition-all shadow-md shadow-sky-600/10">
            <span>📊</span> หน้าหลัก
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all">
            <span>👤</span> ข้อมูลส่วนตัว
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all">
            <span>🧑‍🎓</span> ข้อมูลนักเรียน
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all">
            <span>📅</span> กิจกรรม
          </a>
          {/* ... เพิ่มเมนูอื่นๆ ตามโครงสร้างเดิม ... */}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP NAVBAR: ปรับให้ใสและโมเดิร์นขึ้น */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">แดชบอร์ดภาพรวม</h2>
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200/50">
            <span className="text-sm font-semibold text-slate-600">🔔 นางสาวธัญรัตน์ สิงห์มณี</span>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-8 flex-grow">

          {/* TOP 3 CARDS: ปรับการ์ดสถิติให้ดูน่าสนใจขึ้น */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* การ์ดนักเรียน */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-sky-200 transition-all">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">นักเรียนทั้งหมด</p>
                <h3 className="text-3xl font-black text-slate-800">3 <span className="text-sm font-normal text-slate-400">คน</span></h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl font-bold">🧑‍🎓</div>
            </div>

            {/* การ์ดครูผู้สอน */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-purple-200 transition-all">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">ครูผู้สอน</p>
                <h3 className="text-3xl font-black text-slate-800">6 <span className="text-sm font-normal text-slate-400">คน</span></h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">👩‍🏫</div>
            </div>

            {/* การ์ดกิจกรรม */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-amber-200 transition-all">
              <div>
                <p className="text-sm font-medium text-slate-400 mb-1">กิจกรรมระบบ</p>
                <h3 className="text-3xl font-black text-slate-800">4 <span className="text-sm font-normal text-slate-400">กิจกรรม</span></h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">🎯</div>
            </div>

          </div>

          {/* LOWER TWO COLUMNS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* การบ้านล่าสุด (ฝั่งซ้าย - กว้างหน่อยเป็น 3 ส่วนจาก 5) */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">📝 การบ้านล่าสุด</h4>
                <span className="text-xs text-sky-600 font-medium cursor-pointer hover:underline">ดูทั้งหมด</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                <div>
                  <h5 className="text-sm font-bold text-slate-700">คณิตศาสตร์</h5>
                  <p className="text-xs text-slate-400 mt-1">ไม่มีรายละเอียดเพิ่มเติม</p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-200/60 text-slate-600 rounded-md font-medium">
                  ชั้น: อนุบาล 1 ห้อง 3 ภาษา
                </span>
              </div>
            </div>

            {/* กิจกรรมล่าสุด (ฝั่งขวา - กว้าง 2 ส่วนจาก 5) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">🚩 กิจกรรมล่าสุด</h4>
              </div>

              {/* รายการกิจกรรม: จัดระเบียบให้มีเส้นคั่นและไอคอนระบุสถานที่ชัดขึ้น */}
              <div className="divide-y divide-slate-100">
                {[
                  { name: "อบรมจริยธรรม", loc: "หอประชุมใหญ่" },
                  { name: "ไหว้ครู 2569", loc: "หอประชุม 2" },
                  { name: "ลอยกระทงประจำปี", loc: "ลานกิจกรรม" },
                  { name: "กีฬาสีสัมพันธ์", loc: "สนามฟุตบอล" }
                ].map((act, i) => (
                  <div key={i} className="py-3 flex justify-between items-center first:pt-0 last:pb-0 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                    <span className="text-sm font-semibold text-slate-700">{act.name}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      📍 {act.loc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;