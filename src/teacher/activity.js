import React, { useEffect, useState } from "react";
import axios from "axios";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [nameActivity, setNameActivity] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [location, setLocation] = useState("");
  const [activityDate, setActivityDate] = useState("");

  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [galleryTitle, setGalleryTitle] = useState("");
  const [activeGalleryImages, setActiveGalleryImages] = useState(null);

  const [lightBoxImage, setLightBoxImage] = useState(null);
  const [currentLightBoxIndex, setCurrentLightBoxIndex] = useState(0);

  const API_URL = "http://127.0.0.1:3001/activities";

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' }
      });
      setActivities(res.data);
    } catch (err) {
      console.error("ดึงข้อมูลไม่สำเร็จ! ตรวจสอบการเชื่อมต่อ API:", err);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const objectUrls = files.map(file => URL.createObjectURL(file));
      setPreviewImages(objectUrls);

      const resizeAndCompress = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;

              const MAX_WIDTH = 1024;
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, width, height);

              const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
              resolve(compressedBase64);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      };

      const compressPromises = files.map(file => resizeAndCompress(file));
      Promise.all(compressPromises).then(base64Strings => {
        setImages(base64Strings);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameActivity) return alert("กรุณากรอกชื่อกิจกรรม");

    let finalImages = images.length > 0 ? images : (editId && previewImages.length > 0 ? previewImages : null);

    const requestData = {
      Name_activity: nameActivity,
      Photographer: photographer,
      Location: location,
      Activity_date: activityDate ? activityDate : null,
      User_id: 1,
      Image: finalImages ? JSON.stringify(finalImages) : null
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, requestData);
        alert("แก้ไขข้อมูลกิจกรรมสำเร็จ");
      } else {
        await axios.post(API_URL, requestData);
        alert("เพิ่มข้อมูลกิจกรรมสำเร็จ");
      }
      clearForm();
      fetchActivities();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchActivities();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (item) => {
    setEditId(item.Activity_id);
    setNameActivity(item.Name_activity || "");
    setPhotographer(item.Photographer || "");
    setLocation(item.Location || "");
    setActivityDate(item.Activity_date ? item.Activity_date.split("T")[0] : "");
    setImages([]);

    let oldImages = [];
    const rawImage = item.Image || item.Images;

    if (rawImage) {
      if (typeof rawImage === "string") {
        if (rawImage.startsWith("[")) {
          try { oldImages = JSON.parse(rawImage); } catch (e) { oldImages = [rawImage]; }
        } else { oldImages = [rawImage]; }
      } else if (Array.isArray(rawImage)) { oldImages = rawImage; }
    }
    setPreviewImages(oldImages);
    setShowForm(true);
  };

  const clearForm = () => {
    setNameActivity("");
    setPhotographer("");
    setLocation("");
    setActivityDate("");
    setImages([]);
    setPreviewImages([]);
    setEditId(null);
    setShowForm(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "ไม่ระบุวันเวลา";
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredActivities = activities.filter((item) => {
    return (
      item.Name_activity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Photographer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gradient-to-br from-brand-lightBg to-[#e0f2fe] w-full box-border font-sans antialiased">
      <div className="max-w-[1240px] mx-auto w-full">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-sky-100/50 shadow-sm">
          <div>
            <span className="px-3 py-1 text-xs font-semibold bg-sky-100 text-brand-primary rounded-full inline-block mb-1.5">
              Workspace
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-brand-darkText tracking-tight m-0">
              จัดการข้อมูล<span className="text-brand-primary">กิจกรรม</span>
            </h1>
          </div>
          <button
            onClick={() => { if (showForm) clearForm(); else setShowForm(true); }}
            className="teacher-btn teacher-btn-add"
          >
            {showForm ? "✕ ปิดฟอร์มบันทึก" : "➕ เพิ่มกิจกรรมใหม่"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 w-full group">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-sky-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="ค้นหาชื่อกิจกรรม, สถานที่ หรือผู้บันทึกภาพ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-sky-100 rounded-xl text-sm box-border focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-sky-100 transition-all placeholder:text-slate-400 text-slate-700"
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-[480px] p-6 shadow-2xl border border-sky-50 box-border relative">
              <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-brand-darkText m-0 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brand-primary rounded-full inline-block"></span>
                  {editId ? "แก้ไขข้อมูลกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
                </h2>
                <button type="button" onClick={clearForm} className="bg-none border-none text-xl text-slate-400 cursor-pointer hover:text-slate-600 transition">✕</button>
              </div>

              {/* Upload Zone */}
              <div className="flex items-center border border-dashed border-sky-200 rounded-xl p-4 mb-5 bg-sky-50/50">
                <label className="cursor-pointer border border-sky-100 rounded-xl p-3 bg-white inline-block hover:border-brand-primary transition-all text-center min-w-[70px]">
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  <div className="flex flex-col justify-center items-center">
                    <svg width="22" height="22" fill="none" stroke="#0284c7" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="mt-1 text-[11px] font-bold text-brand-primary">รูปภาพ</span>
                  </div>
                </label>

                <div className="flex gap-2 flex-wrap flex-1 ml-4 overflow-y-auto max-h-[75px] pr-1">
                  {previewImages.map((src, index) => (
                    <div key={index} className="w-[50px] h-[50px] rounded-lg overflow-hidden border border-sky-100 shadow-sm flex-shrink-0">
                      <img src={src} alt={`preview-${index}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {previewImages.length === 0 && <span className="text-xs text-slate-400 italic">ยังไม่มีการเลือกรูปภาพ</span>}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">ชื่อกิจกรรม</label>
                  <input type="text" placeholder="กรอกชื่อกิจกรรม" value={nameActivity} onChange={(e) => setNameActivity(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-sky-100 box-border text-slate-700" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">ผู้บันทึกภาพ</label>
                  <input type="text" placeholder="กรอกชื่อผู้บันทึกภาพ" value={photographer} onChange={(e) => setPhotographer(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-sky-100 box-border text-slate-700" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">วันที่จัดกิจกรรม</label>
                    <input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-sky-100 box-border text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">สถานที่</label>
                    <input type="text" placeholder="กรอกสถานที่" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-sky-100 box-border text-slate-700" />
                  </div>
                </div>
              </div>

              <button type="submit" className="teacher-btn teacher-btn-save teacher-btn-full mt-6">
                💾 บันทึกข้อมูลกิจกรรม
              </button>
            </form>
          </div>
        )}

        {/* Activity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {filteredActivities.length === 0 ? (
            <div className="col-span-full text-center bg-white rounded-2xl py-12 px-4 border border-sky-100 shadow-sm">
              <span className="text-4xl block mb-2">📁</span>
              <p className="text-slate-400 text-sm m-0">ไม่พบข้อมูลกิจกรรมในระบบการค้นหา</p>
            </div>
          ) : (
            filteredActivities.map((item) => {
              let itemImages = [];
              const targetField = item.Image || item.Images;

              if (targetField) {
                if (typeof targetField === "string") {
                  if (targetField.startsWith("[")) {
                    try { itemImages = JSON.parse(targetField); } catch (e) { itemImages = [targetField]; }
                  } else { itemImages = [targetField]; }
                } else if (Array.isArray(targetField)) { itemImages = targetField; }
              }

              return (
                <div key={item.Activity_id} className="bg-white rounded-2xl border border-sky-100/70 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">

                  {/* Image Cover */}
                  <div
                    className={`w-full h-44 bg-slate-50 relative overflow-hidden ${itemImages.length > 0 ? "cursor-zoom-in" : "cursor-default"}`}
                    onClick={() => {
                      if (itemImages.length > 0) {
                        setGalleryTitle(item.Name_activity || "คลังรูปภาพกิจกรรม");
                        setActiveGalleryImages(itemImages);
                      }
                    }}
                  >
                    {itemImages.length > 0 && itemImages[0] ? (
                      <div className="w-full h-full relative">
                        <img src={itemImages[0]} alt={item.Name_activity} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {itemImages.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-slate-900/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                            +{itemImages.length - 1} รูปภาพ
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-sky-50/50">
                        <svg className="w-8 h-8 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[11px] text-sky-300">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  {/* Information Details */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="text-base font-bold text-brand-darkText m-0 mb-3 overflow-hidden text-ellipsis whitespace-nowrap" title={item.Name_activity}>
                        {item.Name_activity || "ไม่มีชื่อกิจกรรม"}
                      </h2>
                      <div className="space-y-2 border-l-2 border-sky-100 pl-3">
                        <p className="text-xs text-slate-500 m-0 flex items-center gap-1.5">
                          <span className="text-brand-primary">📸</span> <span className="font-medium text-slate-400">ผู้บันทึก:</span> {item.Photographer || "ไม่ระบุ"}
                        </p>
                        <p className="text-xs text-slate-500 m-0 flex items-center gap-1.5">
                          <span className="text-brand-primary">📅</span> <span className="font-medium text-slate-400">วันที่:</span> {formatDate(item.Activity_date)}
                        </p>
                        <p className="text-xs text-slate-500 m-0 flex items-center gap-1.5">
                          <span className="text-brand-primary">📍</span> <span className="font-medium text-slate-400">สถานที่:</span> {item.Location || "ไม่ระบุ"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex border-t border-slate-100 bg-slate-50/70 p-1.5 gap-1">
                    <button onClick={() => handleEdit(item)} className="teacher-btn teacher-btn-edit teacher-btn-flex">
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => handleDelete(item.Activity_id)} className="teacher-btn teacher-btn-delete teacher-btn-flex">
                      🗑️ ลบออก
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Gallery Modal */}
        {activeGalleryImages && activeGalleryImages.length > 0 && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4" onClick={() => setActiveGalleryImages(null)}>
            <div className="bg-white border border-sky-100 rounded-2xl w-full max-w-[560px] p-6 shadow-2xl flex flex-col relative max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start w-full mb-4 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-brand-darkText m-0 text-left">{galleryTitle}</h2>
                  <span className="text-xs font-medium text-brand-primary mt-0.5 text-left">📂 คลังภาพถ่ายรวมทั้งหมด ({activeGalleryImages.length} รูป)</span>
                </div>
                <button onClick={() => setActiveGalleryImages(null)} className="bg-slate-50 border-none w-7 h-7 flex items-center justify-center rounded-full text-slate-400 text-sm cursor-pointer hover:bg-slate-100 transition">✕</button>
              </div>

              <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-1 w-full box-border">
                {activeGalleryImages.map((imgSrc, idx) => (
                  <div
                    key={idx}
                    className="w-full aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 relative cursor-zoom-in hover:border-brand-primary transition-all"
                    onClick={() => {
                      setLightBoxImage(imgSrc);
                      setCurrentLightBoxIndex(idx);
                    }}
                  >
                    <img src={imgSrc} alt={`gallery-item-${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LightBox Modal */}
        {lightBoxImage && (
          <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[11000] p-4" onClick={() => setLightBoxImage(null)}>
            <div className="bg-transparent w-full max-w-[850px] flex flex-col items-center relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setLightBoxImage(null)} className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 border-none text-white w-9 h-9 flex items-center justify-center rounded-full text-lg cursor-pointer transition">✕</button>

              <div className="flex w-full items-center justify-between gap-4">
                {currentLightBoxIndex > 0 ? (
                  <button
                    onClick={() => {
                      const nextIndex = currentLightBoxIndex - 1;
                      setCurrentLightBoxIndex(nextIndex);
                      setLightBoxImage(activeGalleryImages[nextIndex]);
                    }}
                    className="w-12 h-12 rounded-full border border-white/20 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    ◀
                  </button>
                ) : <div className="w-12" />}

                <div className="flex-1 h-[68vh] flex items-center justify-center overflow-hidden">
                  <img src={lightBoxImage} alt="ขยายใหญ่" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                </div>

                {currentLightBoxIndex < activeGalleryImages.length - 1 ? (
                  <button
                    onClick={() => {
                      const nextIndex = currentLightBoxIndex + 1;
                      setCurrentLightBoxIndex(nextIndex);
                      setLightBoxImage(activeGalleryImages[nextIndex]);
                    }}
                    className="w-12 h-12 rounded-full border border-white/20 bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    ▶
                  </button>
                ) : <div className="w-12" />}
              </div>

              <div className="mt-5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white/80 font-medium">
                รูปภาพที่ {currentLightBoxIndex + 1} จาก {activeGalleryImages.length}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Activity;
