const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();

// ✅ ปรับปรุง CORS ให้ครอบคลุมการทำงานร่วมกับ React หน้าบ้าน
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

// ปรับเพิ่มความจุการรับข้อความจากเดิมไม่กี่ KB ให้กลายเป็น 50MB เพื่อรองรับ Base64 ของรูปภาพเยอะ ๆ
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// บันทึกไฟล์อัปโหลด
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) { return cb(null, true); }
  cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น!'));
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ฟังก์ชันช่วยตรวจสอบและแปลงฟอร์แมตวันที่จากหน้าบ้านให้เป็น YYYY-MM-DD ก่อนบันทึกลงฐานข้อมูล
// ฟังก์ชันแปลงวันที่สำหรับ MySQL (ตัดปัญหา Timezone เคลื่อน)
function parseDateForMySQL(dateStr) {
  if (!dateStr) return null;

  // ถ้าส่งมาเป็น ISO string หรือสตริง เช่น "2026-08-30T00:00:00.000Z" หรือ "2026-08-30"
  // ให้ใช้ Regex ดึงเฉพาะ YYYY-MM-DD ออกมาตรงๆ
  if (typeof dateStr === 'string') {
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) {
      return match[0]; // จะได้ "2026-08-30" พอดี ไม่โดนบวก/ลบเวลา
    }
  }

  // ป้องกันกรณีส่งมาเป็น Date Object
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ==========================================
// 👤 ระบบ API จัดการข้อมูลผู้ใช้งาน (USERS)
// ==========================================

app.get("/users", (req, res) => {
  const sql = "SELECT User_id, Name, Phone, Email, Password, UserName, Role, Class_level, Status FROM users";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล users:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

app.get("/users/:id", (req, res) => {
  db.query("SELECT * FROM users WHERE User_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
    res.json(result[0]);
  });
});

app.put("/users/:id", (req, res) => {
  const Name = req.body.Name || req.body.name;
  const Phone = req.body.Phone || req.body.phone;
  const Email = req.body.Email || req.body.email || null;
  const UserName = req.body.UserName || req.body.Username || req.body.username;
  const Role = req.body.Role || req.body.role;
  const Class_level = req.body.Class_level || req.body.class_level;
  const Status = req.body.Status || req.body.status || 'ใช้งาน';
  const Password = req.body.Password || req.body.password;

  let sql = "";
  let params = [];

  if (Password && Password.trim() !== "") {
    sql = `UPDATE users SET Name=?, Phone=?, Email=?, UserName=?, Role=?, Class_level=?, Status=?, Password=? WHERE User_id=?`;
    params = [Name, Phone, Email, UserName, Role, Class_level, Status, Password, req.params.id];
  } else {
    sql = `UPDATE users SET Name=?, Phone=?, Email=?, UserName=?, Role=?, Class_level=?, Status=? WHERE User_id=?`;
    params = [Name, Phone, Email, UserName, Role, Class_level, Status, req.params.id];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Backend Error updating user:", err);
      return res.status(500).json(err);
    }
    res.json({ success: true, message: "อัปเดตผู้ใช้งานสำเร็จ" });
  });
});

app.delete('/users/:id', (req, res) => {
  db.query("DELETE FROM users WHERE User_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "ไม่สามารถลบผู้ใช้ได้เนื่องจากมีข้อมูลเชื่อมโยงกันอยู่" });
    res.json({ success: true, message: "ลบผู้ใช้งานสำเร็จ" });
  });
});

// ==========================================
// 🏃‍♂️ ระบบ API จัดการกิจกรรม (ACTIVITY)
// ==========================================
app.get("/activities", (req, res) => {
  const sql = `SELECT a.*, u.Name AS Photographer FROM activity a LEFT JOIN users u ON a.User_id = u.User_id ORDER BY a.Activity_date DESC, a.Activity_id DESC`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/activities", (req, res) => {
  const body = req.body || {};
  const Name_activity = body.Name_activity || body.name_activity || body.Name || body.title || null;
  const Activity_date = parseDateForMySQL(body.Activity_date || body.activity_date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;
  const finalImage = body.Image || body.image || body.Images || body.images || null;

  if (!Name_activity) return res.status(400).json({ error: "กรุณาระบุชื่อกิจกรรม" });

  const sql = "INSERT INTO activity (Name_activity, Image, Activity_date, Location, User_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [Name_activity, finalImage, Activity_date, body.Location || body.location || null, User_id], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ error: "ตรวจสอบคีย์เชื่อมโยงผู้ใช้งาน", details: err.message }); }
    res.status(201).json({ message: "เพิ่มกิจกรรมสำเร็จ", Activity_id: result.insertId });
  });
});

