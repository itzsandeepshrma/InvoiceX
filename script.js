const invoiceBody = document.getElementById('invoiceBody');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const grandTotalEl = document.getElementById('grandTotal');
const gstInput = document.getElementById('gstRate');

function addRow(item = '', qty = 1, price = 0) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><input type="text" value="${item}" oninput="saveData()"></td>
    <td><input type="number" value="${qty}" min="1" oninput="updateTotal(this); saveData()"></td>
    <td><input type="number" value="${price}" min="0" step="0.01" oninput="updateTotal(this); saveData()"></td>
    <td class="lineTotal">0.00</td>
    <td><button onclick="deleteRow(this)">❌</button></td>
  `;
  invoiceBody.appendChild(row);
  updateTotal(row.querySelector('input[type="number"]'));
}

function updateTotal(input) {
  const row = input.closest('tr');
  const qty = parseFloat(row.children[1].querySelector('input').value) || 0;
  const price = parseFloat(row.children[2].querySelector('input').value) || 0;
  const total = qty * price;
  row.querySelector('.lineTotal').textContent = total.toFixed(2);
  calculateInvoice();
}

function calculateInvoice() {
  let subtotal = 0;
  document.querySelectorAll('.lineTotal').forEach(td => {
    subtotal += parseFloat(td.textContent);
  });
  const gstRate = parseFloat(gstInput.value) || 0;
  const tax = subtotal * (gstRate / 100);
  const grand = subtotal + tax;
  subtotalEl.textContent = subtotal.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  grandTotalEl.textContent = grand.toFixed(2);
  saveData();
}

function deleteRow(btn) {
  btn.closest('tr').remove();
  calculateInvoice();
  saveData();
}

function saveData() {
  const rows = [];
  invoiceBody.querySelectorAll('tr').forEach(tr => {
    const inputs = tr.querySelectorAll('input');
    rows.push({
      item: inputs[0].value,
      qty: inputs[1].value,
      price: inputs[2].value
    });
  });
  const gstRate = gstInput.value || 18;
  localStorage.setItem('invoiceX', JSON.stringify({ rows, gstRate }));
}

function loadData() {
  const saved = JSON.parse(localStorage.getItem('invoiceX') || '{}');
  if (saved.rows) saved.rows.forEach(row => addRow(row.item, row.qty, row.price));
  if (saved.gstRate) gstInput.value = saved.gstRate;
  calculateInvoice();
}

function resetInvoice() {
  if (confirm("Clear invoice?")) {
    localStorage.removeItem('invoiceX');
    invoiceBody.innerHTML = '';
    gstInput.value = 18;
    calculateInvoice();
  }
}

function downloadPDF() {
  const element = document.getElementById('invoiceContent');
  html2pdf().set({
    margin: 0.5,
    filename: 'InvoiceX.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }).from(element).save();
}

function exportExcel() {
  const wb = XLSX.utils.book_new();
  const rows = [["Item", "Qty", "Price", "Total"]];
  invoiceBody.querySelectorAll('tr').forEach(tr => {
    const inputs = tr.querySelectorAll('input');
    const item = inputs[0].value;
    const qty = parseFloat(inputs[1].value);
    const price = parseFloat(inputs[2].value);
    const total = qty * price;
    rows.push([item, qty, price, total]);
  });
  rows.push(["", "", "Subtotal", subtotalEl.textContent]);
  rows.push(["", "", "Tax", taxEl.textContent]);
  rows.push(["", "", "Grand Total", grandTotalEl.textContent]);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Invoice");
  XLSX.writeFile(wb, "InvoiceX.xlsx");
}

function toggleTheme() {
  document.body.classList.toggle('light');
}

window.onload = loadData;
