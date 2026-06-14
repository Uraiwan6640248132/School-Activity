const express = require("express");
const cors = require("cors");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use(cors());

// ✅ ตั้งค่า Limit (50MB) เพื่อรองรับการส่งรูปภาพ Base64 ขนาดใหญ่ของทุกระบบ
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/uploads", express.static("uploads"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


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
// 🏃‍♂️ ระบบ API จัดการกิจกรรม (ACTIVITY) - แก้ไขให้ตรงกับตารางจริง
// ==========================================
// ==================== GET ====================
app.get("/activities", (req, res) => {
  const sql = "SELECT * FROM activity ORDER BY Activity_id DESC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});


// ==================== POST ====================
// ==================== POST ====================
app.post("/activities", upload.single("image"), (req, res) => {

  const { Name_activity, Activity_date, Location, User_id } = req.body;

  const Image = req.file
    ? `http://localhost:3001/uploads/${req.file.filename}`
    : req.body.Image || null;

  const sql = `
    INSERT INTO activity
    (Name_activity, Image, Activity_date, Location, User_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [Name_activity, Image, Activity_date, Location, User_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ" });
  });
});



// ==================== PUT ====================
app.put("/activities/:id", upload.single("image"), (req, res) => {
  const activityId = req.params.id;

  const Name_activity = req.body.Name_activity;
  const Activity_date = req.body.Activity_date || null;
  const Location = req.body.Location;
  const User_id = req.body.User_id || 1;

  if (req.file) {
    // มีรูปใหม่อัปโหลดมา → ใช้ path ไฟล์ใหม่
    const Image = `http://localhost:3001/uploads/${req.file.filename}`;
    runUpdate(Image);
  } else {
    // ไม่มีรูปใหม่ → ดึงรูปเดิมจาก DB มาใช้ (ไม่ต้องส่งรูปจาก frontend)
    db.query("SELECT Image FROM activity WHERE Activity_id=?", [activityId], (err, result) => {
      if (err) return res.status(500).json(err);
      const Image = result[0]?.Image || null;
      runUpdate(Image);
    });
  }

  function runUpdate(Image) {
    const sql = `
      UPDATE activity
      SET Name_activity=?, Image=?, Activity_date=?, Location=?, User_id=?
      WHERE Activity_id=?
    `;
    db.query(sql, [Name_activity, Image, Activity_date, Location, User_id, activityId], (err, result) => {
      if (err) {
        console.error("===== MYSQL ERROR =====", err);
        return res.status(500).json(err);
      }
      res.json({ message: "แก้ไขสำเร็จ" });
    });
  }
});


// ==================== DELETE ====================
app.delete("/activities/:id", (req, res) => {

  const sql = "DELETE FROM activity WHERE Activity_id=?";

  db.query(sql, [req.params.id], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json({
      message: "ลบข้อมูลสำเร็จ"
    });

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
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;
    const userId = User_id || 1;

    const sql = `INSERT INTO student (Name, Birthday, Gender, Class_level, User_id, Blood_group, Image) VALUES (?, ?, ?, ?, ?, ?, ?)`;
                 
    db.query(sql, [Name, Birthday, genderId, Class_level, userId, Blood_group, Image || null], (err, result) => {
        if (err) {
            console.log("SQL Error ใน POST /api/students:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "เพิ่มข้อมูลนักเรียนสำเร็จ", Student_id: result.insertId });
    });
});

app.put("/api/students/:id", (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group, Image } = req.body;
    const studentId = req.params.id;
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;

    const sql = `UPDATE student SET Name=?, Birthday=?, Gender=?, Class_level=?, Blood_group=?, Image=? WHERE Student_id=?`;

    db.query(sql, [Name, Birthday, genderId, Class_level, Blood_group, Image || null, studentId], (err, result) => {
        if (err) {
            console.log("SQL Error ใน PUT /api/students:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "แก้ไขข้อมูลนักเรียนสำเร็จ" });
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
        SELECT 
            PublicRelation_id, 
            Name_activity, 
            Image, 
            Date, 
            Location, 
            User_id 
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

app.post("/api/publicrelations", (req, res) => {
    const { Name, date, Location, User_id, Image } = req.body;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;
    
    const sql = `INSERT INTO publicrelation (Name_activity, Date, Location, User_id, Image) VALUES (?, ?, ?, ?, ?)`;
                 
    db.query(sql, [Name, date, Location, cleanUserId, Image], (err, result) => {
        if (err) {
            console.error("SQL Error ใน POST /api/publicrelations:", err);
            return res.status(500).json({ error: "ไม่สามารถเพิ่มข้อมูลได้ กรุณาตรวจสอบข้อมูลหรือ User_id", sqlError: err });
        }
        res.json({ message: "เพิ่มประชาสัมพันธ์สำเร็จ", PublicRelation_id: result.insertId });
    });
});

app.put("/api/publicrelations/:id", (req, res) => {
    const { Name, date, Location, User_id, Image } = req.body;
    const prId = req.params.id;
    const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

    const sql = `UPDATE publicrelation SET Name_activity=?, Date=?, Location=?, User_id=?, Image=? WHERE PublicRelation_id=?`;

    db.query(sql, [Name, date, Location, cleanUserId, Image, prId], (err, result) => {
        if (err) {
            console.error("SQL Error ใน PUT /api/publicrelations:", err);
            return res.status(500).json({ error: "ไม่สามารถแก้ไขข้อมูลได้", sqlError: err });
        }
        res.json({ message: "แก้ไขประชาสัมพันธ์สำเร็จ" });
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


// 🚀 รัน Server พอร์ต 3001
app.listen(3001, () => {
    console.log("Server running on port 3001");
});