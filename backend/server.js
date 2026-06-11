const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());



// แสดงข้อมูลทั้งหมด
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

app.listen(3001, () => {
    console.log("Server running on port 3001");
});

// ดึงข้อมูลกิจกรรม
app.get("/activities", (req, res) => {
  const sql = "SELECT * FROM activities ORDER BY activity_id DESC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// เพิ่มกิจกรรม
app.post("/activities", (req, res) => {
  const { title, details, activity_date } = req.body;

  const sql =
    "INSERT INTO activities(title, details, activity_date) VALUES (?, ?, ?)";

  db.query(sql, [title, details, activity_date], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ" });
  });
});

// แก้ไขกิจกรรม
app.put("/activities/:id", (req, res) => {
  const { title, details, activity_date } = req.body;

  const sql =
    "UPDATE activities SET title=?, details=?, activity_date=? WHERE activity_id=?";

  db.query(
    sql,
    [title, details, activity_date, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "แก้ไขสำเร็จ" });
    }
  );
});

// ลบกิจกรรม
app.delete("/activities/:id", (req, res) => {
  const sql = "DELETE FROM activities WHERE activity_id=?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "ลบสำเร็จ" });
  });
});
// ==========================================
// 🚀 ระบบ API จัดการข้อมูลนักเรียน (STUDENTS CRUD)
// ==========================================

// 1. ดึงข้อมูลนักเรียนทั้งหมดมาแสดงที่หน้าจอ
app.get("/api/students", (req, res) => {
    const sql = "SELECT * FROM student ORDER BY Student_id DESC";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// 2. เพิ่มข้อมูลนักเรียนใหม่ (รองรับค่าเพศเป็นตัวเลขตามเงื่อนไข Database ของคุณ)
app.post("/api/students", (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group, User_id } = req.body;
    
    // แปลงเพศเป็นตัวเลขเพื่อไม่ให้เกิด Warning #1366 Incorrect integer value
    // ถ้าเลือก "ชาย" บันทึกเป็น 1, "หญิง" หรือค่าอื่นๆ บันทึกเป็น 0 
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;
    const userId = User_id || 1; // ดักไว้ถ้าไม่มีให้เป็น 1

    const sql = `INSERT INTO student (Name, Birthday, Gender, Class_level, User_id, Blood_group) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
                 
    db.query(sql, [Name, Birthday, genderId, Class_level, userId, Blood_group], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "เพิ่มข้อมูลนักเรียนสำเร็จ", Student_id: result.insertId });
    });
});

// 3. แก้ไขข้อมูลนักเรียน
app.put("/api/students/:id", (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group } = req.body;
    const studentId = req.params.id;
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;

    const sql = `UPDATE student 
                 SET Name=?, Birthday=?, Gender=?, Class_level=?, Blood_group=? 
                 WHERE Student_id=?`;

    db.query(sql, [Name, Birthday, genderId, Class_level, Blood_group, studentId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "แก้ไขข้อมูลนักเรียนสำเร็จ" });
    });
});

// 4. ลบข้อมูลนักเรียน
app.delete("/api/students/:id", (req, res) => {
    const studentId = req.params.id;
    const sql = "DELETE FROM student WHERE Student_id=?";

    db.query(sql, [studentId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "ลบข้อมูลนักเรียนสำเร็จ" });
    });
});