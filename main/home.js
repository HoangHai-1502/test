function loadRooms() {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const list = document.getElementById("roomList");

  if (products.length === 0) {
    list.innerHTML = "<p>Chưa có phòng nào được thêm.</p>";
    return;
  }

  list.innerHTML = "";

  products.forEach((room) => {
    const div = document.createElement("div");
    div.className = "room";

    div.innerHTML = `
      <strong>${room.name}</strong>
      <p>Loại phòng: ${room.category}</p>
      <p>Mô tả: ${room.description}</p>
      <p>Giá thuê: ${room.price} VND/ngày</p>
    `;

    list.appendChild(div);
  });
}

function logout() {
  alert("Bạn đã đăng xuất!");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", loadRooms);
