const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer"); 
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ ปรับปรุง CORS: อนุญาตให้รับส่งข้อมูลครอบคลุมทั้ง localhost และ 127.0.0.1
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
// 👤 ระบบ API จัดการข้อมูลผู้ใช้งาน (USERS) - เคลียร์ส่วนซ้ำซ้อนแล้ว
// ==========================================

// 1. ดึงข้อมูลผู้ใช้ทั้งหมดมาแสดงในตาราง (รองรับสิทธิ์ แอดมิน/ครู/ผู้ปกครอง)
app.get("/users", (req, res) => {
    const sql = "SELECT User_id, Name, Phone, UserName, Password, Role FROM users ORDER BY User_id DESC";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Error fetching users:", err);
            return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลฐานข้อมูล" });
        }
        res.json(result);
    });
});

// 2. ดึงข้อมูลผู้ใช้งานเฉพาะบุคคลตาม ID
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

// 3. บันทึกแก้ไขข้อมูลผู้ใช้งาน อัปเดตสิทธิ์ และรหัสผ่าน (รวมร่างสมบูรณ์แบบ ไม่พังแน่นอน)
app.put("/users/:id", (req, res) => {
    const userId = req.params.id;

    const {
        Name,
        Phone,
        UserName,
        Role,
        Password
    } = req.body;

    console.log(req.body);

    let sql;
    let params;

    if (Password && Password.trim() !== "") {
        sql = `
        UPDATE users
        SET Name=?,
            Phone=?,
            UserName=?,
            Role=?,
            Password=?
        WHERE User_id=?`;

        params = [Name, Phone, UserName, Role, Password, userId];
    } else {
        sql = `
        UPDATE users
        SET Name=?,
            Phone=?,
            UserName=?,
            Role=?
        WHERE User_id=?`;

        params = [Name, Phone, UserName, Role, userId];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json({
            success: true,
            message: "อัปเดตข้อมูลสำเร็จ"
        });
    });
});

// 4. ลบผู้ใช้งานออกจากระบบ
app.delete('/users/:id', (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE User_id = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("❌ Error deleting user:", err);
            return res.status(500).json({ error: "ไม่สามารถลบผู้ใช้ได้ บัญชีนี้อาจมีข้อมูลผูกอยู่กับตารางอื่น" });
        }
        return res.json({ success: true, message: "ลบผู้ใช้งานสำเร็จ" });
    });
});

// ==========================================
// 🏃‍♂️ ระบบ API จัดการกิจกรรม (ACTIVITY)
// ==========================================
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

app.post("/activities", (req, res) => {
  const body = req.body || {};
  const Name_activity = body.Name_activity || body.name_activity || body.Name || body.name || body.title || body.activityName || null;
  const Activity_date = body.Activity_date || body.activity_date || body.date || body.Date || null;
  const Location = body.Location || body.location || null;
  const User_id = body.User_id || body.user_id || 1;
  const cleanUserId = parseInt(User_id, 10) || 1;
  const finalImage = body.Image || body.image || null;

  if (!Name_activity) {
    return res.status(400).json({ error: "กรุณาระบุชื่อกิจกรรม (Name_activity) ให้ถูกต้อง" });
  }

  const sql = "INSERT INTO activity (Name_activity, Image, Activity_date, Location, User_id) VALUES (?, ?, ?, ?, ?)"; 

  db.query(sql, [Name_activity, finalImage, Activity_date, Location, cleanUserId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกกิจกรรม", details: err.message });
    }
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ", Activity_id: result.insertId, imageName: finalImage });
  });
});

app.put("/activities/:id", (req, res) => {
  const body = req.body || {};
  const activityId = req.params.id;
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
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบฐานข้อมูล", sqlError: err.message });
    }
    res.json({ message: "แก้ไขสำเร็จ", imageName: finalImage });
  });
});

app.delete("/activities/:id", (req, res) => {
  const activityId = req.params.id;
  const sql = "DELETE FROM activity WHERE Activity_id = ?"; 
  db.query(sql, [activityId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ไม่สามารถลบข้อมูลกิจกรรมได้", details: err.message });
    }
    res.json({ message: "ลบกิจกรรมสำเร็จ", id: activityId });
  });
});

app.delete("/api/activities/:id", (req, res) => {
  const activityId = req.params.id;
  const sql = "DELETE FROM activity WHERE Activity_id = ?"; 
  db.query(sql, [activityId], (err, result) => {
    if (err) { return res.status(500).json(err); }
    res.json({ message: "ลบกิจกรรมสำเร็จผ่านช่องทางสำรอง" });
  });
});

