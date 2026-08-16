const itemsEl=document.getElementById("items");
const receivedEl=document.getElementById("receivedPayment");
const vatRateEl=document.getElementById("vatRate");
let currentId=null;

function money(n){return "£"+Number(n||0).toFixed(2)}

function addItem(data={description:"",qty:1,unit:0}){
  const tr=document.createElement("tr");
  tr.innerHTML=`
    <td><input class="item-desc" placeholder="Description of work" value="${esc(data.description)}"></td>
    <td><input class="qty" type="number" min="0" step="1" value="${Number(data.qty??1)}"></td>
    <td><input class="unit" type="number" min="0" step="0.01" value="${Number(data.unit??0)}"></td>
    <td class="line-total">£0.00</td>
    <td class="no-print"><button class="delete" onclick="this.closest('tr').remove();calc()">×</button></td>`;
  itemsEl.appendChild(tr);
  tr.querySelectorAll("input").forEach(i=>i.addEventListener("input",calc));
  calc();
}

function calc(){
  let subtotal=0;
  itemsEl.querySelectorAll("tr").forEach(tr=>{
    const q=Number(tr.querySelector(".qty").value)||0;
    const u=Number(tr.querySelector(".unit").value)||0;
    const total=q*u;
    tr.querySelector(".line-total").textContent=money(total);
    subtotal+=total;
  });
  const vatRate=Number(vatRateEl.value)||0;
  const vat=subtotal*vatRate/100;
  const total=subtotal+vat;
  const received=Number(receivedEl.value)||0;
  const remaining=Math.max(total-received,0);

  document.getElementById("projectTotal").textContent=money(total);
  document.getElementById("subtotal").textContent=money(subtotal);
  document.getElementById("vatAmount").textContent=money(vat);
  document.getElementById("remainingBalance").textContent=money(remaining);
  document.getElementById("totalDue").textContent=money(remaining);
}

function esc(v){
  return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
}

function collect(){
  return {
    id:currentId||Date.now().toString(),
    invoiceNo:document.getElementById("invoiceNo").textContent,
    date:document.getElementById("invoiceDate").value,
    time:document.getElementById("invoiceTime").value,
    customerName:document.getElementById("customerName").value,
    customerAddress:document.getElementById("customerAddress").value,
    customerEmail:document.getElementById("customerEmail").value,
    customerPhone:document.getElementById("customerPhone").value,
    projectAddress:document.getElementById("projectAddress").value,
    received:Number(receivedEl.value)||0,
    vat:Number(vatRateEl.value)||0,
    items:[...itemsEl.querySelectorAll("tr")].map(tr=>({
      description:tr.querySelector(".item-desc").value,
      qty:Number(tr.querySelector(".qty").value)||0,
      unit:Number(tr.querySelector(".unit").value)||0
    }))
  };
}

function saveInvoice(){
  const data=collect();
  const all=JSON.parse(localStorage.getItem("perfectBuilderInvoices")||"[]");
  const idx=all.findIndex(x=>x.id===data.id);
  if(idx>=0) all[idx]=data; else all.unshift(data);
  localStorage.setItem("perfectBuilderInvoices",JSON.stringify(all));
  currentId=data.id;
  alert("Invoice saved successfully.");
}

function loadInvoice(data){
  currentId=data.id;
  document.getElementById("invoiceNo").textContent=data.invoiceNo;
  document.getElementById("invoiceDate").value=data.date||"";
  document.getElementById("invoiceTime").value=data.time||"";
  document.getElementById("customerName").value=data.customerName||"";
  document.getElementById("customerAddress").value=data.customerAddress||"";
  document.getElementById("customerEmail").value=data.customerEmail||"";
  document.getElementById("customerPhone").value=data.customerPhone||"";
  document.getElementById("projectAddress").value=data.projectAddress||"";
  receivedEl.value=data.received||0;
  vatRateEl.value=data.vat||0;
  itemsEl.innerHTML="";
  (data.items?.length?data.items:[{}]).forEach(addItem);
  calc();
  closeSaved();
  window.scrollTo({top:0,behavior:"smooth"});
}

function newInvoice(){
  if(!confirm("Start a new invoice? Unsaved changes will be cleared.")) return;
  currentId=null;
  const all=JSON.parse(localStorage.getItem("perfectBuilderInvoices")||"[]");
  const next=all.length+1;
  document.getElementById("invoiceNo").textContent="INV-"+String(next).padStart(4,"0");
  const d=new Date();
  document.getElementById("invoiceDate").value=d.toISOString().slice(0,10);
  document.getElementById("invoiceTime").value=d.toTimeString().slice(0,5);
  ["customerName","customerAddress","customerEmail","customerPhone","projectAddress"].forEach(id=>document.getElementById(id).value="");
  receivedEl.value=0; vatRateEl.value=0; itemsEl.innerHTML=""; addItem();
}

function showSaved(){
  renderSaved();
  document.getElementById("savedModal").style.display="block";
}
function closeSaved(){document.getElementById("savedModal").style.display="none"}

function renderSaved(){
  const q=(document.getElementById("searchSaved").value||"").toLowerCase();
  const all=JSON.parse(localStorage.getItem("perfectBuilderInvoices")||"[]");
  const filtered=all.filter(x=>
    String(x.customerName).toLowerCase().includes(q) ||
    String(x.invoiceNo).toLowerCase().includes(q) ||
    String(x.projectAddress).toLowerCase().includes(q)
  );
  const box=document.getElementById("savedList");
  if(!filtered.length){box.innerHTML="<p>No saved invoices found.</p>";return}
  box.innerHTML=filtered.map(x=>`
    <div class="saved-row">
      <div class="saved-info"><b>${esc(x.invoiceNo)}</b><br>${esc(x.customerName||"No customer")}<br>${esc(x.date||"")}</div>
      <div class="saved-actions"><button onclick='loadInvoice(${JSON.stringify(x)})'>Open</button>
      <button onclick='deleteInvoice("${esc(x.id)}")' style="background:#d9534f;color:white">Delete</button></div>
    </div>`).join("");
}
function deleteInvoice(id){
  if(!confirm("Delete this saved invoice?"))return;
  const all=JSON.parse(localStorage.getItem("perfectBuilderInvoices")||"[]").filter(x=>x.id!==id);
  localStorage.setItem("perfectBuilderInvoices",JSON.stringify(all));
  renderSaved();
}

receivedEl.addEventListener("input",calc);
vatRateEl.addEventListener("input",calc);

(function init(){
  const d=new Date();
  document.getElementById("invoiceDate").value=d.toISOString().slice(0,10);
  document.getElementById("invoiceTime").value=d.toTimeString().slice(0,5);
  const all=JSON.parse(localStorage.getItem("perfectBuilderInvoices")||"[]");
  document.getElementById("invoiceNo").textContent="INV-"+String(all.length+1).padStart(4,"0");
  addItem();
})();