app.put("/activities/:id", (req, res) => {
  const body = req.body || {};
  const Name_activity = body.Name_activity || body.name_activity || body.title || body.Name || null;
  const Activity_date = parseDateForMySQL(body.Activity_date || body.activity_date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;
  const finalImage = body.Image || body.image || body.Images || body.images || null;

  if (!Name_activity) return res.status(400).json({ error: "กรุณาระบุชื่อกิจกรรม" });

  const sql = "UPDATE activity SET Name_activity=?, Image=?, Activity_date=?, Location=?, User_id=? WHERE Activity_id=?";
  db.query(sql, [Name_activity, finalImage, Activity_date, body.Location || body.location || null, User_id, req.params.id], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ error: "ไม่สามารถอัปเดตกิจกรรมได้เนื่องจากคีย์ล็อกอินขัดแย้ง", details: err.message }); }
    res.json({ success: true, message: "แก้ไขกิจกรรมสำเร็จ" });
  });
});

app.delete("/activities/:id", (req, res) => {
  db.query("DELETE FROM activity WHERE Activity_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "ลบกิจกรรมสำเร็จ" });
  });
});

// ==========================================
// 🚀 เพิ่ม API สำหรับดึงรายชื่อผู้ปกครองไปใช้ทำ Autocomplete
// ==========================================
// 🔄 API ดึงรายชื่อผู้ปกครองเฉพาะที่มี Role เป็น 'ผู้ปกครอง'
app.get('/api/parents', (req, res) => {
  const sql = "SELECT User_id, Name, Role FROM users WHERE Role = 'ผู้ปกครอง'";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching parents:", err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// ==========================================
// 🚀 ระบบ API จัดการข้อมูลนักเรียน (STUDENTS CRUD) 
// ==========================================
app.get("/api/students", (req, res) => {
  const userId = req.query.id || req.query.userId;
  if (userId === "all" || !userId || userId === "undefined" || userId === "null") {
    db.query("SELECT * FROM student ORDER BY Student_id DESC", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  } else {
    const sql = "SELECT * FROM student WHERE User_id = ? ORDER BY Student_id DESC";
    db.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  }
});

// ➕ เพิ่มนักเรียนใหม่ (ป้องกันการเซฟค่า default ค้าง)
app.post("/api/students", (req, res) => {
  const body = req.body || {};
  const { Name, Class_level, Blood_group, Image } = body;
  const Birthday = parseDateForMySQL(body.Birthday || body.birthday);
  const Gender = body.Gender || body.gender || null;

  // แปลงค่า User_id ให้เป็น integer หรือ null อย่างเด็ดขาด
  const rawUserId = body.User_id !== undefined ? body.User_id : body.user_id;
  const User_id = (rawUserId && rawUserId !== 'null' && rawUserId !== 'undefined') ? parseInt(rawUserId, 10) : null;

  const sql = `INSERT INTO student (Name, Birthday, Gender, Class_level, User_id, Blood_group, Image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [Name, Birthday, Gender, Class_level, User_id, Blood_group, Image || null], (err, result) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียน", details: err.message });
    }
    res.json({ message: "เพิ่มข้อมูลนักเรียนสำเร็จ", Student_id: result.insertId });
  });
});

// ✏️ แก้ไขข้อมูลนักเรียน
app.put("/api/students/:id", (req, res) => {
  const studentId = req.params.id;
  const body = req.body || {};
  const { Name, Class_level, Blood_group, Image } = body;
  const Birthday = parseDateForMySQL(body.Birthday || body.birthday);
  const Gender = body.Gender || body.gender || null;

  // แปลงค่า User_id ให้เป็น integer หรือ null อย่างเด็ดขาด
  const rawUserId = body.User_id !== undefined ? body.User_id : body.user_id;
  const User_id = (rawUserId && rawUserId !== 'null' && rawUserId !== 'undefined') ? parseInt(rawUserId, 10) : null;

  const sql = `UPDATE student SET Name=?, Birthday=?, Gender=?, Class_level=?, User_id=?, Blood_group=?, Image=? WHERE Student_id=?`;
  db.query(sql, [Name, Birthday, Gender, Class_level, User_id, Blood_group, Image || null, studentId], (err, result) => {
    if (err) {
      console.error("Update Error:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลนักเรียน", details: err.message });
    }
    res.json({ message: "แก้ไขข้อมูลนักเรียนสำเร็จ" });
  });
});

app.delete("/api/students/:id", (req, res) => {
  db.query("DELETE FROM student WHERE Student_id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "ลบข้อมูลนักเรียนสำเร็จ" });
  });
});

// ==========================================
// 📌 1. เพิ่มข้อมูลการบ้านใหม่ + ส่งอีเมล (POST)
// ==========================================
app.post("/notifications", (req, res) => {
  const body = req.body || {};
  const { Class_level, Subject, Details } = body;
  const cleanDeadline = parseDateForMySQL(body.Deadline || body.deadline);
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;

  const sql = "INSERT INTO notification (User_id, Class_level, Subject, Deadline, `Date`, Details) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(sql, [User_id, Class_level, Subject, cleanDeadline, cleanDate, Details || null], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "ล้มเหลว ตรวจสอบคีย์เชื่อมโยง", details: err.message });
    }

    res.status(201).json({ message: "เพิ่มข้อมูลแจ้งเตือนสำเร็จ", id: result.insertId });

    const targetClassClean = String(Class_level || "").replace(/\s+/g, "").toLowerCase();

    const findEmailsSql = `
      SELECT Email 
      FROM users 
      WHERE Role = 'ผู้ปกครอง' 
        AND Email IS NOT NULL 
        AND Email != '' 
        AND LOWER(REPLACE(Class_level, ' ', '')) = ?
    `;

    db.query(findEmailsSql, [targetClassClean], (emailErr, parentRows) => {
      if (emailErr) {
        console.error("เกิดข้อผิดพลาดในการดึงอีเมลผู้ปกครอง:", emailErr);
        return;
      }

      if (parentRows && parentRows.length > 0) {
        const rawEmails = parentRows.map(row => String(row.Email).trim());
        const uniqueEmails = [...new Set(rawEmails)];
        const emailList = uniqueEmails.join(",");

        console.log(`📧 พบอีเมลผู้ปกครองชั้น ${Class_level} ทั้งหมด ${uniqueEmails.length} ท่าน:`, emailList);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'anchanaarthan@gmail.com',
            pass: 'liaknnlnlogqazqj'
          }
        });

        const mailOptions = {
          from: '"ระบบแจ้งเตือนการบ้าน โรงเรียนสาธิตฯ" <anchanaarthan@gmail.com>',
          to: 'anchanaarthan@gmail.com',
          bcc: emailList,
          subject: `🔔 แจ้งเตือนการบ้านใหม่วิชา ${Subject} (${Class_level})`,
          html: `
            <div style="font-family: 'Kanit', sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">เรียน ผู้ปกครองนักเรียนชั้น ${Class_level}</h2>
              <p style="font-size: 16px;">ขณะนี้ระบบได้ทำการเพิ่มการแจ้งเตือนการบ้านใหม่ มีรายละเอียดดังนี้ครับ:</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><b>📚 วิชา:</b> ${Subject}</p>
                <p style="margin: 5px 0;"><b>📝 รายละเอียดงาน:</b> ${Details || "— ไม่มีรายละเอียดเพิ่มเติม —"}</p>
                <p style="margin: 5px 0; color: #be123c;"><b>📅 กำหนดส่งงาน:</b> ${cleanDeadline || "-"}</p>
              </div>
              <p style="font-size: 12px; color: #888888; text-align: center; margin-top: 30px;">
                * อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบบันทึกกิจกรรมนักเรียนระดับปฐมวัย กรุณาอย่าตอบกลับอีเมลนี้
              </p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (mailSendErr, info) => {
          if (mailSendErr) {
            console.error("❌ ส่งอีเมลล้มเหลว:", mailSendErr);
          } else {
            console.log("✅ ส่งเมลแจ้งเตือนการบ้านให้ผู้ปกครองทุกคนสำเร็จแล้ว!: " + info.response);
          }
        });
      } else {
        console.log(`⚠️ ไม่พบรายชื่อผู้ปกครองที่มีอีเมลในระดับชั้น ${Class_level}`);
      }
    });
  });
});

