registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!username || !password || !confirmPassword) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      form.reset();
      window.location.href = "../login/login.html";
    } else {
      alert("Lỗi: " + data.message);
    }
  } catch (err) {
    alert("Không thể kết nối server");
  }
});
