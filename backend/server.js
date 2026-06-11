const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json()); // สำคัญมาก: เพื่อให้รับค่า JSON จาก React ได้


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


// 📅 ระบบ API จัดการข้อมูลกิจกรรม (ACTIVITY CRUD)


// 1. ดึงข้อมูลกิจกรรมทั้งหมด (ตารางชื่อ activity ตาม phpMyAdmin)
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

// 2. เพิ่มกิจกรรมใหม่ (คอลัมน์: Name_activity, Location, Activity_date, User_id)
app.post("/activities", (req, res) => {
  const { Name_activity, Location, Activity_date, User_id } = req.body;
  const userId = User_id || 1; // ดักไว้กรณีไม่มี User_id ส่งมา

  const sql =
    "INSERT INTO activity (Name_activity, Location, Activity_date, User_id) VALUES (?, ?, ?, ?)";

  db.query(sql, [Name_activity, Location, Activity_date, userId], (err, result) => {
    if (err) {
        console.log(err);
        return res.status(500).json(err);
    }
    res.json({ message: "เพิ่มกิจกรรมสำเร็จ", Activity_id: result.insertId });
  });
});

// 3. แก้ไขกิจกรรม (อัปเดตตามคอลัมน์จริง เงื่อนไข WHERE อิง Activity_id)
app.put("/activities/:id", (req, res) => {
  const { Name_activity, Location, Activity_date } = req.body;
  const activityId = req.params.id;

  const sql =
    "UPDATE activity SET Name_activity=?, Location=?, Activity_date=? WHERE Activity_id=?";

  db.query(sql, [Name_activity, Location, Activity_date, activityId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      res.json({ message: "แก้ไขสำเร็จ" });
    }
  );
});

// 4. ลบกิจกรรม (อิงเงื่อนไข WHERE จาก Activity_id)
app.delete("/activities/:id", (req, res) => {
  const activityId = req.params.id;
  const sql = "DELETE FROM activity WHERE Activity_id=?";

  db.query(sql, [activityId], (err, result) => {
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
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.post("/api/students", (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group, User_id } = req.body;
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;
    const userId = User_id || 1;

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

app.put("/api/students/:id", (req, res) => {
    const { Name, Birthday, Gender, Class_level, Blood_group } = req.body;
    const studentId = req.params.id;
    const genderId = (Gender === "ชาย" || Gender === "1") ? 1 : 0;

    const sql = `UPDATE student SET Name=?, Birthday=?, Gender=?, Class_level=?, Blood_group=? WHERE Student_id=?`;

    db.query(sql, [Name, Birthday, genderId, Class_level, Blood_group, studentId], (err, result) => {
        if (err) {
            console.log(err);
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
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "ลบข้อมูลนักเรียนสำเร็จ" });
    });
});

// ==========================================
// 📢 ระบบ API จัดการประชาสัมพันธ์ (PUBLIC RELATIONS)
// ==========================================
app.get("/api/publicrelations", (req, res) => {
    const sql = "SELECT * FROM publicrelation ORDER BY PublicRelations_id DESC";
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.post("/api/publicrelations", (req, res) => {
    const { Name, date, Location, details, User_id, Image } = req.body;
    const sql = `INSERT INTO publicrelation (Name, date, Location, details, User_id, Image) VALUES (?, ?, ?, ?, ?, ?)`;
                 
    db.query(sql, [Name, date, Location, details, User_id || 1, Image], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "เพิ่มประชาสัมพันธ์สำเร็จ", PublicRelations_id: result.insertId });
    });
});

app.put("/api/publicrelations/:id", (req, res) => {
    const { Name, date, Location, details, User_id, Image } = req.body;
    const prId = req.params.id;

    const sql = `UPDATE publicrelation SET Name=?, date=?, Location=?, details=?, User_id=?, Image=? WHERE PublicRelations_id=?`;

    db.query(sql, [Name, date, Location, details, User_id || 1, Image, prId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "แก้ไขประชาสัมพันธ์สำเร็จ" });
    });
});

app.delete("/api/publicrelations/:id", (req, res) => {
    const prId = req.params.id;
    const sql = "DELETE FROM publicrelation WHERE PublicRelations_id=?";

    db.query(sql, [prId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }
        res.json({ message: "ลบประชาสัมพันธ์สำเร็จ" });
    });
});

// รัน Server พอร์ต 3001
app.listen(3001, () => {
    console.log("Server running on port 3001");
});