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
function parseDateForMySQL(dateStr) {
  if (!dateStr) return null;

  if (typeof dateStr === 'string') {
    const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) {
      return match[0];
    }
  }

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
  // เปลี่ยน s.First_name, s.Last_name เป็น s.Name ให้ตรงกับตาราง student จริง
  const sql = `
    SELECT 
      u.User_id, u.Name, u.Phone, u.Email, u.Password, u.UserName, u.Role, u.Class_level, u.Status,
      COALESCE(GROUP_CONCAT(s.Student_code SEPARATOR ', '), u.Student_code) AS student_codes,
      GROUP_CONCAT(s.Name SEPARATOR ', ') AS student_names
    FROM users u
    LEFT JOIN student s ON u.User_id = s.User_id
    GROUP BY u.User_id
    ORDER BY u.User_id ASC
  `;
  
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
  const { id } = req.params;
  const body = req.body || {};

  // 1. ค้นหาข้อมูลเดิมจากฐานข้อมูลออกมาก่อน
  db.query("SELECT * FROM users WHERE User_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

    const currentUser = results[0];

    // 2. ถ้าหน้าบ้านส่งค่าใหม่มาให้ใช้ค่าใหม่ ถ้าไม่ได้ส่งมา (undefined) ให้คงใช้ค่าเดิมใน Database
    const Name = body.Name !== undefined ? body.Name : (body.name !== undefined ? body.name : currentUser.Name);
    const Phone = body.Phone !== undefined ? body.Phone : (body.phone !== undefined ? body.phone : currentUser.Phone);
    const Email = body.Email !== undefined ? body.Email : (body.email !== undefined ? body.email : currentUser.Email);
    const UserName = body.UserName !== undefined ? body.UserName : (body.Username !== undefined ? body.Username : (body.username !== undefined ? body.username : currentUser.UserName));
    const Role = body.Role !== undefined ? body.Role : (body.role !== undefined ? body.role : currentUser.Role);
    const Class_level = body.Class_level !== undefined ? body.Class_level : (body.class_level !== undefined ? body.class_level : currentUser.Class_level);
    const Status = body.Status !== undefined ? body.Status : (body.status !== undefined ? body.status : currentUser.Status);
    const Password = (body.Password && body.Password.trim() !== "") ? body.Password : (body.password && body.password.trim() !== "" ? body.password : currentUser.Password);

    const sql = `UPDATE users SET Name=?, Phone=?, Email=?, UserName=?, Role=?, Class_level=?, Status=?, Password=? WHERE User_id=?`;
    const params = [Name, Phone, Email, UserName, Role, Class_level, Status, Password, id];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("Backend Error updating user:", err);
        return res.status(500).json(err);
      }
      res.json({ success: true, message: "อัปเดตผู้ใช้งานสำเร็จ" });
    });
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

