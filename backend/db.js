const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "school"
});

db.connect((err) => {
    if (err) {
        console.log("เชื่อมต่อฐานข้อมูลไม่สำเร็จ", err);
    } else {
        console.log("เชื่อมต่อฐานข้อมูลสำเร็จ");
    }
});

module.exports = db;