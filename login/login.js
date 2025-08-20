const form = document.getElementById('loginForm');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

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

      // 👉 lưu user vào localStorage nếu cần
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      // chuyển sang trang chính
      window.location.href = "../main/index2.html";
    } else {
      alert("Sai thông tin đăng nhập!");
    }
  } catch (err) {
    alert("Không thể kết nối server");
  }
});