// 1. GET: ดึงกิจกรรมตาม Class_level ของ User (รองรับหลายห้อง)
app.get("/activities", (req, res) => {
  const { user_id, classrooms } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "กรุณาระบุ user_id" });
  }

  // ดึง Role ของผู้ใช้งานปัจจุบันก่อน
  const userSql = "SELECT Role, Class_level FROM users WHERE User_id = ?";
  db.query(userSql, [user_id], (err, userResult) => {
    if (err || userResult.length === 0) {
      return res.status(500).json({ error: "ไม่พบข้อมูลผู้ใช้งาน" });
    }

    const { Role, Class_level } = userResult[0];
    let sql = "";
    let params = [];

    if (Role === 'แอดมิน') {
      // แอดมิน: เห็นกิจกรรมทั้งหมด
      sql = `SELECT a.*, u.Name AS Photographer 
             FROM activity a 
             LEFT JOIN users u ON a.User_id = u.User_id 
             ORDER BY a.Activity_date DESC, a.Activity_id DESC`;
    } else {
      // ครูและผู้ปกครอง:
      // ถ้ามีการส่งค่า classrooms มาจาก Drop-down (คั่นด้วยจุลภาค เช่น "อนุบาล1 ห้องปกติ,อนุบาล1 ห้อง 3 ภาษา")
      if (classrooms) {
        const classroomArray = classrooms.split(',').map(c => c.trim()).filter(c => c);
        if (classroomArray.length > 0) {
          const placeholders = classroomArray.map(() => '?').join(', ');
          sql = `SELECT a.*, u.Name AS Photographer 
                 FROM activity a 
                 LEFT JOIN users u ON a.User_id = u.User_id 
                 WHERE u.Class_level IN (${placeholders}) 
                 ORDER BY a.Activity_date DESC, a.Activity_id DESC`;
          params = classroomArray;
        } else {
          // ถ้าไม่มีห้องที่เลือก ให้ดึงห้องของตัวเอง
          sql = `SELECT a.*, u.Name AS Photographer 
                 FROM activity a 
                 LEFT JOIN users u ON a.User_id = u.User_id 
                 WHERE u.Class_level = ? 
                 ORDER BY a.Activity_date DESC, a.Activity_id DESC`;
          params = [Class_level];
        }
      } else {
        // ค่าเริ่มต้น: ดึงเฉพาะห้องของตัวเอง
        sql = `SELECT a.*, u.Name AS Photographer 
               FROM activity a 
               LEFT JOIN users u ON a.User_id = u.User_id 
               WHERE u.Class_level = ? 
               ORDER BY a.Activity_date DESC, a.Activity_id DESC`;
        params = [Class_level];
      }
    }

    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
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
    if (err) { console.error(err); return res.status(500).json({ error: "ไม่สามารถอัปเดตกิจกรรมได้", details: err.message }); }
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

app.post("/api/students", (req, res) => {
  const body = req.body || {};
  const { Name, Class_level, Blood_group, Image } = body;
  const Student_code = body.Student_code || body.student_code || body.studentCode || null;
  const Birthday = parseDateForMySQL(body.Birthday || body.birthday);
  const Gender = body.Gender || body.gender || null;

  const rawUserId = body.User_id !== undefined ? body.User_id : body.user_id;
  const User_id = (rawUserId && rawUserId !== 'null' && rawUserId !== 'undefined') ? parseInt(rawUserId, 10) : null;

  const sql = `INSERT INTO student (Student_code, Name, Birthday, Gender, Class_level, User_id, Blood_group, Image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [Student_code, Name, Birthday, Gender, Class_level, User_id, Blood_group, Image || null], (err, result) => {
    if (err) {
      console.error("Insert Error:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลนักเรียน", details: err.message });
    }
    res.json({ message: "เพิ่มข้อมูลนักเรียนสำเร็จ", Student_id: result.insertId });
  });
});

app.put("/api/students/:id", (req, res) => {
  const studentId = req.params.id;
  const body = req.body || {};
  const { Name, Class_level, Blood_group, Image } = body;
  const Student_code = body.Student_code || body.student_code || body.studentCode || null;
  const Birthday = parseDateForMySQL(body.Birthday || body.birthday);
  const Gender = body.Gender || body.gender || null;

  const rawUserId = body.User_id !== undefined ? body.User_id : body.user_id;
  const User_id = (rawUserId && rawUserId !== 'null' && rawUserId !== 'undefined') ? parseInt(rawUserId, 10) : null;

  const sql = `UPDATE student SET Student_code=?, Name=?, Birthday=?, Gender=?, Class_level=?, User_id=?, Blood_group=?, Image=? WHERE Student_id=?`;
  db.query(sql, [Student_code, Name, Birthday, Gender, Class_level, User_id, Blood_group, Image || null, studentId], (err, result) => {
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
      SELECT DISTINCT u.Email 
      FROM users u
      JOIN student s ON u.User_id = s.User_id
      WHERE u.Role = 'ผู้ปกครอง' 
        AND u.Email IS NOT NULL 
        AND u.Email != '' 
        AND LOWER(REPLACE(s.Class_level, ' ', '')) = ?
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

        console.log(`📧 พบอีเมลผู้ปกครองของนักเรียนชั้น ${Class_level} ทั้งหมด ${uniqueEmails.length} ท่าน:`, emailList);

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

// ==========================================
// 📅 ระบบ API จัดการปฏิทินกิจกรรม (CALENDAR)
// ==========================================

app.get("/api/calendar", (req, res) => {
  db.query(
    `SELECT Calendar_id, PublicRelation_id, Name, DATE_FORMAT(Date, '%Y-%m-%d') AS Date, Time, Location, User_id FROM calendar ORDER BY Date ASC`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

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

app.get("/attendance/students", (req, res) => {
  const { activity, class: classId } = req.query;

  const sql = `
    SELECT 
      s.Student_id AS id, 
      s.Name AS name, 
      s.Class_level AS class_id,
      IF(pa.Student_id IS NOT NULL, 1, 0) AS attended
    FROM student s
    LEFT JOIN participating_activities pa 
      ON s.Student_id = pa.Student_id AND pa.Activity_id = ?
    WHERE 
      LOWER(REPLACE(s.Class_level, ' ', '')) = LOWER(REPLACE(?, ' ', ''))
      OR s.Class_level LIKE CONCAT('%', ?, '%')
    ORDER BY s.Student_id ASC
  `;

  db.query(sql, [activity, classId, classId], (err, result) => {
    if (err) return res.status(500).json(err);

    const formattedResult = result.map(row => ({
      id: row.id,
      name: row.name,
      class_id: row.class_id,
      attended: row.attended === 1
    }));

    res.json(formattedResult);
  });
});

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

app.get("/attendance/class/:id", (req, res) => {
  const classId = decodeURIComponent(req.params.id);

  const sqlExact = `SELECT DISTINCT Class_level FROM student WHERE Class_level = ? LIMIT 1`;

  db.query(sqlExact, [classId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results && results.length > 0) {
      return res.json({ id: classId, name: results[0].Class_level });
    }

    const sqlUser = `SELECT Class_level FROM users WHERE User_id = ? OR Class_level = ? LIMIT 1`;
    db.query(sqlUser, [classId, classId], (errUser, userResults) => {
      if (!errUser && userResults.length > 0 && userResults[0].Class_level) {
        return res.json({ id: classId, name: userResults[0].Class_level });
      }

      const sqlList = `SELECT DISTINCT Class_level FROM student WHERE Class_level IS NOT NULL AND Class_level != '' ORDER BY Class_level ASC`;
      db.query(sqlList, (err2, listResults) => {
        if (!err2 && listResults.length > 0) {
          const index = parseInt(classId, 10) - 1;
          if (!isNaN(index) && listResults[index]) {
            return res.json({ id: classId, name: listResults[index].Class_level });
          }
        }
        return res.json({ id: classId, name: classId });
      });
    });
  });
});

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
// 📊 DEVELOPMENT ASSESSMENT API (ประเมินพัฒนาการ)
// ==========================================

app.get("/api/development", (req, res) => {
  const { class_level } = req.query;

  let sql = `
    SELECT 
      d.*,
      DATE_FORMAT(d.Date, '%Y-%m-%d') AS date_clean,
      s.Name AS Student_name,
      s.Class_level AS class_level
    FROM development d
    LEFT JOIN student s ON d.Student_id = s.Student_id
  `;

  let params = [];
  if (class_level) {
    sql += ` WHERE LOWER(REPLACE(s.Class_level, ' ', '')) = LOWER(REPLACE(?, ' ', ''))`;
    params.push(class_level);
  }

  sql += ` ORDER BY d.Development_id DESC`;

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error fetching development data:", err);
      return res.status(500).json({ error: "ไม่สามารถดึงข้อมูลพัฒนาการได้", details: err.message });
    }
    res.json(result);
  });
});

app.post("/api/development", (req, res) => {
  const body = req.body || {};
  const Student_id = parseInt(body.Student_id, 10);
  const Year = parseInt(body.Year, 10) || 2569;
  const Term = body.Term || 'ภาคเรียนที่ 1';
  const cleanDate = parseDateForMySQL(body.date || body.Date);

  const {
    Physical, Weight, Height, Dental_health, Vaccination, Motor_skills,
    q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12
  } = body;

  const sql = `
    INSERT INTO development (
      Student_id, Year, Term, Date, Physical, Weight, Height, Dental_health, Vaccination, Motor_skills,
      q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    Student_id, Year, Term, cleanDate, Physical || null, Weight || null, Height || null,
    Dental_health || null, Vaccination || null, Motor_skills || null,
    q1 || '3', q2 || '3', q3 || '3', q4 || '3',
    q5 || '3', q6 || '3', q7 || '3', q8 || '3',
    q9 || '3', q10 || '3', q11 || '3', q12 || '3'
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting development data:", err);
      return res.status(500).json({ error: "ไม่สามารถบันทึกพัฒนาการได้", details: err.message });
    }
    res.status(201).json({ message: "บันทึกพัฒนาการสำเร็จ", Development_id: result.insertId });
  });
});
// 📌 ดึงข้อมูลประเมินพัฒนาการของนักเรียนรายบุคคล (สำหรับผู้ปกครองและครู)
app.get("/api/development/student", (req, res) => {
  const { Student_id, student_id } = req.query;
  const targetStudentId = Student_id || student_id;

  if (!targetStudentId) {
    return res.status(400).json({ error: "กรุณาระบุ Student_id" });
  }

  const sql = `
    SELECT 
      d.*,
      DATE_FORMAT(d.Date, '%Y-%m-%d') AS date_clean,
      s.Name AS Student_name,
      s.Class_level AS class_level
    FROM development d
    LEFT JOIN student s ON d.Student_id = s.Student_id
    WHERE d.Student_id = ?
    ORDER BY d.Year DESC, d.Term ASC, d.Development_id DESC
  `;

  db.query(sql, [targetStudentId], (err, result) => {
    if (err) {
      console.error("Error fetching student development data:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลพัฒนาการนักเรียน", details: err.message });
    }
    res.json(result);
  });
});