app.get("/notifications", (req, res) => {
  const sql = "SELECT * FROM notification ORDER BY Notification_id DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.put("/notifications/:id", (req, res) => {
  const body = req.body || {};
  const { Class_level, Subject, Details } = body;
  const cleanDeadline = parseDateForMySQL(body.Deadline || body.deadline);
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;

  const sql = "UPDATE notification SET User_id = ?, Class_level = ?, Subject = ?, Deadline = ?, `Date` = ?, Details = ? WHERE Notification_id = ?";
  db.query(sql, [User_id, Class_level, Subject, cleanDeadline, cleanDate, Details || null, req.params.id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "แก้ไขข้อมูลแจ้งเตือนสำเร็จ" });
  });
});

app.delete("/notifications/:id", (req, res) => {
  const sql = "DELETE FROM notification WHERE Notification_id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการลบข้อมูล:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "ลบข้อมูลแจ้งเตือนสำเร็จ" });
  });
});

// =================================================================
// 📢 API ระบบข่าวสารประชาสัมพันธ์ (Public Relations)
// =================================================================
app.get('/api/publicrelations', (req, res) => {
  const sql = `
    SELECT pr.*, u.Name AS CreatedBy_Name 
    FROM publicrelation pr
    LEFT JOIN users u ON pr.User_id = u.User_id
    ORDER BY pr.PublicRelation_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) { console.error("Database error (GET PR):", err); return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลประชาสัมพันธ์" }); }
    res.json(results);
  });
});

app.post('/api/publicrelations', (req, res) => {
  const body = req.body || {};
  const Name_activity = body.Name || body.Name_activity || null;
  const cleanDate = body.date || body.Date || new Date().toISOString().split('T')[0];
  const Location = body.Location || null;
  const Detail = body.Detail || null;
  const User_id = parseInt(body.User_id || body.user_id, 10) || 1;
  const Image = body.Image || null;

  const sql = "INSERT INTO publicrelation (Name_activity, Date, Location, Detail, User_id, Image) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [Name_activity, cleanDate, Location, Detail, User_id, Image];

  db.query(sql, values, (err, result) => {
    if (err) { console.error("Database error (POST PR):", err); return res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลประชาสัมพันธ์ได้", details: err.message }); }
    res.status(201).json({ message: "เพิ่มประชาสัมพันธ์สำเร็จ", id: result.insertId });
  });
});

app.put('/api/publicrelations/:id', (req, res) => {
  const prId = req.params.id;
  const body = req.body || {};
  const Name_activity = body.Name || body.Name_activity || null;
  const cleanDate = body.date || body.Date || new Date().toISOString().split('T')[0];
  const Location = body.Location || null;
  const Detail = body.Detail || null;
  const User_id = parseInt(body.User_id || body.user_id, 10) || 1;
  const Image = body.Image || null;

  const sql = "UPDATE publicrelation SET Name_activity = ?, Date = ?, Location = ?, Detail = ?, User_id = ?, Image = ? WHERE PublicRelation_id = ?";
  const values = [Name_activity, cleanDate, Location, Detail, User_id, Image, prId];

  db.query(sql, values, (err, result) => {
    if (err) { console.error("Database error (PUT PR):", err); return res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลประชาสัมพันธ์ได้", details: err.message }); }
    res.json({ message: "แก้ไขข้อมูลประชาสัมพันธ์สำเร็จ" });
  });
});

app.delete('/api/publicrelations/:id', (req, res) => {
  const prId = req.params.id;
  const sql = "DELETE FROM publicrelation WHERE PublicRelation_id = ?";
  db.query(sql, [prId], (err, result) => {
    if (err) { console.error("Database error (DELETE PR):", err); return res.status(500).json({ error: "ไม่สามารถลบข้อมูลประชาสัมพันธ์ได้" }); }
    res.json({ message: "ลบข้อมูลประชาสัมพันธ์เรียบร้อยแล้ว" });
  });
});
app.get("/api/publicrelations", (req, res) => {
  const sql = `SELECT PublicRelation_id, Name_activity, DATE_FORMAT(Date, '%Y-%m-%d') AS Date, Location, Detail, User_id, Image FROM publicrelations ORDER BY PublicRelation_id DESC`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ==========================================
// 📅 ระบบ API จัดการปฏิทินกิจกรรม (CALENDAR)
// ==========================================

// 1. ดึงข้อมูลปฏิทินทั้งหมด
app.get("/api/calendar", (req, res) => {
  db.query(
    `SELECT Calendar_id, PublicRelation_id, Name, DATE_FORMAT(Date, '%Y-%m-%d') AS Date, Time, Location, User_id FROM calendar ORDER BY Date ASC`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

// 2. เพิ่มกิจกรรมใหม่ลงปฏิทิน
app.post("/api/calendar", (req, res) => {
  const body = req.body || {};
  const Name = body.Name || body.name || null;
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const Time = body.Time || body.time || null;
  const Location = body.Location || body.location || null;
  const finalUserId = parseInt(body.User_id || body.user_id, 10) || 2;
  const prId = body.PublicRelation_id || body.prId || null;

  db.query(
    "INSERT INTO calendar (Name, Date, Time, Location, User_id, PublicRelation_id) VALUES (?, ?, ?, ?, ?, ?)",
    [Name, cleanDate, Time, Location, finalUserId, prId],
    (err, result) => {
      if (err) {
        console.error("❌ ล้มเหลวในการเพิ่มปฏิทิน:", err.message);
        return res.status(500).json(err);
      }
      res.json({ message: "เพิ่มกิจกรรมลงปฏิทินสำเร็จ", Calendar_id: result.insertId });
    }
  );
});

// 3. แก้ไขกิจกรรมด้วย Calendar_id
app.put("/api/calendar/:id", (req, res) => {
  const body = req.body || {};
  const Name = body.Name || body.name || null;
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const Time = body.Time || body.time || null;
  const Location = body.Location || body.location || null;
  const finalUserId = parseInt(body.User_id || body.user_id, 10) || 2;

  db.query(
    "UPDATE calendar SET Name=?, Date=?, Time=?, Location=?, User_id=? WHERE Calendar_id=?",
    [Name, cleanDate, Time, Location, finalUserId, req.params.id],
    (err, result) => {
      if (err) {
        console.error("❌ ล้มเหลวในการแก้ไขปฏิทิน:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "แก้ไขข้อมูลปฏิทินสำเร็จ" });
    }
  );
});

// 4. แก้ไขกิจกรรมในปฏิทินอ้างอิงจาก PublicRelation_id
app.put("/api/calendar/pr/:prId", (req, res) => {
  const { prId } = req.params;
  const body = req.body || {};
  const Name = body.Name || body.name || null;
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const Location = body.Location || body.location || null;

  const sql = `UPDATE calendar SET Name = ?, Date = ?, Location = ? WHERE PublicRelation_id = ?`;

  db.query(sql, [Name, cleanDate, Location, prId], (err, result) => {
    if (err) {
      console.error("❌ ล้มเหลวในการอัปเดตปฏิทินจาก PR:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "อัปเดตข้อมูลปฏิทินเรียบร้อยแล้ว", affectedRows: result.affectedRows });
  });
});

// 5. ลบกิจกรรมในปฏิทินอ้างอิงจาก PublicRelation_id
app.delete("/api/calendar/pr/:prId", (req, res) => {
  const { prId } = req.params;
  const sql = `DELETE FROM calendar WHERE PublicRelation_id = ?`;

  db.query(sql, [prId], (err, result) => {
    if (err) {
      console.error("❌ ล้มเหลวในการลบปฏิทินจาก PR:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "ลบกิจกรรมในปฏิทินเรียบร้อยแล้ว" });
  });
});

// ==========================================
// 📝 ระบบ API เช็คชื่อการเข้าร่วมกิจกรรม
// ==========================================

// 🟢 ดึงรายชื่อนักเรียนสำหรับเช็คชื่อ (แก้ไขการซ้ำซ้อนและรองรับการค้นหาผ่าน ID / Class_level)
app.get("/attendance/students", (req, res) => {
  const { activity, class: classId } = req.query;

  // 🟢 SQL แก้ไขพิเศษ: ใช้ REPLACE() ลบช่องว่างออกทั้งหมด ป้องกันปัญหาคำว่า "อนุบาล1 ห้องปกติ" กับ "อนุบาล1ห้องปกติ"
  const sql = `
    SELECT 
      s.Student_id AS id, 
      s.Name AS name, 
      IF(pa.Student_id IS NOT NULL, 1, 0) AS attended
    FROM student s
    LEFT JOIN participating_activities pa 
      ON s.Student_id = pa.Student_id AND pa.Activity_id = ?
    WHERE 
      LOWER(REPLACE(s.Class_level, ' ', '')) = LOWER(REPLACE(?, ' ', ''))
      OR LOWER(REPLACE(s.Class_level, ' ', '')) = (
        SELECT LOWER(REPLACE(Class_level, ' ', '')) FROM users WHERE User_id = ?
      )
      OR s.User_id = ?
    ORDER BY s.Student_id ASC
  `;

  db.query(sql, [activity, classId, classId, classId], (err, result) => {
    if (err) {
      console.error("SQL Attendance Error:", err);
      return res.status(500).json(err);
    }

    const formattedResult = result.map(row => ({
      id: row.id,
      name: row.name,
      attended: row.attended === 1
    }));

    res.json(formattedResult);
  });
});

// 🟢 ดึงรายการกิจกรรมทั้งหมด
app.get("/attendance/activities", (req, res) => {
  db.query("SELECT Activity_id AS id, Name_activity AS name FROM activity ORDER BY Activity_id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 ดึงรายการระดับชั้นเรียนทั้งหมด
app.get("/attendance/classes", (req, res) => {
  db.query("SELECT DISTINCT Class_level AS id, Class_level AS name FROM student WHERE Class_level IS NOT NULL AND Class_level != '' ORDER BY Class_level ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// 🟢 บันทึกข้อมูลการเข้าร่วมกิจกรรม
app.post("/attendance/save", (req, res) => {
  const { activity_id, attendance_list } = req.body;
  if (!activity_id || !attendance_list || !Array.isArray(attendance_list)) {
    return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
  }

  const studentIds = attendance_list.map(s => s.student_id);
  if (studentIds.length === 0) return res.json({ message: "ไม่มีข้อมูลนักเรียน" });

  db.query("DELETE FROM participating_activities WHERE Activity_id = ? AND Student_id IN (?)", [activity_id, studentIds], (err, deleteResult) => {
    if (err) return res.status(500).json(err);

    const attendingStudents = attendance_list.filter(s => s.attended === true);
    if (attendingStudents.length === 0) return res.json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });

    const values = attendingStudents.map(s => [s.student_id, activity_id]);
    db.query("INSERT INTO participating_activities (Student_id, Activity_id) VALUES ?", [values], (err, insertResult) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "บันทึกการเข้าร่วมกิจกรรมสำเร็จเรียบร้อยแล้ว" });
    });
  });
});

// 🟢 ดึงประวัติการเข้าร่วมกิจกรรมของนักเรียน (สำหรับหน้าผู้ปกครอง)
app.get("/api/parent/activities/:parentId", (req, res) => {
  const { parentId } = req.params;

  const sql = `
    SELECT 
      a.Activity_id,
      a.Name_activity,
      DATE_FORMAT(a.Activity_date, '%Y-%m-%d') AS Activity_date,
      a.Location,
      s.Name AS Student_name,
      s.Class_level,
      IF(pa.Student_id IS NOT NULL, 1, 0) AS attended
    FROM student s
    JOIN activity a
    LEFT JOIN participating_activities pa 
      ON pa.Student_id = s.Student_id AND pa.Activity_id = a.Activity_id
    WHERE s.User_id = ?
    ORDER BY a.Activity_date DESC, a.Activity_id DESC
  `;

  db.query(sql, [parentId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching parent activities:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรมของผู้ปกครอง" });
    }
    res.json(results);
  });
});

// ==========================================
// 🧑‍🎓 API พัฒนาการนักเรียน (Development API)
// ==========================================

// 1. ดึงข้อมูลนักเรียนตามระดับชั้น
app.get('/api/student', (req, res) => {
  const { class_level } = req.query;
  if (!class_level) {
    return res.status(400).json({ message: "กรุณาระบุ class_level ของคุณครู" });
  }
  const sql = "SELECT * FROM student WHERE class_level = ?";
  db.query(sql, [class_level], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 2. ดึงประวัติพัฒนาการทั้งหมดในระดับชั้น
app.get('/api/development', (req, res) => {
  const { class_level } = req.query;
  if (!class_level) {
    return res.status(400).json({ message: "กรุณาระบุ class_level ของคุณครู" });
  }
  const sql = `
    SELECT d.*, s.Name as Student_name, s.class_level,
           DATE_FORMAT(d.date, '%Y-%m-%d') as date_clean
    FROM development d
    JOIN student s ON d.Student_id = s.Student_id
    WHERE s.class_level = ?
    ORDER BY d.date DESC, d.Development_id DESC
  `;
  db.query(sql, [class_level], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 3. ดึงประวัติพัฒนาการของนักเรียนเฉพาะคน
app.get('/api/development/student', (req, res) => {
  console.log("👉 Query ที่ได้รับ:", req.query);
  const studentId = req.query.student_id || req.query.studentId || req.query.Student_id;
  if (!studentId) {
    return res.status(400).json({ error: "กรุณาระบุรหัสนักเรียน (student_id)" });
  }
  const sql = `SELECT * FROM development WHERE Student_id = ? ORDER BY Year DESC, Term DESC`;
  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 4. บันทึกข้อมูลพัฒนาการใหม่
app.post('/api/development', (req, res) => {
  const {
    Student_id, Year, Term, date, Physical, Weight, Height,
    Dental_health, Vaccination, Motor_skills, Emotional, Emotion, Emotion_control,
    Confidence, Social, Stress, Interaction, Assistance, Intellectual,
    Problem_solving, Communication, Remembering
  } = req.body;

  if (!Student_id) {
    return res.status(400).json({ error: "กรุณาระบุรหัสนักเรียน (Student_id)" });
  }

  const insertSql = `
    INSERT INTO development (
      Student_id, Year, Term, date, Physical, Weight, Height, 
      Dental_health, Vaccination, Motor_skills, Emotional, Emotion, 
      Emotion_control, Confidence, Social, Stress, Interaction, 
      Assistance, Intellectual, Problem_solving, Communication, Remembering
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Student_id, Year, Term, date, Physical, Weight, Height, Dental_health,
    Vaccination, Motor_skills, Emotional, Emotion, Emotion_control, Confidence,
    Social, Stress, Interaction, Assistance, Intellectual, Problem_solving,
    Communication, Remembering
  ];

  db.query(insertSql, values, (err, result) => {
    if (err) {
      console.error("Database error during POST:", err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "บันทึกการประเมินพัฒนาการเรียบร้อย", id: result.insertId });
  });
});

