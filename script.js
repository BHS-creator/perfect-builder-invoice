const items=document.getElementById('items');const date=document.getElementById('date');date.value=new Date().toISOString().slice(0,10);
function addItem(){let r=document.createElement('tr');r.innerHTML='<td><input class="item" placeholder="Description of work"></td><td><input class="num qty" type="number" min="0" step=".01" value="1"></td><td><input class="num price" type="number" min="0" step=".01" placeholder="0.00"></td><td>£<span class="rowtotal">0.00</span></td><td class="no-print"><button class="remove" onclick="this.closest(\'tr\').remove();calc()">×</button></td>';items.appendChild(r);r.querySelectorAll('input').forEach(x=>x.addEventListener('input',calc));calc()}
function calc(){let sub=0;items.querySelectorAll('tr').forEach(r=>{let q=+r.querySelector('.qty').value||0,p=+r.querySelector('.price').value||0,t=q*p;sub+=t;r.querySelector('.rowtotal').textContent=t.toFixed(2);r.classList.toggle('empty',!r.querySelector('.item').value.trim()&&!+r.querySelector('.price').value)});let rate=+document.getElementById('vat').value||0,v=sub*rate/100;document.getElementById('subtotal').textContent=sub.toFixed(2);document.getElementById('vatLabel').textContent=rate+'%';document.getElementById('vatAmount').textContent=v.toFixed(2);syncDue()}
function syncDue(){const total=+document.getElementById('projectTotal').value||0,received=+document.getElementById('receivedPayment').value||0;const remaining=Math.max(0,total-received);document.getElementById('remainingPayment').textContent=remaining.toFixed(2);document.getElementById('totalDueAmount').textContent=remaining.toFixed(2)}
function newInvoice(){if(!confirm('Start a new invoice?'))return;items.innerHTML='';document.querySelectorAll('.customer input,.project input').forEach(x=>x.value='');document.querySelectorAll('.editable').forEach(x=>x.innerHTML='');document.querySelector('.inline').textContent='INV-0001';date.value=new Date().toISOString().slice(0,10);document.getElementById('vat').value=0;projectTotal.value='';receivedPayment.value='';calcPayment();syncDue();addItem()}const projectTotal=document.getElementById('projectTotal');
const receivedPayment=document.getElementById('receivedPayment');
function calcPayment(){syncDue()}
projectTotal.addEventListener('input',calcPayment);
receivedPayment.addEventListener('input',calcPayment);
document.getElementById('vat').addEventListener('input',calc);
addItem();
calcPayment();

