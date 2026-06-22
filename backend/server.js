const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer"); 
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ ปรับปรุง CORS: อนุญาตให้รับส่งข้อมูลครอบคลุมทั้ง localhost และ 127.0.0.1 ป้องกันหน้าบ้านหลุดการเชื่อมต่อ
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}));

// ปรับให้เซิร์ฟเวอร์หลังบ้านรองรับไฟล์ภาพขนาดใหญ่ (Base64) ได้สูงสุด 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('รองรับเฉพาะไฟล์รูปภาพเท่านั้น! (jpg, jpeg, png, gif)'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// ==========================================
// 👤 ระบบ API จัดการข้อมูลผู้ใช้งาน (USERS)
// ==========================================
app.get("/users", (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// 🌟 เพิ่ม API ตัวนี้: สำหรับดึงข้อมูลผู้ใช้งานเฉพาะคน (เช่น ID: 1) ไปแสดงที่ฟอร์มหน้าบ้าน
app.get("/users/:id", (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT * FROM users WHERE User_id = ?"; 
    
    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("❌ SQL Error ใน GET /users/:id:", err);
            return res.status(500).json(err);
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้งานคนนี้ในระบบ" });
        }
        res.json(result[0]); 
    });
});

// 🌟 เพิ่ม API ตัวนี้: สำหรับบันทึกค่าที่แก้ไขจากหน้าจอข้อมูลส่วนตัว กลับลงตาราง users
app.put("/users/:id", (req, res) => {
    const userId = req.params.id;
    const { Name, Phone, Username, Password } = req.body;

    let sql, params;
    if (Password) {
        sql = "UPDATE users SET Name = ?, Phone = ?, Username = ?, Password = ? WHERE User_id = ?";
        params = [Name, Phone, Username, Password, userId];
    } else {
        sql = "UPDATE users SET Name = ?, Phone = ?, Username = ? WHERE User_id = ?";
        params = [Name, Phone, Username, userId];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("❌ SQL Error ใน PUT /users/:id:", err);
            return res.status(500).json({ error: "ไม่สามารถบันทึกข้อมูลส่วนตัวได้", details: err });
        }
        res.json({ message: "อัปเดตข้อมูลส่วนตัวในฐานข้อมูลสำเร็จเรียบร้อยครับ" });
    });
});

// ==========================================
// 🏃‍♂️ ระบบ API จัดการกิจกรรม (ACTIVITY) - ปรับปรุงเพื่อความเสถียร 100%
// ==========================================