// ==========================================
// 🚀 ระบบ API จัดการข้อมูลนักเรียน (STUDENTS CRUD)
// ==========================================
app.get("/api/students", (req, res) => {
    const sql = "SELECT * FROM student ORDER BY Student_id DESC";
    db.query(sql, (err, result) => {
        if (err) { return res.status(500).json(err); }
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
        if (err) { return res.status(500).json(err); }
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
        if (err) { return res.status(500).json(err); }
        res.json({ message: "แก้ไขข้อมูลนักเรียนสำเร็จ", imageName: finalImage });
    });
});

app.delete("/api/students/:id", (req, res) => {
    const studentId = req.params.id;
    const sql = "DELETE FROM student WHERE Student_id=?";
    db.query(sql, [studentId], (err, result) => {
        if (err) { return res.status(500).json(err); }
        res.json({ message: "ลบข้อมูลนักเรียนสำเร็จ" });
    });
});

// ==========================================
// 📢 ระบบ API จัดการประชาสัมพันธ์ (PUBLIC RELATIONS)
// ==========================================
app.get("/api/publicrelations", (req, res) => {
    const sql = `SELECT PublicRelation_id, Name_activity, Image, Date, Location, User_id FROM publicrelation ORDER BY PublicRelation_id DESC`;
    db.query(sql, (err, result) => {
        if (err) { return res.status(500).json(err); }
        res.json(result);
    });
});

app.post("/api/publicrelations", upload.single('Image'), (req, res) => {
    const { Name, date, Location, User_id } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;
    const imageName = req.file ? req.file.filename : null;
    
    const sql = `INSERT INTO publicrelation (Name_activity, Date, Location, User_id, Image) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [Name, date, Location, cleanUserId, imageName], (err, result) => {
        if (err) { return res.status(500).json({ error: "ไม่สามารถเพิ่มข้อมูลได้", sqlError: err }); }
        res.json({ message: "เพิ่มประชาสัมพันธ์สำเร็จ", PublicRelation_id: result.insertId, imageName: imageName });
    });
});

app.put("/api/publicrelations/:id", upload.single('Image'), (req, res) => {
    const { Name, date, Location, User_id } = req.body;
    const prId = req.params.id;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;
    let imageName = req.body.Image || req.body.image || null;
    if (req.file) { imageName = req.file.filename; }

    const sql = `UPDATE publicrelation SET Name_activity=?, Date=?, Location=?, User_id=?, Image=? WHERE PublicRelation_id=?`;
    db.query(sql, [Name, date, Location, cleanUserId, imageName, prId], (err, result) => {
        if (err) { return res.status(500).json({ error: "ไม่สามารถแก้ไขข้อมูลได้", sqlError: err }); }
        res.json({ message: "แก้ไขประชาสัมพันธ์สำเร็จ", imageName: imageName });
    });
});

app.delete("/api/publicrelations/:id", (req, res) => {
    const prId = req.params.id;
    const sql = "DELETE FROM publicrelation WHERE PublicRelation_id=?";
    db.query(sql, [prId], (err, result) => {
        if (err) { return res.status(500).json(err); }
        res.json({ message: "ลบประชาสัมพันธ์สำเร็จ" });
    });
});

// ==========================================
// 📢 ระบบ API จัดการข้อมูลการแจ้งเตือน (NOTIFICATIONS CRUD)
// ==========================================
app.get("/notifications", (req, res) => {
  const sql = "SELECT * FROM notification ORDER BY Notification_id DESC"; 
  db.query(sql, (err, results) => {
    if (err) { return res.status(500).json({ error: err.message, details: err }); }
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
      if (err) { return res.status(500).json({ error: err.message, details: err }); }
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
      if (err) { return res.status(500).json({ error: err.message, details: err }); }
      res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    }
  );
});

// ==========================================
// 📅 ระบบ API จัดการปฏิทินกิจกรรม (CALENDAR)
// ==========================================
app.get("/api/calendar", (req, res) => {
    const sql = `SELECT Calendar_id, Name, DATE_FORMAT(Date, '%Y-%m-%d') AS Date, Time, User_id FROM calendar ORDER BY Date ASC`;
    db.query(sql, (err, result) => {
        if (err) { return res.status(500).json(err); }
        res.json(result);
    });
});

app.post("/api/calendar", (req, res) => {
    const { Name, Date: actDate, Time, User_id } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;
    const sql = "INSERT INTO calendar (Name, Date, Time, User_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [Name, actDate, Time, cleanUserId], (err, result) => {
        if (err) { return res.status(500).json(err); }
        res.json({ message: "เพิ่มกิจกรรมลงปฏิทินสำเร็จ", Calendar_id: result.insertId });
    });
});

app.put("/api/calendar/:id", (req, res) => {
    const calendarId = req.params.id;
    const { Name, Date: actDate, Time, User_id } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;
    const sql = "UPDATE calendar SET Name=?, Date=?, Time=?, User_id=? WHERE Calendar_id=?";
    db.query(sql, [Name, actDate, Time, cleanUserId, calendarId], (err, result) => {
        if (err) { return res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไข", sqlError: err.message }); }
        res.json({ message: "แก้ไขข้อมูลปฏิทินสำเร็จ" });
    });
});

// ==========================================
// 📝 ระบบ API เช็คชื่อการเข้าร่วมกิจกรรม
// ==========================================
app.get("/attendance/activities", (req, res) => {
    const sql = "SELECT Activity_id AS id, Name_activity AS name FROM activity ORDER BY Activity_id DESC";
    db.query(sql, (err, result) => {
        if (err) { return res.status(500).json(err); }
        res.json(result);
    });
});

app.get("/attendance/classes", (req, res) => {
    const sql = "SELECT DISTINCT Class_level AS id, Class_level AS name FROM student WHERE Class_level IS NOT NULL AND Class_level != '' ORDER BY Class_level ASC";
    db.query(sql, (err, result) => {
        if (err) { return res.status(500).json(err); }
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
        if (err) { return res.status(500).json(err); }
        const formattedResult = result.map(row => ({ id: row.id, name: row.name, attended: row.attended === 1 }));
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
        if (err) { return res.status(500).json(err); }
        const attendingStudents = attendance_list.filter(s => s.attended === true);
        if (attendingStudents.length === 0) { return res.json({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" }); }

        const values = attendingStudents.map(s => [s.student_id, activity_id]);
        const insertSql = "INSERT INTO participating_activities (Student_id, Activity_id) VALUES ?";
        
        db.query(insertSql, [values], (err, insertResult) => {
            if (err) { return res.status(500).json(err); }
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
    if (err) { return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลพัฒนาการ' }); }
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    cleanStudentId, cleanYear, cleanTerm, cleanDate,
    Physical || null, Weight || null, Height || null, Dental_health || null, Vaccination || null, Motor_skills || null,
    Emotional || null, Emotion || null, Emotion_control || null, Confidence || null,
    Social || null, Stress || null, Interaction || null, Assistance || null,
    Intellectual || null, Problem_solving || null, Communication || null, Remembering || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) { return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลได้', details: err.message }); }
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
        Emotional=?, Emotion=?, Emotion_control=?, Confidence=?, Social=?, Stress=?, Interaction=?, Assistance=?, 
        Intellectual=?, Problem_solving=?, Communication=?, Remembering=? WHERE Development_id = ?`;

  const values = [
    cleanYear, cleanTerm, cleanDate,
    Physical || null, Weight || null, Height || null, Dental_health || null, Vaccination || null, Motor_skills || null,
    Emotional || null, Emotion || null, Emotion_control || null, Confidence || null,
    Social || null, Stress || null, Interaction || null, Assistance || null,
    Intellectual || null, Problem_solving || null, Communication || null, Remembering || null, id
  ];

  db.query(sql, values, (err, result) => {
    if (err) { return res.status(500).json({ error: 'ไม่สามารถแก้ไขข้อมูลได้' }); }
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  });
});

