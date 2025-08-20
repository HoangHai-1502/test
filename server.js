const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getConnection, sql } = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * API Đăng ký
 */
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  try {
    const pool = await getConnection();

    // kiểm tra username đã tồn tại chưa
    const checkUser = await pool.request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM users WHERE username = @username");

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: "Username đã tồn tại!" });
    }

    // insert user mới
    await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password) //  chưa mã hóa
      .query(
        `INSERT INTO users (username, password, role, create_at) 
         VALUES (@username, @password, 'user', GETDATE())`
      );

    res.json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * API Đăng nhập
 */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .query("SELECT * FROM users WHERE username=@username AND password=@password");

    if (result.recordset.length > 0) {
      res.json({ message: "Đăng nhập thành công!", user: result.recordset[0] });
    } else {
      res.status(401).json({ message: "Sai username hoặc password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

/**
 * API Đăng nhập
 */
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("username", sql.NVarChar, username)   // đổi VarChar -> NVarChar
      .input("password", sql.NVarChar, password)
      .query("SELECT id, username, role, create_at FROM Users WHERE username=@username AND password=@password");

    if (result.recordset.length > 0) {
      res.json({ success: true, user: result.recordset[0] });
    } else {
      res.status(401).json({ success: false, message: "Sai username hoặc password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
