let products = JSON.parse(localStorage.getItem("products")) || [];
let editingIndex = -1;

function addProduct() {
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;

  if (!name || !category || !description || !price) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  const product = { name, category, description, price };

  if (editingIndex === -1) {
    products.push(product);
  } else {
    products[editingIndex] = product;
    editingIndex = -1;
    document.querySelector("button").innerText = "Thêm";
  }

  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
  clearForm();
}

function editProduct(index) {
  const p = products[index];
  document.getElementById("name").value = p.name;
  document.getElementById("category").value = p.category;
  document.getElementById("description").value = p.description;
  document.getElementById("price").value = p.price;
  editingIndex = index;
  document.querySelector("button").innerText = "Lưu";
}
function deleteProduct(index) {
  products.splice(index, 1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
}

function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = "";

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const div = document.createElement("div");
    div.className = "product";

    div.innerHTML = `
      <strong>${p.name}</strong><br>
      Danh mục: ${p.category}<br>
      Mô tả: ${p.description}<br>
      Giá bán: ${p.price} VND<br>
      <button onclick="editProduct(${i})">Sửa</button>
      <button onclick="deleteProduct(${i})">Xoá</button>
    `;

    list.appendChild(div);
  }
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";
  document.getElementById("price").value = "";
  document.querySelector("button").innerText = "Thêm";
}
function logout() {
    alert("Bạn đã đăng xuất!");
    window.location.href = "login.html";
  }
renderProducts();