app.put("/api/development/:id", (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  const Student_id = parseInt(body.Student_id, 10);
  const Year = parseInt(body.Year, 10) || 2569;
  const Term = body.Term || 'ภาคเรียนที่ 1';
  const cleanDate = parseDateForMySQL(body.date || body.Date);

  const {
    Physical, Weight, Height, Dental_health, Vaccination, Motor_skills,
    q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12
  } = body;

  const sql = `
    UPDATE development SET
      Student_id = ?, Year = ?, Term = ?, Date = ?, Physical = ?, Weight = ?, Height = ?,
      Dental_health = ?, Vaccination = ?, Motor_skills = ?,
      q1 = ?, q2 = ?, q3 = ?, q4 = ?, q5 = ?, q6 = ?, q7 = ?, q8 = ?, q9 = ?, q10 = ?, q11 = ?, q12 = ?
    WHERE Development_id = ?
  `;

  const values = [
    Student_id, Year, Term, cleanDate, Physical || null, Weight || null, Height || null,
    Dental_health || null, Vaccination || null, Motor_skills || null,
    q1 || '3', q2 || '3', q3 || '3', q4 || '3',
    q5 || '3', q6 || '3', q7 || '3', q8 || '3',
    q9 || '3', q10 || '3', q11 || '3', q12 || '3',
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating development data:", err);
      return res.status(500).json({ error: "ไม่สามารถแก้ไขพัฒนาการได้", details: err.message });
    }
    res.json({ message: "แก้ไขข้อมูลการประเมินพัฒนาการสำเร็จ" });
  });
});

