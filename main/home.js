// Hàm logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  window.location.href = "../login/login.html";
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

    const res = await fetch("http://localhost:5000/api/rooms", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    const roomList = document.getElementById("roomList");
    roomList.innerHTML = "";

    if (!res.ok) {
      roomList.innerHTML = "<p>Lỗi tải dữ liệu phòng.</p>";
      return;
    }

    const rooms = await res.json();

    if (rooms.length === 0) {
      roomList.innerHTML = "<p>Bạn chưa có phòng nào.</p>";
      return;
    }

    rooms.forEach(room => {
      const div = document.createElement("div");
      div.className = "room-item";
      div.innerHTML = `
        <h3>${room.title}</h3>
        <p>${room.body || "Không có mô tả"}</p>
        <p><strong>Trạng thái:</strong> ${room.status}</p>
        <small>Ngày tạo: ${new Date(room.created_at).toLocaleDateString()}</small>
      `;
      roomList.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    document.getElementById("roomList").innerHTML =
      "<p>Lỗi kết nối tới server.</p>";
  }
}

// Load khi mở trang
document.addEventListener("DOMContentLoaded", loadRooms);