// 5. แก้ไขข้อมูลพัฒนาการ
app.put('/api/development/:id', (req, res) => {
  const devId = req.params.id;
  const {
    class_level, Student_id, Year, Term, date, Physical, Weight, Height,
    Dental_health, Vaccination, Motor_skills, Emotional, Emotion, Emotion_control,
    Confidence, Social, Stress, Interaction, Assistance, Intellectual,
    Problem_solving, Communication, Remembering
  } = req.body;

  const currentClassLevel = class_level || req.body.Class_level || req.query.class_level;
  if (!currentClassLevel) {
    return res.status(400).json({ message: "ไม่พบข้อมูลระดับชั้นเรียน (class_level) ในคำขอ" });
  }

  const verifySql = `
    SELECT d.Development_id FROM development d
    JOIN student s ON d.Student_id = s.Student_id
    WHERE d.Development_id = ? AND s.class_level = ?
  `;

  db.query(verifySql, [devId, currentClassLevel], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(403).json({ message: "⚠️ ปฏิเสธการเข้าถึง: คุณไม่มีสิทธิ์แก้ไขข้อมูลพัฒนาการของห้องเรียนอื่น" });
    }

    const updateSql = `
      UPDATE development SET 
        Student_id = ?, Year = ?, Term = ?, date = ?, Physical = ?, Weight = ?, Height = ?, 
        Dental_health = ?, Vaccination = ?, Motor_skills = ?, Emotional = ?, Emotion = ?, 
        Emotion_control = ?, Confidence = ?, Social = ?, Stress = ?, Interaction = ?, 
        Assistance = ?, Intellectual = ?, Problem_solving = ?, Communication = ?, Remembering = ?
      WHERE Development_id = ?
    `;

    const values = [
      Student_id, Year, Term, date, Physical, Weight, Height, Dental_health,
      Vaccination, Motor_skills, Emotional, Emotion, Emotion_control, Confidence,
      Social, Stress, Interaction, Assistance, Intellectual, Problem_solving,
      Communication, Remembering, devId
    ];

    db.query(updateSql, values, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "แก้ไขข้อมูลพัฒนาการสำเร็จ" });
    });
  });
});

