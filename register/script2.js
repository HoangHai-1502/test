const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const fullname = document.getElementById('fullname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const role = document.querySelector('input[name="role"]:checked')?.value;

  // kiểm tra thông tin bắt buộc
  if (!fullname || !username || !email || !password || !confirmPassword || !role) {
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
      body: JSON.stringify({ fullname, phone, email, username, password, role })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      registerForm.reset();
      window.location.href = "../login/login.html";
    } else {
      alert("Lỗi: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Không thể kết nối server");
  }
});
