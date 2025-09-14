// ---- ELEMENTE ----
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logout-btn');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const filesUl = document.getElementById('files-ul');
const progressContainer = document.getElementById('progress-container');
const toggleTheme = document.getElementById('toggle-theme');

let token = null;

// ---- DARK/LIGHT MODE ----
toggleTheme.addEventListener('click', () => document.body.classList.toggle('light'));

// ---- TABS ----
loginTab.addEventListener('click', () => { loginTab.classList.add('active'); registerTab.classList.remove('active'); loginForm.classList.add('active'); registerForm.classList.remove('active'); });
registerTab.addEventListener('click', () => { registerTab.classList.add('active'); loginTab.classList.remove('active'); registerForm.classList.add('active'); loginForm.classList.remove('active'); });

// ---- LOGIN & REGISTER ----
loginForm.addEventListener('submit', async e => { e.preventDefault(); await auth('login'); });
registerForm.addEventListener('submit', async e => { e.preventDefault(); await auth('register'); });
async function auth(mode) {
  const username = document.getElementById(`${mode}-username`).value;
  const password = document.getElementById(`${mode}-password`).value;
  try {
    const res = await fetch(`http://localhost:5000/api/auth/${mode}`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username,password})
    });
    const data = await res.json();
    if(data.token){ token = data.token; showDashboard(); } 
    else alert(data.msg || 'Fehler');
  } catch(err){ console.error(err);}
}

// ---- DASHBOARD ----
function showDashboard(){ authContainer.classList.add('hidden'); dashboard.classList.remove('hidden'); loadFiles(); }
logoutBtn.addEventListener('click',()=>{ token=null; dashboard.classList.add('hidden'); authContainer.classList.remove('hidden'); });

// ---- DRAG & DROP ----
dropZone.addEventListener('click', ()=>fileInput.click());
dropZone.addEventListener('dragover', e=>{ e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', ()=>dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e=>{ e.preventDefault(); dropZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
fileInput.addEventListener('change', ()=>handleFiles(fileInput.files));

function handleFiles(files){ [...files].forEach(uploadFile); }

function uploadFile(file){
  const formData = new FormData(); formData.append('file', file);
  const progressBar = document.createElement('div'); progressBar.classList.add('progress-bar'); progressBar.style.width='0%'; progressContainer.appendChild(progressBar);

  const xhr = new XMLHttpRequest();
  xhr.open('POST','http://localhost:5000/api/files/upload',true);
  xhr.setRequestHeader('Authorization','Bearer '+token);
  xhr.upload.onprogress = e => { if(e.lengthComputable){ progressBar.style.width = (e.loaded/e.total*100)+'%'; } };
  xhr.onload = ()=>{ progressBar.style.width='100%'; setTimeout(()=>progressBar.remove(),1000); loadFiles(); };
  xhr.send(formData);
}

// ---- LOAD FILES & DELETE ----
async function loadFiles(){
  if(!token) return;
  try{
    const res = await fetch('http://localhost:5000/api/files',{ headers:{ 'Authorization':'Bearer '+token } });
    const files = await res.json();
    filesUl.innerHTML='';
    files.forEach(f=>{
      const li=document.createElement('li');
      const link=document.createElement('a'); link.href=`http://localhost:5000/uploads/${f.filename}`; link.textContent=f.originalName; link.target='_blank';
      const delBtn=document.createElement('button'); delBtn.textContent='Löschen';
      delBtn.addEventListener('click', async ()=>{
        try{
          await fetch(`http://localhost:5000/api/files/${f._id}`,{ method:'DELETE', headers:{ 'Authorization':'Bearer '+token }});
          loadFiles();
        }catch(err){ console.error(err);}
      });
      li.appendChild(link); li.appendChild(delBtn);
      filesUl.appendChild(li);
    });
  }catch(err){ console.error(err);}
}
