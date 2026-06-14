const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer"); // 1. นำเข้า multer
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());

// ✅ ตั้งค่า Limit (50MB) สำหรับ JSON (คงไว้กรณีมีข้อมูล text ขนาดใหญ่)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. ตรวจสอบและสร้างโฟลเดอร์ 'uploads' ถ้ายังไม่มีในโปรเจกต์
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. เพื่อให้หน้าบ้านสามารถดึงรูปภาพผ่าน URL ได้ เช่น http://localhost:3001/uploads/ชื่อไฟล์.jpg
app.use('/uploads', express.static(uploadDir));

// 4. ตั้งค่า Storage ของ Multer สำหรับจัดการชื่อไฟล์และตำแหน่งจัดเก็บ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // บันทึกในโฟลเดอร์ uploads
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์ใหม่ป้องกันชื่อซ้ำ: วันที่ปัจจุบัน-เลขสุ่ม.นามสกุลเดิม
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// กรองประเภทไฟล์ให้รับเฉพาะรูปภาพ (jpeg, jpg, png, gif)
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
    limits: { fileSize: 5 * 1024 * 1024 } // จำกัดขนาดไฟล์ภาพละไม่เกิน 5MB
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


// ==========================================
// 🏃‍♂️ ระบบ API จัดการกิจกรรม (ACTIVITY)
// ==========================================
app.get("/activities", (req, res) => {
  const sql = "SELECT * FROM activity ORDER BY Activity_id DESC"; 
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ใช้ upload.single('Image') เพื่อรับไฟล์ภาพเดี่ยวจากช่องที่ชื่อว่า 'Image'
app.post("/activities", upload.single('Image'), (req, res) => {
  const { Name_activity, Activity_date, Location, User_id } = req.body;
  const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

  // ดึงชื่อไฟล์ที่ถูกเซฟบนเซิร์ฟเวอร์ ถ้าไม่มีไฟล์อัปโหลดให้เป็น null
  const imageName = req.file ? req.file.filename : null;

  const sql = "INSERT INTO activity (Name_activity, Image, Activity_date, Location, User_id) VALUES (?, ?, ?, ?, ?)"; 

  db.query(sql, [Name_activity, imageName, Activity_date, Location, cleanUserId], (err, result) => {
    if (err) {
      console.log("SQL Error ใน POST /activities:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ", Activity_id: result.insertId, imageName: imageName });
  });
});

app.put("/activities/:id", upload.single('Image'), (req, res) => {
  const Name_activity = req.body.Name_activity || req.body.name_activity || req.body.title || null;
  const Location = req.body.Location || req.body.location || null;
  
  let Activity_date = req.body.Activity_date || req.body.activity_date || req.body.date || null;
  if (Activity_date === "") Activity_date = null;

  const incomingUserId = req.body.User_id || req.body.user_id || 1;
  const cleanUserId = parseInt(incomingUserId, 10) || 1;
  const activityId = req.params.id;

  // จัดการเรื่องรูปภาพในการอัปเดต
  let imageName = req.body.Image || req.body.image || null; // กรณีหน้าบ้านส่งชื่อไฟล์เดิมมา (ไม่ได้อัปโหลดใหม่)
  if (req.file) {
      imageName = req.file.filename; // กรณีหน้าบ้านมีการอัปโหลดรูปภาพใหม่เข้ามาแทนที่
  }

  const sql = "UPDATE activity SET Name_activity=?, Image=?, Activity_date=?, Location=?, User_id=? WHERE Activity_id=?"; 

  db.query(sql, [Name_activity, imageName, Activity_date, Location, cleanUserId, activityId], (err, result) => {
    if (err) {
      console.log("\n❌ [MySQL Error ใน PUT /activities]:");
      console.error(err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบฐานข้อมูล", sqlError: err.message });
    }
    res.json({ message: "แก้ไขสำเร็จ", imageName: imageName });
  });
});

app.delete("/activities/:id", (req, res) => {
  const sql = "DELETE FROM activity WHERE Activity_id=?"; 
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ message: "ลบสำเร็จ" });
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

app.post("/api/students", upload.single('Image'), (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group, User_id } = req.body;
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;
    const userId = User_id || 1;
    
    const imageName = req.file ? req.file.filename : null;

    const sql = `INSERT INTO student (Name, Birthday, Gender, Class_level, User_id, Blood_group, Image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                 
    db.query(sql, [Name, Birthday, genderId, Class_level, userId, Blood_group, imageName], (err, result) => {
        if (err) {
            console.log("SQL Error ใน POST /api/students:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "เพิ่มข้อมูลนักเรียนสำเร็จ", Student_id: result.insertId, imageName: imageName });
    });
});

app.put("/api/students/:id", upload.single('Image'), (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group } = req.body;
    const studentId = req.params.id;
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;

    let imageName = req.body.Image || req.body.image || null;
    if (req.file) {
        imageName = req.file.filename;
    }

    const sql = `UPDATE student SET Name=?, Birthday=?, Gender=?, Class_level=?, Blood_group=?, Image=? WHERE Student_id=?`;

    db.query(sql, [Name, Birthday, genderId, Class_level, Blood_group, imageName, studentId], (err, result) => {
        if (err) {
            console.log("SQL Error ใน PUT /api/students:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "แก้ไขข้อมูลนักเรียนสำเร็จ", imageName: imageName });
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
    const sql = `
        SELECT PublicRelation_id, Name_activity, Image, Date, Location, User_id 
        FROM publicrelation 
        ORDER BY PublicRelation_id DESC
    `;
    
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
// 📢 ระบบ API จัดการข้อมูลการแจ้งเตือน (NOTIFICATIONS CRUD) - เวอร์ชันแก้ไขสมบูรณ์
// ==========================================

// 🟢 [GET] ดึงข้อมูลการแจ้งเตือนทั้งหมด
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

// 🔵 [POST] เพิ่มข้อมูลการแจ้งเตือนใหม่
app.post("/notifications", (req, res) => {
  const { User_id, Class_level, Subject, Deadline, Date, Details } = req.body;
  
  const cleanDeadline = Deadline || null;
  const cleanDate = Date || null;
  const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

  // 🟢 แก้ไข: ใช้เครื่องหมาย ` ครอบคำว่า `Date` ป้องกันระบบ MySQL เข้าใจผิดว่าเป็นฟังก์ชันคำสั่งเฉพาะ
  const sql = `
    INSERT INTO notification (User_id, Class_level, Subject, Deadline, \`Date\`, Details) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(
    sql, 
    [cleanUserId, Class_level, Subject, cleanDeadline, cleanDate, Details || null], 
    (err, result) => {
      if (err) {
        console.error("❌ SQL Error [POST /notifications]:", err);
        return res.status(500).json({ error: err.message, details: err });
      }
      res.json({ message: "เพิ่มข้อมูลสำเร็จ", id: result.insertId });
    }
  );
});

// 🟡 [PUT] แก้ไขข้อมูลการแจ้งเตือน (อ้างอิงจาก ID)
app.put("/notifications/:id", (req, res) => {
  const { id } = req.params;
  const { User_id, Class_level, Subject, Deadline, Date, Details } = req.body;

  const cleanDeadline = Deadline || null;
  const cleanDate = Date || null;
  const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

  // 🟢 แก้ไข: ใช้เครื่องหมาย ` ครอบคำว่า \`Date\` และตรวจตัวพิมพ์ใหญ่ Notification_id ให้ตรงฐานข้อมูลจริง
  const sql = `
    UPDATE notification 
    SET User_id = ?, Class_level = ?, Subject = ?, Deadline = ?, \`Date\` = ?, Details = ? 
    WHERE Notification_id = ?
  `;

  db.query(
    sql, 
    [cleanUserId, Class_level, Subject, cleanDeadline, cleanDate, Details || null, id], 
    (err, result) => {
      if (err) {
        console.error("❌ SQL Error [PUT /notifications]:", err);
        return res.status(500).json({ error: err.message, details: err });
      }
      res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    }
  );
});

// 🔴 [DELETE] ลบข้อมูลการแจ้งเตือน (อ้างอิงจาก ID)
app.delete("/notifications/:id", (req, res) => {
  const { id } = req.params;

  // 🟢 แก้ไข: ปรับคำเงื่อนไขให้ตรงกับชื่อคอลัมน์หลัก Notification_id
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
// 📅 ระบบ API จัดการปฏิทินกิจกรรม (CALENDAR) - เวอร์ชันรองรับเวลาแบบ VARCHAR ข้อความอิสระ
// ==========================================

// 1. ดึงข้อมูลปฏิทินทั้งหมด (คงตัวแปลง DATE_FORMAT เอาไว้เพื่อล็อกช่องปฏิทินให้ตรง)
app.get("/api/calendar", (req, res) => {
    // 💡 ถอน TIME_FORMAT ออก เพื่อดึงค่าข้อความดิบจากฟิลด์ Time ตรงๆ ไม่ให้โดนแปลงค่า
    const sql = `
        SELECT 
            Calendar_id, 
            Name, 
            DATE_FORMAT(Date, '%Y-%m-%d') AS Date, 
            Time, 
            User_id 
        FROM calendar 
        ORDER BY Date ASC
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error("SQL Error ใน GET /api/calendar:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// 2. เพิ่มข้อมูลกิจกรรมลงปฏิทินใหม่ (รับค่าแบบ String ตรงๆ จาก React)
app.post("/api/calendar", (req, res) => {
    const { Name, Date: actDate, Time, User_id } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

    // ส่งค่าไปบันทึกตรงๆ ไม่ต้องตัดคำ
    const sql = "INSERT INTO calendar (Name, Date, Time, User_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [Name, actDate, Time, cleanUserId], (err, result) => {
        if (err) {
            console.error("SQL Error ใน POST /api/calendar:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "เพิ่มกิจกรรมลงปฏิทินสำเร็จ", Calendar_id: result.insertId });
    });
});

// 3. แก้ไขข้อมูลปฏิทินกิจกรรม
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

// 🚀 รัน Server พอร์ต 3001
app.listen(3001, () => {
    console.log("Server running on port 3001");
});