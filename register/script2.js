const form = document.getElementById('registerForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!firstName || !lastName || !password || !confirmPassword) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }

  const newAccount = {
    firstName,
    lastName,
    password
  };
  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  accounts.push(newAccount);
  
  localStorage.setItem("accounts", JSON.stringify(accounts));

  alert("Đăng ký thành công!");
  form.reset();

  window.location.href = "../login/login.html";
});

