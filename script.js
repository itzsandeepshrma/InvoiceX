const invoiceBody = document.getElementById('invoiceBody');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const grandTotalEl = document.getElementById('grandTotal');

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
  const tax = subtotal * 0.18;
  const grand = subtotal + tax;
  subtotalEl.textContent = subtotal.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  grandTotalEl.textContent = grand.toFixed(2);
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
  localStorage.setItem('invoiceX', JSON.stringify(rows));
}

function loadData() {
  const saved = JSON.parse(localStorage.getItem('invoiceX') || '[]');
  saved.forEach(row => addRow(row.item, row.qty, row.price));
}

function resetInvoice() {
  if (confirm("Are you sure you want to clear the invoice?")) {
    localStorage.removeItem('invoiceX');
    invoiceBody.innerHTML = '';
    calculateInvoice();
  }
}

window.onload = loadData;
