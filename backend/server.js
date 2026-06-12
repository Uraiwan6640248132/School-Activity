const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());

// ตั้งค่า Limit เพื่อรองรับการส่งรูปภาพ Base64 ขนาดใหญ่ทั้งของนักเรียนและประชาสัมพันธ์
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// 👤 ระบบ API จัดการข้อมูลผู้ใช้งาน (USERS)
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
  const sql = "SELECT * FROM activity ORDER BY activity_id DESC"; 
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

app.post("/activities", (req, res) => {
  const { title, details, activity_date } = req.body;
  const sql = "INSERT INTO activity (title, details, activity_date) VALUES (?, ?, ?)"; 

  db.query(sql, [title, details, activity_date], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ" });
  });
});

app.put("/activities/:id", (req, res) => {
  const { title, details, activity_date } = req.body;
  const sql = "UPDATE activity SET title=?, details=?, activity_date=? WHERE activity_id=?"; 

  db.query(sql, [title, details, activity_date, req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ message: "แก้ไขสำเร็จ" });
  });
});

app.delete("/activities/:id", (req, res) => {
  const sql = "DELETE FROM activity WHERE activity_id=?"; 
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json({ message: "ลบสำเร็จ" });
  });
});


// ==========================================
// 🚀 ระบบ API จัดการข้อมูลนักเรียน (STUDENTS CRUD) - รองรับอัปโหลดรูปภาพ Longtext สู่ MySQL
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

    // 📸 เพิ่มคอลัมน์ Image เข้าไปในชุดคำสั่งหลังเปลี่ยนโครงสร้างเป็น longtext ใน phpMyAdmin แล้ว
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

    // 📸 อัปเดตฟิลด์รูปภาพในการแก้ไขข้อมูลนักเรียนด้วย
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
// 📢 ระบบ API จัดการประชาสัมพันธ์ (PUBLIC RELATIONS) - แก้ไขบั๊ก 404 และ 500 ป้องกันกุญแจต่างประเทศพัง
// ==========================================

// 1. ดึงข้อมูลประชาสัมพันธ์ (GET)
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

// 2. เพิ่มข้อมูลประชาสัมพันธ์ (POST)
app.post("/api/publicrelations", (req, res) => {
    const { Name, date, Location, User_id, Image } = req.body;
    
    // แปลงค่า User_id ให้เป็นตัวเลข Integer แท้ๆ เพื่อสมานรอยต่อกุญแจต่างประเทศไม่ให้ส่ง Error 500
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

// 3. แก้ไขข้อมูลประชาสัมพันธ์ (PUT)
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

// 4. ลบข้อมูลประชาสัมพันธ์ (DELETE)
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

// รัน Server พอร์ต 3001
app.listen(3001, () => {
    console.log("Server running on port 3001");
});