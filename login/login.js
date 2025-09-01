const form = document.getElementById('loginForm');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);

      // 👉 Lưu token và user vào localStorage
      
      localStorage.setItem("token", data.token);   // JWT
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // Chuyển sang trang chính
      if (data.user.role === "admin") {
        window.location.href = "../main/index2.html";   // admin
      } else {
        window.location.href = "../main/home.html";  // user
      }

    } else {
      alert(data.message || "Sai thông tin đăng nhập!");
    }
  } catch (err) {
    alert("Không thể kết nối server");
  }
});
