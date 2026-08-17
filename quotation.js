function money(value) {
  return "£" + Number(value || 0).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function makeQuoteNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(100 + Math.random() * 900);
  return `QT-${y}${m}${d}-${random}`;
}

function addWork(description = "", price = "") {
  const body = document.getElementById("workBody");
  const row = document.createElement("tr");
  const number = body.children.length + 1;

  row.innerHTML = `
    <td class="row-number">${number}</td>
    <td>
      <textarea class="work-description" rows="6" placeholder="Enter description of work">${escapeHtml(description)}</textarea>
    </td>
    <td class="price-column">
      <input class="price-input" type="number" min="0" step="0.01"
             placeholder="Optional" value="${price}">
    </td>
    <td class="remove-column no-print">
      <button class="remove-btn" onclick="removeWork(this)">×</button>
    </td>
  `;

  body.appendChild(row);

  row.querySelector(".price-input").addEventListener("input", calculateTotal);
  renumberRows();
  calculateTotal();
}

function removeWork(button) {
  const rows = document.querySelectorAll("#workBody tr");
  if (rows.length <= 1) return;

  button.closest("tr").remove();
  renumberRows();
  calculateTotal();
}

function renumberRows() {
  document.querySelectorAll("#workBody tr").forEach((row, index) => {
    row.querySelector(".row-number").textContent = index + 1;
  });
}

function calculateTotal() {
  const manual = parseFloat(document.getElementById("manualTotal").value);

  if (!Number.isNaN(manual) && manual >= 0) {
    document.getElementById("grandTotal").textContent = money(manual);
    return;
  }

  let total = 0;
  document.querySelectorAll(".price-input").forEach(input => {
    const value = parseFloat(input.value);
    if (!Number.isNaN(value)) total += value;
  });

  document.getElementById("grandTotal").textContent = money(total);
}

function togglePriceColumns() {
  const checked = document.getElementById("showItemPrices").checked;
  document.body.classList.toggle("show-prices", checked);
}

function saveQuotation() {
  const data = {
    quoteNo: document.getElementById("quoteNo").value,
    quoteDate: document.getElementById("quoteDate").value,
    validUntil: document.getElementById("validUntil").value,
    clientName: document.getElementById("clientName").value,
    clientAddress: document.getElementById("clientAddress").value,
    clientContact: document.getElementById("clientContact").value,
    projectAddress: document.getElementById("projectAddress").value,
    projectName: document.getElementById("projectName").value,
    introText: document.getElementById("introText").value,
    notes: document.getElementById("notes").value,
    duration: document.getElementById("duration").value,
    manualTotal: document.getElementById("manualTotal").value,
    showItemPrices: document.getElementById("showItemPrices").checked,
    items: [...document.querySelectorAll("#workBody tr")].map(row => ({
      description: row.querySelector(".work-description").value,
      price: row.querySelector(".price-input").value
    }))
  };

  localStorage.setItem("perfectBuilderQuotation", JSON.stringify(data));
  alert("Quotation saved on this computer.");
}

function loadQuotation() {
  const raw = localStorage.getItem("perfectBuilderQuotation");
  if (!raw) return;

  const data = JSON.parse(raw);

  const fields = [
    "quoteNo", "quoteDate", "validUntil", "clientName",
    "clientAddress", "clientContact", "projectAddress",
    "projectName", "introText", "notes", "duration", "manualTotal"
  ];

  fields.forEach(id => {
    if (data[id] !== undefined) {
      document.getElementById(id).value = data[id];
    }
  });

  document.getElementById("showItemPrices").checked = !!data.showItemPrices;
  togglePriceColumns();

  document.getElementById("workBody").innerHTML = "";
  if (data.items && data.items.length) {
    data.items.forEach(item => addWork(item.description, item.price));
  } else {
    addWork();
  }

  calculateTotal();
}

function newQuotation() {
  if (!confirm("Start a new quotation?")) return;

  localStorage.removeItem("perfectBuilderQuotation");

  document.getElementById("quoteNo").value = makeQuoteNumber();
  document.getElementById("quoteDate").value = today();
  document.getElementById("validUntil").value = "";
  document.getElementById("clientName").value = "";
  document.getElementById("clientAddress").value = "";
  document.getElementById("clientContact").value = "";
  document.getElementById("projectAddress").value = "";
  document.getElementById("projectName").value = "";
  document.getElementById("notes").value = "";
  document.getElementById("manualTotal").value = "";
  document.getElementById("workBody").innerHTML = "";
  document.getElementById("showItemPrices").checked = false;
  togglePriceColumns();
  addWork();
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("quoteNo").value = makeQuoteNumber();
  document.getElementById("quoteDate").value = today();

  document.getElementById("manualTotal").addEventListener("input", calculateTotal);

  addWork();
  loadQuotation();
  calculateTotal();
});


function cleanEmptyForPrint(){
  document.querySelectorAll("input, textarea").forEach(el=>{
    const value=(el.value||"").trim();
    const parent=el.closest(".info-box, .date-box, .ref, .note-section, .note-box, .manual-total-wrap");
    if(!value && parent){
      parent.classList.add("print-empty");
    }
  });

  // Empty work rows should never appear on the printed document.
  document.querySelectorAll("#workBody tr").forEach(row=>{
    const desc=row.querySelector(".work-description");
    if(!desc || !(desc.value||"").trim()) {
      row.classList.add("print-empty");
    }
  });

  // Hide empty individual input cells without affecting the table.
  document.querySelectorAll(".item-description, .work-description").forEach(input=>{
    const cell=input.closest("td");
    if(cell && !(input.value||"").trim()) cell.classList.add("print-empty-cell");
  });
}

function restoreAfterPrint(){
  document.querySelectorAll(".print-empty").forEach(el=>el.classList.remove("print-empty"));
  document.querySelectorAll(".print-empty-cell").forEach(el=>el.classList.remove("print-empty-cell"));
}

window.addEventListener("beforeprint", cleanEmptyForPrint);
window.addEventListener("afterprint", restoreAfterPrint);

window.addEventListener("afterprint",()=>{
  document.querySelectorAll(".print-hide-row").forEach(r=>r.classList.remove("print-hide-row"));
});