app.delete("/api/development/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM development WHERE Development_id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting development data:", err);
      return res.status(500).json({ error: "ไม่สามารถลบข้อมูลพัฒนาการได้", details: err.message });
    }
    res.json({ message: "ลบข้อมูลการประเมินเรียบร้อยแล้ว" });
  });
});

// ==========================================
// 🔐 ระบบตรวจสอบการเข้าสู่ระบบ (LOGIN / REGISTER API)
// ==========================================
app.post("/login", (req, res) => {
  const username = req.body.UserName || req.body.username;
  const password = req.body.Password || req.body.password;

  if (!username || !password) return res.status(400).json({ success: false, error: "กรุณากรอกข้อมูลให้ครบ" });

  db.query("SELECT * FROM users WHERE UserName = ? AND Password = ?", [username, password], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: "ฐานข้อมูลมีปัญหา" });
    if (result.length === 0) return res.status(401).json({ success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

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

    // ดึงข้อมูลเด็กทุกคนในปกครองสำหรับ Role ผู้ปกครอง
    db.query(
      "SELECT Student_id, Name, Class_level, Blood_group, Image FROM student WHERE User_id = ?",
      [user.User_id],
      (stdErr, students) => {
        if (stdErr) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลเด็ก:", stdErr);
        }

        const studentList = students || [];
        const classLevels = [...new Set(studentList.map(s => s.Class_level).filter(Boolean))];

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
            class_level: user.Class_level,
            students: studentList,
            class_levels: classLevels
          }
        });
      }
    );
  });
});