// 6. ลบข้อมูลพัฒนาการ (ปรับปรุงการรับค่า class_level ให้ยืดหยุ่นขึ้น)
app.delete('/api/development/:id', (req, res) => {
  const devId = req.params.id;
  const class_level = req.query.class_level || req.body.class_level || req.body.Class_level;

  if (!class_level) {
    return res.status(400).json({ message: "กรุณาระบุ class_level เพื่อตรวจสอบสิทธิ์การลบ" });
  }

  const verifySql = `
    SELECT d.Development_id FROM development d
    JOIN student s ON d.Student_id = s.Student_id
    WHERE d.Development_id = ? AND s.class_level = ?
  `;

  db.query(verifySql, [devId, class_level], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(403).json({ message: "⚠️ ปฏิเสธการเข้าถึง: คุณไม่มีสิทธิ์ลบข้อมูลพัฒนาการของห้องเรียนอื่น" });
    }

    const deleteSql = "DELETE FROM development WHERE Development_id = ?";
    db.query(deleteSql, [devId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "ลบข้อมูลการประเมินพัฒนาการเรียบร้อย" });
    });
  });
});

// ==========================================
// 🔐 ระบบตรวจสอบการเข้าสู่ระบบ (LOGIN / REGISTER API)
// ==========================================
app.post("/login", (req, res) => {
  const username = req.body.UserName || req.body.username;
  const password = req.body.Password || req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "กรุณากรอกข้อมูลให้ครบ"
    });
  }

  db.query(
    "SELECT * FROM users WHERE UserName = ? AND Password = ?",
    [username, password],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "ฐานข้อมูลมีปัญหา"
        });
      }

      if (result.length === 0) {
        return res.status(401).json({
          success: false,
          error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
        });
      }

      let user = result[0];
      const currentStatus = String(user.Status || "").trim();
      const currentRole = String(user.Role || "").trim();

      if (currentRole === "ถูกระงับสิทธิ์" && currentStatus === "ใช้งาน") {
        db.query(
          "UPDATE users SET Role = 'ผู้ใช้งานเก่า (รอระบุสิทธิ์)', Status = 'ถูกระงับสิทธิ์' WHERE User_id = ?",
          [user.User_id]
        );
        user.Role = "ผู้ใช้งานเก่า (รอระบุสิทธิ์)";
        user.Status = "ถูกระงับสิทธิ์";
      }
      if (user.Status === "รออนุมัติ") {
        return res.json({
          success: false,
          blocked: true,
          error: "บัญชีของคุณกำลังอยู่ระหว่างรอแอดมินอนุมัติสิทธิ์"
        });
      }

      if (
        user.Status === "ระงับ" ||
        user.Status === "ถูกระงับ" ||
        user.Status === "ถูกระงับสิทธิ์" ||
        user.Status == 0 ||
        String(user.Role).trim() === "ถูกระงับสิทธิ์"
      ) {
        return res.json({
          success: false,
          blocked: true,
          error: "บัญชีของคุณถูกระงับสิทธิ์การใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
        });
      }

      return res.json({
        success: true,
        message: "สำเร็จ",
        user: {
          id: user.User_id,
          User_id: user.User_id,
          username: user.UserName,
          UserName: user.UserName,
          name: user.Name,
          Name: user.Name,
          email: user.Email,
          Email: user.Email,
          role: user.Role,
          Role: user.Role,
          status: user.Status,
          Status: user.Status,
          Class_level: user.Class_level,
        }
      });
    }
  );
});

