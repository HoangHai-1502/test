const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { getConnection, sql } = require("./db");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Secret key cho JWT
const JWT_SECRET = "my_secret_key";

// ===== Middleware kiểm tra token =====
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token không hợp lệ" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // gán user info vào request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
}

// ===== API Đăng nhập =====
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password) // ⚠️ demo thôi, thực tế phải hash password
      .query("SELECT id, username, role FROM users WHERE username=@username AND password=@password");

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Sai username hoặc password" });
    }

    const user = result.recordset[0];

    // Tạo JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


/**
 * API Đăng ký
 */
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;

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

    // mặc định role là "user" nếu không truyền
    const userRole = role === "admin" ? "admin" : "user";

    // thêm user vào DB
    await pool.request()
      .input("username", sql.VarChar, username)
      .input("password", sql.VarChar, password)
      .input("role", sql.VarChar, userRole)
      .query("INSERT INTO users (username, password, role) VALUES (@username, @password, @role)");

    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
});


// ===== API Lấy danh sách phòng của user hiện tại =====
app.get("/api/rooms", authMiddleware, async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT id, title, body, status, created_at
        FROM posts
        WHERE user_id = @userId
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// API thêm phòng
app.post("/api/rooms", authMiddleware, async (req, res) => {
  try {
    const { title, body, status, price } = req.body;
    const pool = await getConnection();

    await pool.request()
      .input("title", sql.NVarChar, title)
      .input("body", sql.NVarChar, body)
      .input("status", sql.VarChar, status)
      .input("price", sql.Int, price)
      .input("userId", sql.Int, req.user.id)
      .query(`
        INSERT INTO posts (title, body, status, user_id, created_at)
        VALUES (@title, @body, @status, @userId, GETDATE())
      `);

    res.json({ message: "Thêm phòng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi thêm phòng" });
  }
});

// API cập nhật phòng
app.put("/api/rooms/:id", authMiddleware, async (req, res) => {
  try {
    const { title, body, status, price } = req.body;
    const { id } = req.params;
    const pool = await getConnection();

    await pool.request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .input("title", sql.NVarChar, title)
      .input("body", sql.NVarChar, body)
      .input("status", sql.VarChar, status)
      .input("price", sql.Int, price)
      .query(`
        UPDATE posts
        SET title=@title, body=@body, status=@status
        WHERE id=@id AND user_id=@userId
      `);

    res.json({ message: "Cập nhật phòng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi cập nhật phòng" });
  }
});

// API xoá phòng
app.delete("/api/rooms/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    await pool.request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query("DELETE FROM posts WHERE id=@id AND user_id=@userId");

    res.json({ message: "Xoá phòng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi xoá phòng" });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