// 1. [GET] ดึงข้อมูลกิจกรรมทั้งหมด
app.get("/activities", (req, res) => {
  const sql = "SELECT * FROM activity ORDER BY Activity_id DESC"; 
  db.query(sql, (err, result) => {
    if (err) {
      console.log("❌ [SQL Error ใน GET /activities]:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// 2. [POST] เพิ่มกิจกรรมใหม่ (ป้องกันเรื่องค่า Null สมบูรณ์แบบ)
app.post("/activities", (req, res) => {
  const body = req.body || {};
  
  // ดักจับชื่อกิจกรรมจากหน้าบ้านทุกชื่อที่เป็นไปได้
  const Name_activity = body.Name_activity || body.name_activity || body.Name || body.name || body.title || body.activityName || null;
  const Activity_date = body.Activity_date || body.activity_date || body.date || body.Date || null;
  const Location = body.Location || body.location || null;
  const User_id = body.User_id || body.user_id || 1;
  const cleanUserId = parseInt(User_id, 10) || 1;
  
  // รับรูปภาพ Base64 ตรงๆ
  const finalImage = body.Image || body.image || null;

  // 🚨 ตรวจสอบก่อนส่งเข้า MySQL: ถ้าชื่อกิจกรรมหลุดมาเป็นค่าว่าง ให้เตือนหน้าบ้านดีๆ ไม่ปล่อยให้คิวรีพัง
  if (!Name_activity) {
    console.log("⚠️ [Warning] ไม่สามารถบันทึกได้ เนื่องจากหน้าบ้านไม่ได้ส่งชื่อกิจกรรมมา หรือชื่อฟิลด์ไม่ตรง:", body);
    return res.status(400).json({ error: "กรุณาระบุชื่อกิจกรรม (Name_activity) ให้ถูกต้อง" });
  }

  const sql = "INSERT INTO activity (Name_activity, Image, Activity_date, Location, User_id) VALUES (?, ?, ?, ?, ?)"; 

  db.query(sql, [Name_activity, finalImage, Activity_date, Location, cleanUserId], (err, result) => {
    if (err) {
      console.log("\n❌ [MySQL Error ใน POST /activities]:", err.message);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกกิจกรรม", details: err.message });
    }
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ", Activity_id: result.insertId, imageName: finalImage });
  });
});

// 3. [PUT] แก้ไขข้อมูลกิจกรรม
app.put("/activities/:id", (req, res) => {
  const body = req.body || {};
  const activityId = req.params.id;

  // ดักจับชื่อกิจกรรมทุกแบบเผื่อใช้ในขั้นตอนแก้ไข
  const Name_activity = body.Name_activity || body.name_activity || body.title || body.Name || body.name || body.activityName || null;
  const Location = body.Location || body.location || null;
  
  let Activity_date = body.Activity_date || body.activity_date || body.date || body.Date || null;
  if (Activity_date === "") Activity_date = null;

  const incomingUserId = body.User_id || body.user_id || 1;
  const cleanUserId = parseInt(incomingUserId, 10) || 1;

  const finalImage = body.Image || body.image || null; 

  if (!Name_activity) {
    return res.status(400).json({ error: "กรุณาระบุชื่อกิจกรรมที่ต้องการแก้ไข" });
  }

  const sql = "UPDATE activity SET Name_activity=?, Image=?, Activity_date=?, Location=?, User_id=? WHERE Activity_id=?"; 

  db.query(sql, [Name_activity, finalImage, Activity_date, Location, cleanUserId, activityId], (err, result) => {
    if (err) {
      console.log("\n❌ [MySQL Error ใน PUT /activities]:", err.message);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบฐานข้อมูล", sqlError: err.message });
    }
    res.json({ message: "แก้ไขสำเร็จ", imageName: finalImage });
  });
});

// 4. [DELETE] ลบข้อมูลกิจกรรม (เส้นทางหลัก)
app.delete("/activities/:id", (req, res) => {
  const activityId = req.params.id;
  const sql = "DELETE FROM activity WHERE Activity_id = ?"; 
  
  db.query(sql, [activityId], (err, result) => {
    if (err) {
      console.log("❌ [MySQL Error ใน DELETE /activities]:", err.message);
      return res.status(500).json({ error: "ไม่สามารถลบข้อมูลกิจกรรมได้", details: err.message });
    }
    res.json({ message: "ลบกิจกรรมสำเร็จ", id: activityId });
  });
});

// 5. [DELETE] ลบข้อมูลกิจกรรม สำรองพาร์ทเผื่อมี /api/ นำหน้า
app.delete("/api/activities/:id", (req, res) => {
  const activityId = req.params.id;
  const sql = "DELETE FROM activity WHERE Activity_id = ?"; 
  db.query(sql, [activityId], (err, result) => {
    if (err) {
      console.log("❌ [MySQL Error ใน DELETE /api/activities]:", err.message);
      return res.status(500).json(err);
    }
    res.json({ message: "ลบกิจกรรมสำเร็จผ่านช่องทางสำรอง" });
  });
});
// ==========================================
// 🚀 ระบบ API จัดการข้อมูลนักเรียน (STUDENTS CRUD)
// ==========================================
app.get("/api/students", (req, res) => {
    const sql = "SELECT * FROM student ORDER BY Student_id DESC";
    db.query(sql, (err, result) => {
        if (err) {
            console.log("SQL Error ใน GET /api/students:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.post("/api/students", (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group, User_id, Image } = req.body;
    const genderId = (Gender === "ชาย" || Gender === "1" || Gender === 1) ? 1 : 2; 
    const userId = User_id || 1;
    const finalImage = Image || null;

    const sql = `INSERT INTO student (Name, Birthday, Gender, Class_level, User_id, Blood_group, Image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                 
    db.query(sql, [Name, Birthday, genderId, Class_level, userId, Blood_group, finalImage], (err, result) => {
        if (err) {
            console.log("SQL Error ใน POST /api/students:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "เพิ่มข้อมูลนักเรียนสำเร็จ", Student_id: result.insertId, imageName: finalImage });
    });
});

app.put("/api/students/:id", (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group, Image } = req.body;
    const studentId = req.params.id;
    const genderId = (Gender === "ชาย" || Gender === "1" || Gender === 1) ? 1 : 2;
    const finalImage = Image || null;

    const sql = `UPDATE student SET Name=?, Birthday=?, Gender=?, Class_level=?, Blood_group=?, Image=? WHERE Student_id=?`;

    db.query(sql, [Name, Birthday, genderId, Class_level, Blood_group, finalImage, studentId], (err, result) => {
        if (err) {
            console.log("SQL Error ใน PUT /api/students:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "แก้ไขข้อมูลนักเรียนสำเร็จ", imageName: finalImage });
    });
});

app.delete("/api/students/:id", (req, res) => {
    const studentId = req.params.id;
    const sql = "DELETE FROM student WHERE Student_id=?";

    db.query(sql, [studentId], (err, result) => {
        if (err) {
            console.log("SQL Error ใน DELETE /api/students:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "ลบข้อมูลนักเรียนสำเร็จ" });
    });
});

// ==========================================
// 📢 ระบบ API จัดการประชาสัมพันธ์ (PUBLIC RELATIONS)
// ==========================================
app.get("/api/publicrelations", (req, res) => {
    const sql = `SELECT PublicRelation_id, Name_activity, Image, Date, Location, User_id FROM publicrelation ORDER BY PublicRelation_id DESC`;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error ใน GET /api/publicrelations:", err); 
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.post("/api/publicrelations", upload.single('Image'), (req, res) => {
    const { Name, date, Location, User_id } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;
    const imageName = req.file ? req.file.filename : null;
    
    const sql = `INSERT INTO publicrelation (Name_activity, Date, Location, User_id, Image) VALUES (?, ?, ?, ?, ?)`;
                 
    db.query(sql, [Name, date, Location, cleanUserId, imageName], (err, result) => {
        if (err) {
            console.error("SQL Error ใน POST /api/publicrelations:", err);
            return res.status(500).json({ error: "ไม่สามารถเพิ่มข้อมูลได้", sqlError: err });
        }
        res.json({ message: "เพิ่มประชาสัมพันธ์สำเร็จ", PublicRelation_id: result.insertId, imageName: imageName });
    });
});

app.put("/api/publicrelations/:id", upload.single('Image'), (req, res) => {
    const { Name, date, Location, User_id } = req.body;
    const prId = req.params.id;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

    let imageName = req.body.Image || req.body.image || null;
    if (req.file) {
        imageName = req.file.filename;
    }

    const sql = `UPDATE publicrelation SET Name_activity=?, Date=?, Location=?, User_id=?, Image=? WHERE PublicRelation_id=?`;

    db.query(sql, [Name, date, Location, cleanUserId, imageName, prId], (err, result) => {
        if (err) {
            console.error("SQL Error ใน PUT /api/publicrelations:", err);
            return res.status(500).json({ error: "ไม่สามารถแก้ไขข้อมูลได้", sqlError: err });
        }
        res.json({ message: "แก้ไขประชาสัมพันธ์สำเร็จ", imageName: imageName });
    });
});

app.delete("/api/publicrelations/:id", (req, res) => {
    const prId = req.params.id;
    const sql = "DELETE FROM publicrelation WHERE PublicRelation_id=?";

    db.query(sql, [prId], (err, result) => {
        if (err) {
            console.error("SQL Error ใน DELETE /api/publicrelations:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "ลบประชาสัมพันธ์สำเร็จ" });
    });
});

// ==========================================
// 📢 ระบบ API จัดการข้อมูลการแจ้งเตือน (NOTIFICATIONS CRUD)
// ==========================================
app.get("/notifications", (req, res) => {
  const sql = "SELECT * FROM notification ORDER BY Notification_id DESC"; 
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ SQL Error [GET /notifications]:", err);
      return res.status(500).json({ error: err.message, details: err });
    }
    res.json(results);
  });
});

app.post("/notifications", (req, res) => {
  const { User_id, Class_level, Subject, Deadline, Date, Details } = req.body;
  const cleanDeadline = Deadline || null;
  const cleanDate = Date || null;
  const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

  const sql = `INSERT INTO notification (User_id, Class_level, Subject, Deadline, \`Date\`, Details) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [cleanUserId, Class_level, Subject, cleanDeadline, cleanDate, Details || null], (err, result) => {
      if (err) {
        console.error("❌ SQL Error [POST /notifications]:", err);
        return res.status(500).json({ error: err.message, details: err });
      }
      res.json({ message: "เพิ่มข้อมูลสำเร็จ", id: result.insertId });
    }
  );
});

app.put("/notifications/:id", (req, res) => {
  const { id } = req.params;
  const { User_id, Class_level, Subject, Deadline, Date, Details } = req.body;
  const cleanDeadline = Deadline || null;
  const cleanDate = Date || null;
  const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

  const sql = `UPDATE notification SET User_id = ?, Class_level = ?, Subject = ?, Deadline = ?, \`Date\` = ?, Details = ? WHERE Notification_id = ?`;

  db.query(sql, [cleanUserId, Class_level, Subject, cleanDeadline, cleanDate, Details || null, id], (err, result) => {
      if (err) {
        console.error("❌ SQL Error [PUT /notifications]:", err);
        return res.status(500).json({ error: err.message, details: err });
      }
      res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    }
  );
});

app.delete("/notifications/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM notification WHERE Notification_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ SQL Error [DELETE /notifications]:", err);
      return res.status(500).json({ error: err.message, details: err });
    }
    res.json({ message: "ลบข้อมูลสำเร็จ" });
  });
});

// ==========================================
// 📅 ระบบ API จัดการปฏิทินกิจกรรม (CALENDAR)
// ==========================================
app.get("/api/calendar", (req, res) => {
    const sql = `SELECT Calendar_id, Name, DATE_FORMAT(Date, '%Y-%m-%d') AS Date, Time, User_id FROM calendar ORDER BY Date ASC`;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error ใน GET /api/calendar:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.post("/api/calendar", (req, res) => {
    const { Name, Date: actDate, Time, User_id } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

    const sql = "INSERT INTO calendar (Name, Date, Time, User_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [Name, actDate, Time, cleanUserId], (err, result) => {
        if (err) {
            console.error("SQL Error ใน POST /api/calendar:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "เพิ่มกิจกรรมลงปฏิทินสำเร็จ", Calendar_id: result.insertId });
    });
});

app.put("/api/calendar/:id", (req, res) => {
    const calendarId = req.params.id;
    const { Name, Date: actDate, Time, User_id } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

    const sql = "UPDATE calendar SET Name=?, Date=?, Time=?, User_id=? WHERE Calendar_id=?";
    db.query(sql, [Name, actDate, Time, cleanUserId, calendarId], (err, result) => {
        if (err) {
            console.error("SQL Error ใน PUT /api/calendar:", err);
            return res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไข", sqlError: err.message });
        }
        res.json({ message: "แก้ไขข้อมูลปฏิทินสำเร็จ" });
    });
});

// ==========================================
// 📝 ระบบ API เช็คชื่อการเข้าร่วมกิจกรรม
// ==========================================
app.get("/attendance/activities", (req, res) => {
    const sql = "SELECT Activity_id AS id, Name_activity AS name FROM activity ORDER BY Activity_id DESC";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error [GET /attendance/activities]:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.get("/attendance/classes", (req, res) => {
    const sql = "SELECT DISTINCT Class_level AS id, Class_level AS name FROM student WHERE Class_level IS NOT NULL AND Class_level != '' ORDER BY Class_level ASC";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error [GET /attendance/classes]:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.get("/attendance/students", (req, res) => {
    const { activity, class: classLevel } = req.query;
    const sql = `
        SELECT s.Student_id AS id, s.Name AS name, 
               IF(p.Student_id IS NOT NULL, 1, 0) AS attended
        FROM student s
        LEFT JOIN participating_activities p ON s.Student_id = p.Student_id AND p.Activity_id = ?
        WHERE s.Class_level = ?
        ORDER BY s.Student_id ASC
    `;

    db.query(sql, [activity, classLevel], (err, result) => {
        if (err) {
            console.error("SQL Error [GET /attendance/students]:", err);
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

app.post("/attendance/save", (req, res) => {
    const { activity_id, attendance_list } = req.body;

    if (!activity_id || !attendance_list || !Array.isArray(attendance_list) || attendance_list.length === 0) {
        return res.status(400).json({ error: "ข้อมูลไม่ครบถ้วน" });
    }

    const studentIds = attendance_list.map(s => s.student_id);
    const deleteSql = "DELETE FROM participating_activities WHERE Activity_id = ? AND Student_id IN (?)";
    
    db.query(deleteSql, [activity_id, studentIds], (err, deleteResult) => {
        if (err) {
            console.error("SQL Error [DELETE เก่า]:", err);
            return res.status(500).json(err);
        }

        const attendingStudents = attendance_list.filter(s => s.attended === true);

        if (attendingStudents.length === 0) {
            return res.json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
        }

        const values = attendingStudents.map(s => [
            s.student_id,
            activity_id
        ]);

        const insertSql = "INSERT INTO participating_activities (Student_id, Activity_id) VALUES ?";
        
        db.query(insertSql, [values], (err, insertResult) => {
            if (err) {
                console.error("SQL Error [INSERT ใหม่]:", err);
                return res.status(500).json(err);
            }
            res.json({ message: "บันทึกการเข้าร่วมกิจกรรมสำเร็จเรียบร้อยแล้ว" });
        });
    });
});

// ==========================================
// 🚀 API สำหรับระบบประเมินพัฒนาการเด็ก (Development)
// ==========================================
app.get('/api/development', (req, res) => {
  const sql = 'SELECT *, DATE_FORMAT(`Date`, "%Y-%m-%d") AS date_clean FROM development ORDER BY `Date` DESC, Development_id DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error ใน GET /api/development:", err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพัฒนาการ' });
    }
    res.json(results);
  });
});

app.post('/api/development', (req, res) => {
  const {
    Student_id, student_id, Year, year, Term, term, date, Date,
    Physical, Weight, Height, Dental_health, Vaccination, Motor_skills,
    Emotional, Emotion, Emotion_control, Confidence,
    Social, Stress, Interaction, Assistance,
    Intellectual, Problem_solving, Communication, Remembering
  } = req.body;

  const cleanStudentId = Student_id || student_id || 1;
  const cleanYear = Year || year || "2569";
  const cleanTerm = Term || term || "ภาคเรียนที่ 1"; 
  const cleanDate = date || Date || new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO development 
    (Student_id, Year, Term, \`Date\`, Physical, Weight, Height, Dental_health, Vaccination, Motor_skills, Emotional, Emotion, Emotion_control, Confidence, Social, Stress, Interaction, Assistance, Intellectual, Problem_solving, Communication, Remembering) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    cleanStudentId, cleanYear, cleanTerm, cleanDate,
    Physical || null, Weight || null, Height || null, Dental_health || null, Vaccination || null, Motor_skills || null,
    Emotional || null, Emotion || null, Emotion_control || null, Confidence || null,
    Social || null, Stress || null, Interaction || null, Assistance || null,
    Intellectual || null, Problem_solving || null, Communication || null, Remembering || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error ใน POST /api/development:", err);
      return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้', details: err.message });
    }
    res.status(201).json({ message: 'บันทึกพัฒนาการสำเร็จ', id: result.insertId });
  });
});

app.put('/api/development/:id', (req, res) => {
  const { id } = req.params;
  const {
    Year, year, Term, term, date, Date,
    Physical, Weight, Height, Dental_health, Vaccination, Motor_skills,
    Emotional, Emotion, Emotion_control, Confidence,
    Social, Stress, Interaction, Assistance,
    Intellectual, Problem_solving, Communication, Remembering
  } = req.body;

  const cleanYear = Year || year || "2569";
  const cleanTerm = Term || term || "ภาคเรียนที่ 1";
  const cleanDate = date || Date || null;

  const sql = `
    UPDATE development 
    SET Year=?, Term=?, \`Date\`=?, Physical=?, Weight=?, Height=?, Dental_health=?, Vaccination=?, Motor_skills=?, 
        Emotional=?, Emotion=?, Emotion_control=?, Confidence=?, 
        Social=?, Stress=?, Interaction=?, Assistance=?, 
        Intellectual=?, Problem_solving=?, Communication=?, Remembering=?
    WHERE Development_id = ?
  `;

  const values = [
    cleanYear, cleanTerm, cleanDate,
    Physical || null, Weight || null, Height || null, Dental_health || null, Vaccination || null, Motor_skills || null,
    Emotional || null, Emotion || null, Emotion_control || null, Confidence || null,
    Social || null, Stress || null, Interaction || null, Assistance || null,
    Intellectual || null, Problem_solving || null, Communication || null, Remembering || null,
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error ใน PUT /api/development:", err);
      return res.status(500).json({ error: 'ไม่สามารถแก้ไขข้อมูลได้' });
    }
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  });
});

app.delete('/api/development/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM development WHERE Development_id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("❌ Error ใน DELETE /api/development:", err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดทางเซิร์ฟเวอร์ ไม่สามารถลบข้อมูลได้', details: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบ ID ข้อมูลประเมินที่ต้องการลบในระบบ' });
    }
    res.json({ message: 'ลบข้อมูลการประเมินพัฒนาการเรียบร้อยแล้ว!' });
  });
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});