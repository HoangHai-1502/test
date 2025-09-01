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

// API Đăng nhập
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await getConnection();

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .query(`
        SELECT a.id AS authId, a.username, a.email, u.id AS userId, u.fullname, u.role
        FROM Auth a
        JOIN users u ON a.userid = u.id
        WHERE a.username=@username AND a.password=@password
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Sai username hoặc password" });
    }

    const user = result.recordset[0];

    const token = jwt.sign(
      { id: user.userId, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.userId,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


app.post("/api/register", async (req, res) => {
  const { fullname, phone, username, email, password, role } = req.body;

  if (!username || !password || !fullname) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  try {
    const pool = await getConnection();

    // kiểm tra username hoặc email đã tồn tại chưa
    const checkUser = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM Auth WHERE username=@username OR email=@email");

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: "Username hoặc email đã tồn tại!" });
    }

    // Thêm vào bảng users
    const insertUser = await pool.request()
      .input("fullname", sql.NVarChar, fullname)
      .input("phone", sql.NVarChar, phone || null)
      .input("role", sql.NVarChar, role === "owner" ? "owner" : "renter")
      .query("INSERT INTO users (fullname, phone, role, created_at) OUTPUT INSERTED.id VALUES (@fullname, @phone, @role, GETDATE())");

    const userId = insertUser.recordset[0].id;

    // Thêm vào bảng Auth
    await pool.request()
      .input("userid", sql.Int, userId)
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, password)
      .query("INSERT INTO Auth (userid, username, email, password) VALUES (@userid, @username, @email, @password)");

    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
});



app.get("/api/rooms", authMiddleware, async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("ownerId", sql.Int, req.user.id)
      .query(`
        SELECT r.id, r.title, r.description, r.address, r.price, r.area, r.available, r.category, r.created_at
        FROM rooms r
        WHERE r.owner_id=@ownerId
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


app.post("/api/rooms", authMiddleware, async (req, res) => {
  try {
    const { title, description, address, price, area, available, category } = req.body;
    const pool = await getConnection();

    await pool.request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("address", sql.NVarChar, address || "")
      .input("price", sql.Decimal(18,2), price)
      .input("area", sql.Float, area || 0)
      .input("available", sql.Bit, available ? 1 : 0)
      .input("category", sql.NVarChar, category || "đơn")
      .input("ownerId", sql.Int, req.user.id)
      .query(`
        INSERT INTO rooms (owner_id, title, description, address, price, area, available, category, created_at)
        VALUES (@ownerId, @title, @description, @address, @price, @area, @available, @category, GETDATE())
      `);

    res.json({ message: "Thêm phòng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi thêm phòng" });
  }
});


app.put("/api/rooms/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, address, price, area, available, category } = req.body;
    const { id } = req.params;
    const pool = await getConnection();

    await pool.request()
      .input("id", sql.Int, id)
      .input("ownerId", sql.Int, req.user.id)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("address", sql.NVarChar, address || "")
      .input("price", sql.Decimal(18,2), price)
      .input("area", sql.Float, area || 0)
      .input("available", sql.Bit, available ? 1 : 0)
      .input("category", sql.NVarChar, category || "đơn")
      .query(`
        UPDATE rooms
        SET title=@title, description=@description, address=@address, price=@price, area=@area, available=@available, category=@category
        WHERE id=@id AND owner_id=@ownerId
      `);

    res.json({ message: "Cập nhật phòng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi cập nhật phòng" });
  }
});

app.delete("/api/rooms/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    await pool.request()
      .input("id", sql.Int, id)
      .input("ownerId", sql.Int, req.user.id)
      .query("DELETE FROM rooms WHERE id=@id AND owner_id=@ownerId");

    res.json({ message: "Xoá phòng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi xoá phòng" });
  }
});

//lấy tất cả phòng hiện có
app.get("/api/rooms/all", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT r.id, r.title, r.description, r.address, r.price, r.area, r.available, r.category, r.created_at
        FROM rooms r
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