// ==========================================
// 🔐 ระบบลงทะเบียน (REGISTER API) - ล็อกเป็นผู้ปกครองอัตโนมัติ
// ==========================================
app.post('/api/register', (req, res) => {
  const Name = req.body.Name || req.body.name;
  const Phone = req.body.Phone || req.body.phone;
  const Email = req.body.Email || req.body.email || null;
  const UserName = req.body.UserName || req.body.Username || req.body.username;
  const Role = 'ผู้ปกครอง';
  const Class_level = req.body.Class_level || req.body.class_level;
  const Student_code = req.body.Student_code || req.body.student_code || req.body.studentCode; 
  const Password = req.body.Password || req.body.password;
  const ConfirmPassword = req.body.ConfirmPassword || req.body.confirmpassword;

  if (!UserName || !Password || !Student_code) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลและรหัสนักเรียนให้ครบถ้วน' });
  }

  if (Password !== ConfirmPassword) {
    return res.status(400).json({ message: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน!' });
  }

  // 1. ตรวจสอบว่ามีรหัสนักเรียนนี้ในตาราง student หรือไม่
  db.query('SELECT * FROM student WHERE Student_code = ?', [Student_code], (err, studentResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (studentResults.length === 0) {
      return res.status(400).json({ message: 'ไม่พบรหัสนักเรียนนี้ในระบบ กรุณาตรวจสอบรหัสนักเรียนอีกครั้ง' });
    }

    // 2. ตรวจสอบชื่อผู้ใช้ซ้ำ
    db.query('SELECT UserName FROM users WHERE UserName = ?', [UserName], (err, userResults) => {
      if (err) return res.status(500).json({ error: err.message });
      if (userResults.length > 0) {
        return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' });
      }

      // 3. เพิ่ม Student_code ลงในตาราง users ด้วย
      const insertQuery = 'INSERT INTO users (Name, Phone, Email, Password, UserName, Role, Class_level, Student_code, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(
        insertQuery,
        [Name, Phone, Email, Password, UserName, Role, Class_level, Student_code, 'รออนุมัติ'],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          const newUserId = result.insertId;

          // 4. ผูก User_id กลับไปยังตาราง student
          db.query(
            'UPDATE student SET User_id = ? WHERE Student_code = ?',
            [newUserId, Student_code],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });
              return res.status(200).json({ message: 'ลงทะเบียนและผูกบัญชีเรียบร้อยแล้ว รอการอนุมัติสิทธิ์จากผู้ดูแลระบบ' });
            }
          );
        }
      );
    });
  });
});

// ==========================================
// 👑 API สำหรับ Admin จัดการครู
// ==========================================

