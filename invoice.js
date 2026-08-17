(() => {
"use strict";

const $ = id => document.getElementById(id);
const KEY = "perfectBuilderInvoiceProfessionalV4";

function money(n){
  return "£" + Number(n || 0).toLocaleString("en-GB", {
    minimumFractionDigits:2, maximumFractionDigits:2
  });
}
function today(){
  const d=new Date();
  return d.toISOString().slice(0,10);
}
function invoiceNumber(){
  const d=new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${Math.floor(100+Math.random()*900)}`;
}
function num(v){
  const n=parseFloat(String(v ?? "").replace(/,/g,"").replace(/[£\s]/g,""));
  return Number.isFinite(n) && n>0 ? n : 0;
}

function calculateRemaining(){
  const total=num($("invoiceTotal").value);
  const paid=num($("paidNow").value);
  const remaining=Math.max(total-paid,0);

  $("remaining").textContent=money(remaining);

  if(total===0){
    $("status").textContent="Enter the total invoice amount.";
  }else if(paid>=total){
    $("status").textContent="PAYMENT STATUS: PAID IN FULL";
  }else if(paid>0){
    $("status").textContent="PAYMENT STATUS: PART PAYMENT — "+money(remaining)+" REMAINING";
  }else{
    $("status").textContent="PAYMENT STATUS: AMOUNT DUE — "+money(total)+" REMAINING";
  }
}

function addItem(description=""){
  const tr=document.createElement("tr");
  tr.innerHTML=`
    <td class="row-number" style="text-align:center"></td>
    <td><input class="item-description" placeholder="Description of work / item" value="${String(description).replaceAll('"',"&quot;")}"></td>
    <td class="remove no-print"><button class="remove-btn" type="button">×</button></td>
  `;
  $("itemsBody").appendChild(tr);
  tr.querySelector(".remove-btn").onclick=()=>{
    const rows=$("itemsBody").querySelectorAll("tr");
    if(rows.length>1){tr.remove(); renumber();}
  };
  renumber();
}
function renumber(){
  $("itemsBody").querySelectorAll("tr").forEach((r,i)=>{
    r.querySelector(".row-number").textContent=i+1;
  });
}

function saveInvoice(){
  const data={
    invoiceNo:$("invoiceNo").value,
    invoiceDate:$("invoiceDate").value,
    clientName:$("clientName").value,
    clientAddress:$("clientAddress").value,
    clientContact:$("clientContact").value,
    projectAddress:$("projectAddress").value,
    projectName:$("projectName").value,
    invoiceTotal:$("invoiceTotal").value,
    paidNow:$("paidNow").value,
    note:$("note").value,
    items:[...$("itemsBody").querySelectorAll(".item-description")].map(x=>x.value)
  };
  localStorage.setItem(KEY,JSON.stringify(data));
  alert("Invoice saved on this computer.");
}

function loadInvoice(){
  const raw=localStorage.getItem(KEY);
  if(!raw){addItem(); return;}
  try{
    const d=JSON.parse(raw);
    $("invoiceNo").value=d.invoiceNo||invoiceNumber();
    $("invoiceDate").value=d.invoiceDate||today();
    $("clientName").value=d.clientName||"";
    $("clientAddress").value=d.clientAddress||"";
    $("clientContact").value=d.clientContact||"";
    $("projectAddress").value=d.projectAddress||"";
    $("projectName").value=d.projectName||"";
    $("invoiceTotal").value=d.invoiceTotal||"";
    $("paidNow").value=d.paidNow||"";
    $("note").value=d.note||"";
    $("itemsBody").innerHTML="";
    if(Array.isArray(d.items)&&d.items.length) d.items.forEach(x=>addItem(x||""));
    else addItem();
  }catch(e){
    localStorage.removeItem(KEY);
    addItem();
  }
}

function newInvoice(){
  if(!confirm("Start a new invoice?")) return;
  localStorage.removeItem(KEY);
  $("invoiceNo").value=invoiceNumber();
  $("invoiceDate").value=today();
  $("clientName").value="";
  $("clientAddress").value="";
  $("clientContact").value="";
  $("projectAddress").value="";
  $("projectName").value="";
  $("invoiceTotal").value="";
  $("paidNow").value="";
  $("note").value="";
  $("itemsBody").innerHTML="";
  addItem();
  calculateRemaining();
}

function preparePrint(){
  document.querySelectorAll(".print-hide,.print-hide-row").forEach(x=>x.classList.remove("print-hide","print-hide-row"));

  if(!$("clientName").value.trim() && !$("clientAddress").value.trim() && !$("clientContact").value.trim())
    $("billToBox").classList.add("print-hide");

  if(!$("projectAddress").value.trim() && !$("projectName").value.trim())
    $("projectBox").classList.add("print-hide");

  if(!$("invoiceDate").value.trim()) $("invoiceDateBox").classList.add("print-hide");
  if(!$("note").value.trim()) $("noteSection").classList.add("print-hide");

  $("itemsBody").querySelectorAll("tr").forEach(r=>{
    const desc = r.querySelector(".item-description");
    if(!desc || !desc.value.trim()) r.classList.add("print-hide-row");
  });
}
function restorePrint(){
  document.querySelectorAll(".print-hide,.print-hide-row").forEach(x=>x.classList.remove("print-hide","print-hide-row"));
}

document.addEventListener("DOMContentLoaded",()=>{
  $("invoiceNo").value=invoiceNumber();
  $("invoiceDate").value=today();

  $("invoiceTotal").addEventListener("input",calculateRemaining);
  $("paidNow").addEventListener("input",calculateRemaining);
  $("addItemBtn").addEventListener("click",()=>addItem());
  $("saveBtn").addEventListener("click",saveInvoice);
  $("newBtn").addEventListener("click",newInvoice);
  $("printBtn").addEventListener("click",()=>{calculateRemaining();window.print();});

  loadInvoice();
  calculateRemaining();

  window.addEventListener("beforeprint",()=>{calculateRemaining();preparePrint();});
  window.addEventListener("afterprint",restorePrint);
});
})();