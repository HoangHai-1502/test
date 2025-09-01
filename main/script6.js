let editingIndex = -1;
let editingId = null; // lưu id khi edit
let rooms = [];

// Lấy token từ localStorage
const token = localStorage.getItem("token");

// Hàm fetch danh sách phòng
async function fetchRooms() {
  try {
    const res = await fetch("http://localhost:5000/api/rooms", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      showMessage("Lỗi khi tải danh sách phòng");
      return;
    }

    rooms = await res.json();
    renderRooms();
  } catch (err) {
    console.error(err);
    showMessage("Lỗi khi tải danh sách phòng");
  }
}

// Hàm thêm hoặc lưu phòng
async function addRoom() {
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const status = document.getElementById("status").value === "true"; // boolean
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;

  if (!name || !category || !description || !price) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  const room = {
    title: name,
    description: description,
    available: status,
    category: category, // mới, cần thêm cột category vào DB nếu muốn lưu
    price: parseFloat(price)
  };

  try {
    let res, data;
    if (editingIndex === -1) {
      res = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(room)
      });
      data = await res.json();
      showMessage(data.message);
    } else {
      res = await fetch(`http://localhost:5000/api/rooms/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(room)
      });
      data = await res.json();
      showMessage(data.message);
      editingIndex = -1;
      editingId = null;
      document.getElementById("submitBtn").innerText = "Thêm phòng";
    }

    clearForm();
    fetchRooms();
  } catch (err) {
    console.error(err);
    showMessage("Lỗi server khi thao tác phòng");
  }
}

// Sửa phòng
function editRoom(index) {
  const r = rooms[index];
  document.getElementById("name").value = r.title;
  document.getElementById("category").value = r.category || "đơn";
  document.getElementById("status").value = r.available ? "true" : "false";
  document.getElementById("description").value = r.description;
  document.getElementById("price").value = r.price;
  editingIndex = index;
  editingId = r.id;
  document.getElementById("submitBtn").innerText = "Lưu";
}

// Render danh sách phòng
function renderRooms() {
  const list = document.getElementById("roomList");
  list.innerHTML = "";

  if (rooms.length === 0) {
    list.innerHTML = "<p>Chưa có phòng nào.</p>";
    return;
  }

  rooms.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <strong>${r.title}</strong><br>
      Loại: ${r.category || "-"}<br>
      Trạng thái: ${r.available ? "Còn trống" : "Đã thuê"}<br>
      Mô tả: ${r.description}<br>
      Giá thuê: ${r.price} VND<br>
      <button onclick="editRoom(${i})">Sửa</button>
      <button onclick="deleteRoom(${i})">Xoá</button>
    `;
    list.appendChild(div);
  });
}

// Hàm xoá phòng
async function deleteRoom(index) {
  if (!confirm("Bạn có chắc muốn xoá phòng này?")) return;

  const id = rooms[index].id;

  try {
    const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    showMessage(data.message);
    fetchRooms();
  } catch (err) {
    console.error(err);
    showMessage("Lỗi server khi xoá phòng");
  }
}

// Render danh sách phòng
function renderRooms() {
  const list = document.getElementById("roomList");
  list.innerHTML = "";

  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <strong>${r.title}</strong><br>
      Loại: ${r.category || "-"}<br>
      Trạng thái: ${r.available ? "Còn trống" : "Đã thuê"}<br>
      Mô tả: ${r.description}<br>
      Giá thuê: ${r.price} VND<br>
      <button onclick="editRoom(${i})">Sửa</button>
      <button onclick="deleteRoom(${i})">Xoá</button>
    `;

    list.appendChild(div);
  }
}

// Xoá dữ liệu trong form
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";
  document.getElementById("price").value = "";
  document.getElementById("submitBtn").innerText = "Thêm phòng";
}

// Hiển thị thông báo
function showMessage(msg) {
  const messageEl = document.getElementById("message");
  messageEl.innerText = msg;
  setTimeout(() => { messageEl.innerText = ""; }, 3000);
}

// Đăng xuất
function logout() {
  alert("Bạn đã đăng xuất!");
  localStorage.removeItem("token");
  window.location.href = "../login/login.html";
}

// Khi load trang
document.addEventListener("DOMContentLoaded", fetchRooms);
