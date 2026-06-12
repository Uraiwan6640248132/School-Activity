const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());

// ✅ ตั้งค่า Limit (50MB) เพื่อรองรับการส่งรูปภาพ Base64 ขนาดใหญ่ของทุกระบบ
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


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
app.get("/activities", (req, res) => {
  // เปลี่ยนจาก activity_id เป็น Activity_id ตามรูปภาพ
  const sql = "SELECT * FROM activity ORDER BY Activity_id DESC"; 
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

app.post("/activities", (req, res) => {
  // 📥 รับค่าให้ตรงตามคอลัมน์ใน MySQL
  const { Name_activity, Image, Activity_date, Location, User_id } = req.body;
  const cleanUserId = User_id ? parseInt(User_id, 10) : 1;

  const sql = "INSERT INTO activity (Name_activity, Image, Activity_date, Location, User_id) VALUES (?, ?, ?, ?, ?)"; 

  db.query(sql, [Name_activity, Image || null, Activity_date, Location, cleanUserId], (err, result) => {
    if (err) {
      console.log("SQL Error ใน POST /activities:", err);
      return res.status(500).json(err);
    }
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ", Activity_id: result.insertId });
  });
});

app.put("/activities/:id", (req, res) => {
  // 📥 1. ดักรับค่าแบบยืดหยุ่น (ป้องกันกรณีหน้าบ้านส่งตัวพิมพ์เล็ก/ใหญ่ หรือส่งชื่อตัวแปรอื่นมา)
  const Name_activity = req.body.Name_activity || req.body.name_activity || req.body.title || null;
  const Image = req.body.Image || req.body.image || null;
  const Location = req.body.Location || req.body.location || null;
  
  // 📅 2. จัดการเรื่องวันที่ (หากหน้าบ้านส่งค่าว่างมา ต้องเซ็ตเป็น null เพื่อไม่ให้ MySQL พัง)
  let Activity_date = req.body.Activity_date || req.body.activity_date || req.body.date || null;
  if (Activity_date === "") Activity_date = null;

  // 👤 3. จัดการเรื่อง User_id (ล้างค่าให้เป็นตัวเลขแท้ๆ และถ้าไม่มีให้ใส่ 1 เสมอ)
  const incomingUserId = req.body.User_id || req.body.user_id || 1;
  const cleanUserId = parseInt(incomingUserId, 10) || 1;
  
  const activityId = req.params.id;

  // 📝 คำสั่ง SQL อัปเดตข้อมูลตามโครงสร้างตารางจริง
  const sql = "UPDATE activity SET Name_activity=?, Image=?, Activity_date=?, Location=?, User_id=? WHERE Activity_id=?"; 

  db.query(sql, [Name_activity, Image, Activity_date, Location, cleanUserId, activityId], (err, result) => {
    if (err) {
      // 🚨 จุดสำคัญ: ดูที่หน้าจอ Terminal ของ Node.js เพื่อเช็คสาเหตุที่แท้จริง
      console.log("\n❌ [MySQL Error ใน PUT /activities]:");
      console.error(err);
      console.log("-----------------------------------------\n");
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในระบบฐานข้อมูล", sqlError: err.message });
    }
    res.json({ message: "แก้ไขสำเร็จ" });
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