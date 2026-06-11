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