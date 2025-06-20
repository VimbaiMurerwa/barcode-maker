const productSelect = document.getElementById("productSelect");
const barcodeArea = document.getElementById("barcodeArea");
const newProductName = document.getElementById("newProductName");
const searchInput = document.getElementById("searchInput");

// Load products from localStorage or default fruits
let products = JSON.parse(localStorage.getItem("products")) || [
  "Apple 1kg",
  "Apple 500g",
  "Banana 1kg",
  "Banana 500g",
  "Orange 1kg",
  "Orange 500g",
  "Mango 1kg",
  "Mango 500g",
  "Grapes 1kg",
  "Grapes 500g"
];

// Render product dropdown
function renderProducts(filter = "") {
  productSelect.innerHTML = "";
  const filtered = products.filter(p => p.toLowerCase().includes(filter.toLowerCase()));
  filtered.forEach(product => {
    const option = document.createElement("option");
    option.value = product;
    option.textContent = product;
    productSelect.appendChild(option);
  });
}

// Render edit product dropdown
function renderEditProducts() {
  const editSelect = document.getElementById("editProductSelect");
  editSelect.innerHTML = "";
  
  products.forEach(product => {
    const option = document.createElement("option");
    option.value = product;
    option.textContent = product;
    editSelect.appendChild(option);
  });
}

// Search input
searchInput.addEventListener("input", () => {
  renderProducts(searchInput.value);
});

// Add product
function addProduct() {
  const name = newProductName.value.trim();
  if (name && !products.includes(name)) {
    products.push(name);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    renderEditProducts(); 
    newProductName.value = "";
    alert("Product added!");
  } else {
    alert("Product already exists or input is invalid");
  }
}

// Edit product function
function editProduct() {
  const editSelect = document.getElementById("editProductSelect");
  const newName = document.getElementById("editProductName").value.trim();
  
  if (!editSelect.value) return alert("Please select a product to edit");
  if (!newName) return alert("Please enter a new product name");
  if (products.includes(newName)) return alert("Product name already exists");
  
  const index = products.indexOf(editSelect.value);
  products[index] = newName;
  localStorage.setItem("products", JSON.stringify(products));
  
  // Update all dropdowns
  renderProducts();
  renderEditProducts();
  
  // Clear input
  document.getElementById("editProductName").value = "";
  alert("Product updated successfully!");
}

// Delete product function
function deleteProduct() {
  const editSelect = document.getElementById("editProductSelect");
  
  if (!editSelect.value) return alert("Please select a product to delete");
  
  if (confirm(`Are you sure you want to delete "${editSelect.value}"?`)) {
    const index = products.indexOf(editSelect.value);
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    
    // Update all dropdowns
    renderProducts();
    renderEditProducts();
    
    alert("Product deleted successfully!");
  }
}

// Generate EAN-13 code from product name
function generateEAN13FromString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash += text.charCodeAt(i);
  }
  let code = "200" + hash.toString().padStart(9, "0").slice(0, 9);
  return code;
}

// Generate barcode
function generateBarcode() {
  const product = productSelect.value;
  if (!product) return alert("Please select a product");

  const code = generateEAN13FromString(product);

  // Clear the placeholder text
  barcodeArea.innerHTML = "";
  
  // Create SVG element with explicit dimensions
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "300");
  svg.setAttribute("height", "150");
  
  // Generate barcode
  JsBarcode(svg, code, {
    format: "EAN13",
    displayValue: true,
    fontSize: 18,
    width: 2,
    height: 60,
    margin: 10
  });

  barcodeArea.appendChild(svg);


  const actions = document.querySelector(".barcode-actions");
  if (actions) actions.style.display = "block";
}

// Download barcode as PNG
function downloadBarcode() {
  const svg = document.querySelector("#barcodeArea svg");
  if (!svg) return alert("Please generate a barcode first");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const data = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  
  // Set canvas dimensions
  canvas.width = svg.width.baseVal.value;
  canvas.height = svg.height.baseVal.value;
  
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    const png = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${productSelect.value.replace(/\s+/g, '_')}_barcode.png`;
    link.href = png;
    link.click();
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
}

// Print barcode
function printBarcode() {
  const svg = document.querySelector("#barcodeArea svg");
  if (!svg) return alert("Please generate a barcode first");

  const win = window.open();
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print Barcode</title>
      <style>
        body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        svg { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      ${svg.outerHTML}
    </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// Zoom barcode
function zoomBarcode() {
  const svg = document.querySelector("#barcodeArea svg");
  if (!svg) return alert("Please generate a barcode first");

  const zoomContainer = document.getElementById("zoomedBarcode");
  zoomContainer.innerHTML = "";
  const zoomedSvg = svg.cloneNode(true);
  zoomedSvg.setAttribute("width", "400");
  zoomContainer.appendChild(zoomedSvg);

  document.getElementById("zoomModal").style.display = "block";
}

function closeZoom() {
  document.getElementById("zoomModal").style.display = "none";
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("generateBtn").addEventListener("click", generateBarcode);
  renderProducts();
  renderEditProducts();
});