app.delete('/api/development/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM development WHERE Development_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) { return res.status(500).json({ error: 'เกิดข้อผิดพลาดทางเซิร์ฟเวอร์ ไม่สามารถลบข้อมูลได้', details: err.message }); }
    if (result.affectedRows === 0) { return res.status(404).json({ error: 'ไม่พบ ID ข้อมูลประเมินที่ต้องการลบในระบบ' }); }
    res.json({ message: 'ลบข้อมูลการประเมินพัฒนาการเรียบร้อยแล้ว!' });
  });
});

// ==========================================
// 🔐 ระบบตรวจสอบการเข้าสู่ระบบ (LOGIN API)
// ==========================================
app.post("/login", (req, res) => {
  const username = req.body.UserName || req.body.username;
  const password = req.body.Password || req.body.password;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
  }

  const sql = "SELECT * FROM users WHERE UserName = ? AND Password = ?";
  db.query(sql, [username, password], (err, result) => {
    if (err) { return res.status(500).json({ success: false, error: "เกิดข้อผิดพลาดในระบบฐานข้อมูล" }); }

    if (result.length > 0) {
      const user = result[0];
      return res.json({
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        user: { id: user.User_id, username: user.UserName, name: user.Name, role: user.Role }
      });
    } else {
      return res.status(401).json({ success: false, error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
  });
});

app.listen(3001, () => {
    console.log("🚀 Server running on port 3001");
});