app.post('/api/register', (req, res) => {
  const Name = req.body.Name || req.body.name;
  const Phone = req.body.Phone || req.body.phone;
  const Email = req.body.Email || req.body.email || null;
  const UserName = req.body.UserName || req.body.Username || req.body.username;
  const Role = req.body.Role || req.body.role;
  const Class_level = req.body.Class_level || req.body.class_level;
  const Password = req.body.Password || req.body.password;
  const ConfirmPassword = req.body.ConfirmPassword || req.body.confirmpassword;

  if (Password !== ConfirmPassword) {
    return res.status(400).json({ message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน!' });
  }

  const checkUserQuery = 'SELECT UserName FROM users WHERE UserName = ?';
  db.query(checkUserQuery, [UserName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' });
    }

    const insertQuery = 'INSERT INTO users (Name, Phone, Email, Password, UserName, Role, Class_level, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    // 🟢 เปลี่ยนค่าสุดท้ายจาก "ใช้งาน" เป็น "รออนุมัติ"
    db.query(
      insertQuery,
      [Name, Phone, Email, Password, UserName, Role, Class_level, "รออนุมัติ"],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: 'ลงทะเบียนเรียบร้อยแล้ว รอการอนุมัติสิทธิ์จากผู้ดูแลระบบ' });
      }
    );
  });
});

