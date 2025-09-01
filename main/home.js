// Hàm logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  window.location.href = "../login/login.html";
}

// Hàm hiển thị danh sách phòng
function renderRooms(rooms) {
  const roomList = document.getElementById("roomList");
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    roomList.innerHTML = "<p>Bạn chưa có phòng nào.</p>";
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  rooms.forEach(room => {
    const div = document.createElement("div");
    div.className = "room-item";

    div.innerHTML = `
      <h3>${room.title}</h3>
      <p>${room.description || "Không có mô tả"}</p>
      <p><strong>Địa chỉ:</strong> ${room.address || "Chưa cập nhật"}</p>
      <p><strong>Diện tích:</strong> ${room.area || 0} m²</p>
      <p><strong>Giá:</strong> ${room.price != null ? room.price.toLocaleString() + " VND" : "Chưa cập nhật"}</p>
      <p><strong>Trạng thái:</strong> ${room.available ? "Còn trống" : "Đã thuê"}</p>
      <small>Ngày tạo: ${new Date(room.created_at).toLocaleDateString()}</small>
    `;

    // Nếu user là owner thì thêm nút xoá/cập nhật
    if (currentUser.role === "owner") {
      const btnDelete = document.createElement("button");
      btnDelete.textContent = "Xoá";
      btnDelete.onclick = () => deleteRoom(room.id);

      const btnEdit = document.createElement("button");
      btnEdit.textContent = "Cập nhật";
      btnEdit.onclick = () => {
        // Lưu thông tin phòng vào localStorage để edit
        localStorage.setItem("editRoom", JSON.stringify(room));
        window.location.href = "editRoom.html"; // chuyển sang trang edit
      };

      // div.appendChild(btnEdit);
      // div.appendChild(btnDelete);
    }

    roomList.appendChild(div);
  });
}

// Hàm tải danh sách phòng
async function loadRooms() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      window.location.href = "../login/login.html";
      return;
    }

    const res = await fetch("http://localhost:5000/api/rooms/all", {
    });

    if (!res.ok) {
      document.getElementById("roomList").innerHTML = "<p>Lỗi tải dữ liệu phòng.</p>";
      return;
    }

    const rooms = await res.json();
    renderRooms(rooms);

  } catch (err) {
    console.error(err);
    document.getElementById("roomList").innerHTML = "<p>Lỗi kết nối tới server.</p>";
  }
}

// Hàm xoá phòng
async function deleteRoom(id) {
  if (!confirm("Bạn có chắc muốn xoá phòng này?")) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:5000/api/rooms/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      loadRooms(); // load lại danh sách
    } else {
      alert(data.message || "Xoá phòng thất bại!");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi kết nối server");
  }
}

// Load khi mở trang
document.addEventListener("DOMContentLoaded", loadRooms);
