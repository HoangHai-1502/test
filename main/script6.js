let editingIndex = -1;
let editingId = null; // lưu id khi edit
let rooms = [];

// Lấy token từ localStorage (giả sử bạn lưu token sau khi login)
const token = localStorage.getItem("token");

// Hàm fetch danh sách phòng
async function fetchRooms() {
  try {
    const res = await fetch("http://localhost:5000/api/rooms", {
      headers: { Authorization: `Bearer ${token}` }
    });
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
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;

  if (!name || !category || !description || !price) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  const room = {
    title: name,
    body: description,
    status: category,
    price: parseInt(price)
  };

  try {
    if (editingIndex === -1) {
      // Thêm mới
      const res = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(room)
      });
      const data = await res.json();
      showMessage(data.message);
    } else {
      // Cập nhật
      const res = await fetch(`http://localhost:5000/api/rooms/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(room)
      });
      const data = await res.json();
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

// Hàm sửa phòng
function editRoom(index) {
  const r = rooms[index];
  document.getElementById("name").value = r.title;
  document.getElementById("category").value = r.status;
  document.getElementById("description").value = r.body;
  document.getElementById("price").value = r.price;
  editingIndex = index;
  editingId = r.id;
  document.getElementById("submitBtn").innerText = "Lưu";
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
      Loại phòng: ${r.status}<br>
      Mô tả: ${r.body}<br>
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
fetchRooms();
