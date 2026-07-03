const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
function parseDateForMySQL(dateStr) {
  if (!dateStr || dateStr === "") return null;
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      } else if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
    }
  }
  return dateStr;
}

// ==========================================
// 👤 ระบบ API จัดการข้อมูลผู้ใช้งาน (USERS)
// ==========================================
app.get(["/users", "/api/users"], (req, res) => {
  const sql = "SELECT User_id, Name, Phone, UserName, Password, Role FROM users ORDER BY User_id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

app.get("/users/teachers", (req, res) => {
  const sql = "SELECT User_id, Name, UserName FROM users WHERE Role = 'ครูผู้สอน'";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
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
  const { Name, Phone, UserName, Role, Password } = req.body;
  let sql = (Password && Password.trim() !== "")
    ? `UPDATE users SET Name=?, Phone=?, UserName=?, Role=?, Password=? WHERE User_id=?`
    : `UPDATE users SET Name=?, Phone=?, UserName=?, Role=? WHERE User_id=?`;
  let params = (Password && Password.trim() !== "") ? [Name, Phone, UserName, Role, Password, req.params.id] : [Name, Phone, UserName, Role, req.params.id];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
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
// 🏃‍♂️ ระบบ API จัดการกิจกรรม (ACTIVITY) - แก้ไขบั๊กเพื่อรองรับหลายรูปภาพ (JSON String)
// ==========================================
app.get("/activities", (req, res) => {
  const sql = `SELECT a.*, u.Name AS Photographer FROM activity a LEFT JOIN users u ON a.User_id = u.User_id ORDER BY a.Activity_date DESC, a.Activity_id DESC`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// แก้ไข POST สำหรับเก็บข้อมูลหลายรูปภาพที่ถูกห่อหุ้มมาเป็น String
app.post("/activities", (req, res) => {
  const body = req.body || {};
  const Name_activity = body.Name_activity || body.name_activity || body.Name || body.title || null;
  const Activity_date = parseDateForMySQL(body.Activity_date || body.activity_date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;

  // ตรวจจับตัวแปร Image หรือ Images ที่หน้าบ้านส่งมา
  const finalImage = body.Image || body.image || body.Images || body.images || null;

  if (!Name_activity) return res.status(400).json({ error: "กรุณาระบุชื่อกิจกรรม" });

  const sql = "INSERT INTO activity (Name_activity, Image, Activity_date, Location, User_id) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [Name_activity, finalImage, Activity_date, body.Location || body.location || null, User_id], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ error: "ตรวจสอบคีย์เชื่อมโยงผู้ใช้งาน", details: err.message }); }
    res.status(201).json({ message: "เพิ่มกิจกรรมสำเร็จ", Activity_id: result.insertId });
  });
});

// แก้ไข PUT สำหรับอัปเดตกิจกรรมเมื่อมีการบันทึกรูปภาพใหม่หลายรูปภาพ
app.put("/activities/:id", (req, res) => {
  const body = req.body || {};
  const Name_activity = body.Name_activity || body.name_activity || body.title || body.Name || null;
  const Activity_date = parseDateForMySQL(body.Activity_date || body.activity_date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;

  // ตรวจจับตัวแปร Image หรือ Images สำหรับขั้นตอนการแก้ไข
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
// 🚀 ระบบ API จัดการข้อมูลนักเรียน (STUDENTS CRUD)
// ==========================================
app.get("/api/students", (req, res) => {
  const userId = req.query.id || req.query.userId;

  console.log("== [BACKEND API] ได้รับค่าขอรหัสผู้ใช้ ID == :", userId);

  // 👑 ปรับปรุง: ถ้าค่าเป็น "all" หรือหน้าหลักลืมส่งค่ามา (undefined / null) 
  // ให้ดึงข้อมูลนักเรียนทุกคนทันที หน้าจอหลักจะได้ไม่ขึ้น 0 คน
  if (userId === "all" || !userId || userId === "undefined" || userId === "null") {
    console.log("-> ระบบทำการดึงข้อมูลนักเรียนทั้งหมด (สิทธิ์คุณครู/ค่าเริ่มต้น)");
    db.query("SELECT * FROM student ORDER BY Student_id DESC", (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  }
  // 👨‍👩‍👦 ถ้ามี ID ส่งเข้ามาปกติ และไม่ใช่ค่าว่าง (สิทธิ์ผู้ปกครอง) ให้กรองเฉพาะลูกตัวเอง
  else {
    console.log(`-> ระบบทำการกรองข้อมูลนักเรียนเฉพาะ User_id: ${userId}`);
    const sql = "SELECT * FROM student WHERE User_id = ? ORDER BY Student_id DESC";
    db.query(sql, [userId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  }
});

app.post("/api/students", (req, res) => {
  const body = req.body || {};
  const { Name, Class_level, Blood_group, Image } = body;
  const Birthday = parseDateForMySQL(body.Birthday || body.birthday);
  const Gender = body.Gender || body.gender || null;
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;

  const sql = `INSERT INTO student (Name, Birthday, Gender, Class_level, User_id, Blood_group, Image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [Name, Birthday, Gender, Class_level, User_id, Blood_group, Image || null], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียน", details: err.message });
    }
    res.json({ message: "เพิ่มข้อมูลนักเรียนสำเร็จ", Student_id: result.insertId });
  });
});

app.put("/api/students/:id", (req, res) => {
  const body = req.body || {};
  const { Name, Class_level, Blood_group, Image } = body;
  const Birthday = parseDateForMySQL(body.Birthday || body.birthday);
  const Gender = body.Gender || body.gender || null;

  const sql = `UPDATE student SET Name=?, Birthday=?, Gender=?, Class_level=?, Blood_group=?, Image=? WHERE Student_id=?`;
  db.query(sql, [Name, Birthday, Gender, Class_level, Blood_group, Image || null, req.params.id], (err, result) => {
    if (err) {
      console.error(err);
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
// 📢 ระบบ API จัดการข้อมูลการแจ้งเตือน (NOTIFICATIONS)
// ==========================================
app.get("/notifications", (req, res) => {
  // 🟢 แก้ไขคำสั่ง SQL ตรงนี้เพื่อเพิ่มเงื่อนไขการกรองวันที่
  const sql = `
    SELECT 
      Notification_id, User_id, Class_level, Subject, 
      DATE_FORMAT(Deadline, '%Y-%m-%d') AS Deadline, 
      DATE_FORMAT(\`Date\`, '%Y-%m-%d') AS Date, 
      Details 
    FROM notification 
    WHERE Deadline >= CURDATE()
    ORDER BY Notification_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post("/notifications", (req, res) => {
  const body = req.body || {};
  const { Class_level, Subject, Details } = body;
  const cleanDeadline = parseDateForMySQL(body.Deadline || body.deadline);
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;

  const sql = "INSERT INTO notification (User_id, Class_level, Subject, Deadline, \`Date\`, Details) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [User_id, Class_level, Subject, cleanDeadline, cleanDate, Details || null], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ error: "ล้มเหลว ตรวจสอบคีย์เชื่อมโยง", details: err.message }); }
    res.status(201).json({ message: "เพิ่มข้อมูลแจ้งเตือนสำเร็จ", id: result.insertId });
  });
});

app.put("/notifications/:id", (req, res) => {
  const body = req.body || {};
  const { Class_level, Subject, Details } = body;
  const cleanDeadline = parseDateForMySQL(body.Deadline || body.deadline);
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const User_id = parseInt(body.User_id || body.user_id, 10) || 2;

  const sql = "UPDATE notification SET User_id = ?, Class_level = ?, Subject = ?, Deadline = ?, \`Date\` = ?, Details = ? WHERE Notification_id = ?";
  db.query(sql, [User_id, Class_level, Subject, cleanDeadline, cleanDate, Details || null, req.params.id], (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ error: err.message }); }
    res.json({ message: "แก้ไขข้อมูลแจ้งเตือนสำเร็จ" });
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

// ==========================================
// 📅 ระบบ API จัดการปฏิทินกิจกรรม (CALENDAR)
// ==========================================
app.get("/api/calendar", (req, res) => {
  db.query(`SELECT Calendar_id, Name, DATE_FORMAT(Date, '%Y-%m-%d') AS Date, Time, Location, User_id FROM calendar ORDER BY Date ASC`, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/calendar", (req, res) => {
  const body = req.body || {};
  const Name = body.Name || body.name || null;
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const Time = body.Time || body.time || null;
  const Location = body.Location || body.location || null;
  const finalUserId = parseInt(body.User_id || body.user_id, 10) || 2;

  db.query("INSERT INTO calendar (Name, Date, Time, Location, User_id) VALUES (?, ?, ?, ?, ?)",
    [Name, cleanDate, Time, Location, finalUserId], (err, result) => {
      if (err) { console.error("❌ ล้มเหลวในการเพิ่มปฏิทิน:", err.message); return res.status(500).json(err); }
      res.json({ message: "เพิ่มกิจกรรมลงปฏิทินสำเร็จ", Calendar_id: result.insertId });
    });
});

app.put("/api/calendar/:id", (req, res) => {
  const body = req.body || {};
  const Name = body.Name || body.name || null;
  const cleanDate = parseDateForMySQL(body.Date || body.date);
  const Time = body.Time || body.time || null;
  const Location = body.Location || body.location || null;
  const finalUserId = parseInt(body.User_id || body.user_id, 10) || 2;

  db.query("UPDATE calendar SET Name=?, Date=?, Time=?, Location=?, User_id=? WHERE Calendar_id=?",
    [Name, cleanDate, Time, Location, finalUserId, req.params.id], (err, result) => {
      if (err) { console.error("❌ ล้มเหลวในการแก้ไขปฏิทิน:", err.message); return res.status(500).json({ error: err.message }); }
      res.json({ message: "แก้ไขข้อมูลปฏิทินสำเร็จ" });
    });
});

// ==========================================
// 📝 ระบบ API เช็คชื่อการเข้าร่วมกิจกรรม
// ==========================================
app.get("/attendance/activities", (req, res) => {
  db.query("SELECT Activity_id AS id, Name_activity AS name FROM activity ORDER BY Activity_id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/attendance/classes", (req, res) => {
  db.query("SELECT DISTINCT Class_level AS id, Class_level AS name FROM student WHERE Class_level IS NOT NULL AND Class_level != '' ORDER BY Class_level ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get("/attendance/students", (req, res) => {
  const { activity, class: classLevel } = req.query;
  const sql = `
        SELECT s.Student_id AS id, s.Name AS name, IF(p.Student_id IS NOT NULL, 1, 0) AS attended
        FROM student s LEFT JOIN participating_activities p ON s.Student_id = p.Student_id AND p.Activity_id = ?
        WHERE s.Class_level = ? ORDER BY s.Student_id ASC`;
  db.query(sql, [activity, classLevel], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result.map(row => ({ id: row.id, name: row.name, attended: row.attended === 1 })));
  });
});

app.post("/attendance/save", (req, res) => {
  const { activity_id, attendance_list } = req.body;
  if (!activity_id || !attendance_list || !Array.isArray(attendance_list)) return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
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



// ==========================================
// 🧑‍🎓 1. [GET] ดึงรายชื่อนักเรียนเฉพาะห้องเรียนของครู
// ==========================================
app.get('/api/student', (req, res) => {
  const { class_level } = req.query;

  if (!class_level) {
    return res.status(400).json({ message: "กรุณาระบุ class_level ของคุณครู" });
  }

  // 🛠️ จุดที่ 1: เปลี่ยนจาก students เป็น student
  const sql = "SELECT * FROM student WHERE class_level = ?";
  db.query(sql, [class_level], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ==========================================
// 📊 2. [GET] ดึงประวัติพัฒนาการทั้งหมดเฉพาะห้องเรียนของครู
// ==========================================
app.get('/api/development', (req, res) => {
  const { class_level } = req.query;

  if (!class_level) {
    return res.status(400).json({ message: "กรุณาระบุ class_level ของคุณครู" });
  }

  // 🛠️ จุดที่ 2: เปลี่ยนตรง JOIN จาก students s เป็น student s
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

// ==========================================
// ➕ 3. [POST] บันทึกข้อมูลพัฒนาการใหม่
// ==========================================
app.post('/api/development', (req, res) => {
  const {
    Student_id, Year, Term, date, Physical, Weight, Height, Dental_health,
    Vaccination, Motor_skills, Emotional, Emotion, Emotion_control, Confidence,
    Social, Stress, Interaction, Assistance, Intellectual, Problem_solving,
    Communication, Remembering
  } = req.body;

  const sql = `
    INSERT INTO development 
    (Student_id, Year, Term, date, Physical, Weight, Height, Dental_health, 
     Vaccination, Motor_skills, Emotional, Emotion, Emotion_control, Confidence, 
     Social, Stress, Interaction, Assistance, Intellectual, Problem_solving, 
     Communication, Remembering) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Student_id, Year, Term, date, Physical, Weight, Height, Dental_health,
    Vaccination, Motor_skills, Emotional, Emotion, Emotion_control, Confidence,
    Social, Stress, Interaction, Assistance, Intellectual, Problem_solving,
    Communication, Remembering
  ];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "บันทึกข้อมูลพัฒนาการสำเร็จ", insertId: result.insertId });
  });
});

// ==========================================
// 📝 4. [PUT] อัปเดต/แก้ไขข้อมูลพัฒนาการ (บล็อกข้ามห้องเรียน)
// ==========================================
app.put('/api/development/:id', (req, res) => {
  const devId = req.params.id;
  const {
    class_level, Student_id, Year, Term, date, Physical, Weight, Height,
    Dental_health, Vaccination, Motor_skills, Emotional, Emotion, Emotion_control,
    Confidence, Social, Stress, Interaction, Assistance, Intellectual,
    Problem_solving, Communication, Remembering
  } = req.body;

  // 🛠️ จุดที่ 3: เปลี่ยนตรง JOIN จาก students s เป็น student s เพื่อตรวจสอบสิทธิ์
  const verifySql = `
    SELECT d.Development_id FROM development d
    JOIN student s ON d.Student_id = s.Student_id
    WHERE d.Development_id = ? AND s.class_level = ?
  `;

  db.query(verifySql, [devId, class_level], (err, rows) => {
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

// ==========================================
// 🗑️ 5. [DELETE] ลบข้อมูลพัฒนาการ (บล็อกข้ามห้องเรียน)
// ==========================================
app.delete('/api/development/:id', (req, res) => {
  const devId = req.params.id;
  const { class_level } = req.query;

  if (!class_level) {
    return res.status(400).json({ message: "กรุณาระบุ class_level เพื่อตรวจสอบสิทธิ์การลบ" });
  }

  // 🛠️ จุดที่ 4: เปลี่ยนตรง JOIN จาก students s เป็น student s ก่อนสั่งลบ
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
// 🔐 ระบบตรวจสอบการเข้าสู่ระบบ (LOGIN API)
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

      // ==========================================
      // แก้ข้อมูลเก่าที่เคยบันทึก Role ผิดช่อง
      // ==========================================
      if (currentRole === "ถูกระงับสิทธิ์" && currentStatus === "ใช้งาน") {
        db.query(
          "UPDATE users SET Role = 'ผู้ใช้งานเก่า (รอระบุสิทธิ์)', Status = 'ถูกระงับสิทธิ์' WHERE User_id = ?",
          [user.User_id]
        );

        user.Role = "ผู้ใช้งานเก่า (รอระบุสิทธิ์)";
        user.Status = "ถูกระงับสิทธิ์";
      }

      // ==========================================
      // เช็กสถานะระงับ
      // ==========================================
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

      // ==========================================
      // Login สำเร็จ
      // ==========================================
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

          role: user.Role,
          Role: user.Role,

          status: user.Status,
          Status: user.Status,

          // ⭐ สำคัญมาก
          Class_level: user.Class_level,


        }
      });
    }
  );
});

// ========================================================
// 2. API สำหรับรับข้อมูลลงทะเบียน (เวอร์ชันหักดิบ บังคับค่าแก้ปัญหาหน้าบ้านส่งผิด)
// ========================================================
app.post('/api/register', (req, res) => {
  const { Name, Phone, UserName, Role, Class_level, Password, ConfirmPassword } = req.body;

  if (Password !== ConfirmPassword) {
    return res.status(400).json({ message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน!' });
  }

  const checkUserQuery = 'SELECT UserName FROM users WHERE UserName = ?';
  db.query(checkUserQuery, [UserName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' });
    }

    // 🚨 1. บังคับกำหนดสิทธิ์ใหม่ (ไม่ใช้ค่า Role ที่หน้าบ้านส่งมาเด็ดขาด!)
    let fixedRole = "ผู้ปกครอง"; // ตั้งค่า Default ปลอดภัยไว้ก่อน

    const lowerClass = String(Class_level || "").toLowerCase();

    // ถ้าหน้าบ้านส่ง Class_level มาเป็นค่าว่าง หรือ NULL แสดงว่าเป็น "ครูผู้สอน"
    if (!Class_level || lowerClass === "null" || lowerClass === "") {
      fixedRole = "ครูผู้สอน";
    } else {
      // แต่ถ้ามีข้อมูลชั้นเรียน (เช่น อ.1, อ.2, อ.3) ให้จัดเป็น "ผู้ปกครอง"
      fixedRole = "ผู้ปกครอง";
    }

    // 🚨 2. คำสั่ง SQL สั่งลงตำแหน่งคอลัมน์ให้ชัดเจน
    const insertQuery = 'INSERT INTO users (Name, Phone, Password, UserName, Role, Class_level, Status) VALUES (?, ?, ?, ?, ?, ?, ?)';

    // 🚨 3. ส่งค่าเข้าตามลำดับเครื่องหมาย ?
    // - ? ตัวที่ 5 (ช่อง Role)   -> เราบังคับใส่ตัวแปร fixedRole (ที่สลัดคำว่าถูกระงับสิทธิ์ทิ้งไปแล้ว)
    // - ? ตัวที่ 7 (ช่อง Status) -> บังคับใส่ข้อความ "ถูกระงับสิทธิ์"
    db.query(
      insertQuery,
      [Name, Phone, Password, UserName, fixedRole, Class_level, "ถูกระงับสิทธิ์"],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.status(200).json({ message: 'ลงทะเบียนเรียบร้อยแล้ว!' });
      }
    );
  });
});

app.listen(3001, () => { console.log("🚀 Server running on port 3001"); });