const form = document.getElementById('loginForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const password = document.getElementById('password').value;

  if (!firstName || !lastName || !password) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  const found = accounts.find(acc =>
    acc.firstName === firstName &&
    acc.lastName === lastName &&
    acc.password === password
  );

  if (found) {
    alert("Đăng nhập thành công!");
     window.location.href = "../main/index2.html";

  } else {
    alert("Sai thông tin đăng nhập!");
  }
});