// ==========================================
// 🎓 1. API ระบบปีการศึกษา (Academic Years)
// ==========================================
// สำหรับดึงรายการปีการศึกษาทั้งหมดไปแสดงใน Dropdown ให้ครูเลือก
app.get("/api/academic-years", (req, res) => {
  const sql = "SELECT * FROM academic_years ORDER BY year_name DESC";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูลปีการศึกษา:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ==========================================
// 📈 2. API อัปเดตชั้นเรียนและบันทึกประวัติ (Promote Class)
// ==========================================
app.post("/api/students/promote", (req, res) => {
  // รับค่ามาจากหน้าบ้าน (React)
  const { Student_id, year_id, new_class_level } = req.body;

  if (!Student_id || !year_id || !new_class_level) {
    return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน กรุณาส่ง Student_id, year_id และ new_class_level" });
  }

  // Step 1: อัปเดตชั้นเรียนปัจจุบันในตาราง student หลัก
  const updateSql = "UPDATE student SET Class_level = ? WHERE Student_id = ?";
  db.query(updateSql, [new_class_level, Student_id], (err, updateResult) => {
    if (err) {
      console.error("Error updating student class:", err);
      return res.status(500).json({ error: "อัปเดตตารางนักเรียนล้มเหลว", details: err.message });
    }

    // Step 2: บันทึกประวัติลงตาราง student_class_history ที่เราเพิ่งสร้าง
    const historySql = "INSERT INTO student_class_history (Student_id, year_id, class_level) VALUES (?, ?, ?)";
    db.query(historySql, [Student_id, year_id, new_class_level], (err, historyResult) => {
      if (err) {
        console.error("Error inserting student history:", err);
        return res.status(500).json({ error: "บันทึกประวัติล้มเหลว", details: err.message });
      }
      
      res.status(200).json({ success: true, message: "อัปเดตชั้นเรียนและบันทึกประวัติเรียบร้อยแล้ว!" });
    });
  });
});

app.listen(3001, () => { console.log("🚀 Server running on port 3001"); });