// 📝 สร้างบัญชีครู (เฉพาะ Admin) + ส่งอีเมลแจ้งเตือน
app.post('/api/admin/create-teacher', async (req, res) => {
  const { Name, Phone, Email, UserName, Class_level, Password } = req.body;

  if (!Name || !Phone || !Email || !UserName || !Class_level || !Password) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
  }

  db.query('SELECT * FROM users WHERE UserName = ?', [UserName], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว' });
    }

    db.query('SELECT * FROM users WHERE Email = ?', [Email], async (err, emailResults) => {
      if (err) return res.status(500).json({ error: err.message });

      if (emailResults.length > 0) {
        return res.status(400).json({ message: 'อีเมลนี้มีอยู่ในระบบแล้ว' });
      }

      const sql = `INSERT INTO users (Name, Phone, Email, Password, UserName, Role, Class_level, Status) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [Name, Phone, Email, Password, UserName, 'ครูผู้สอน', Class_level, 'ใช้งาน'],
        async (err, result) => {
          if (err) {
            console.error('Error creating teacher:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างบัญชีครู' });
          }

          try {
            const transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: {
                user: 'anchanaarthan@gmail.com',
                pass: 'liaknnlnlogqazqj'
              },
              tls: {
                rejectUnauthorized: false
              },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
              socketTimeout: 10000
            });

            const mailOptions = {
              from: '"ระบบบันทึกกิจกรรมนักเรียน" <anchanaarthan@gmail.com>',
              to: Email,
              subject: '🎉 ยินดีต้อนรับ! คุณได้รับบัญชีผู้ใช้งานระบบบันทึกกิจกรรม',
              html: `
                <div style="font-family: 'Kanit', sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #0369a1; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">
                    🎉 ยินดีต้อนรับคุณ ${Name}
                  </h2>
                  <p style="font-size: 16px;">ผู้ดูแลระบบได้สร้างบัญชีผู้ใช้งานสำหรับคุณแล้ว</p>
                  
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><b>👤 ชื่อผู้ใช้:</b> ${UserName}</p>
                    <p style="margin: 5px 0;"><b>🔑 รหัสผ่าน:</b> ${Password}</p>
                    <p style="margin: 5px 0;"><b>🏫 ห้องเรียน:</b> ${Class_level}</p>
                    <p style="margin: 5px 0;"><b>📧 อีเมล:</b> ${Email}</p>
                  </div>

                  <p style="font-size: 14px; color: #dc2626;">
                    ⚠️ <strong>กรุณาเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก</strong>
                  </p>

                  <p style="font-size: 14px; text-align: center;">
                    <a href="http://localhost:3000/login" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 8px;">
                      🔗 เข้าสู่ระบบที่นี่
                    </a>
                  </p>

                  <p style="font-size: 12px; color: #888888; text-align: center; margin-top: 30px;">
                    * อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบบันทึกกิจกรรมนักเรียนระดับปฐมวัย
                  </p>
                </div>
              `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ ส่งอีเมลแจ้งเตือนถึงครูสำเร็จ:', info.response);

            res.status(201).json({
              message: '✅ สร้างบัญชีครูสำเร็จ! (ส่งอีเมลแจ้งเตือนแล้ว)',
              teacher: { Name, Email, UserName, Class_level }
            });

          } catch (mailErr) {
            console.error('❌ ส่งอีเมลล้มเหลว:', mailErr);
            res.status(201).json({
              message: '✅ สร้างบัญชีครูสำเร็จ! (⚠️ แต่ส่งอีเมลแจ้งเตือนไม่สำเร็จ)',
              teacher: { Name, Email, UserName, Class_level },
              email_error: mailErr.message
            });
          }
        }
      );
    });
  });
});

// 📋 ดูรายชื่อครูทั้งหมด (เฉพาะ Admin)
app.get('/api/admin/teachers', (req, res) => {
  const sql = `SELECT User_id, Name, Phone, Email, UserName, Class_level, Status, created_at 
               FROM users 
               WHERE Role = 'ครูผู้สอน' 
               ORDER BY created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching teachers:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    res.json(results);
  });
});

// 🗑️ ลบครู (เฉพาะ Admin)
app.delete('/api/admin/teachers/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM users WHERE User_id = ? AND Role = "ครูผู้สอน"', [id], (err, result) => {
    if (err) {
      console.error('Error deleting teacher:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบครูที่ต้องการลบ' });
    }

    res.json({ message: '🗑️ ลบครูสำเร็จ' });
  });
});

// ==========================================
// 🎓 1. API ระบบปีการศึกษา (Academic Years)
// ==========================================
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
  const { Student_id, year_id, new_class_level } = req.body;

  if (!Student_id || !year_id || !new_class_level) {
    return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน กรุณาส่ง Student_id, year_id และ new_class_level" });
  }

  const updateSql = "UPDATE student SET Class_level = ? WHERE Student_id = ?";
  db.query(updateSql, [new_class_level, Student_id], (err, updateResult) => {
    if (err) {
      console.error("Error updating student class:", err);
      return res.status(500).json({ error: "อัปเดตตารางนักเรียนล้มเหลว", details: err.message });
    }

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