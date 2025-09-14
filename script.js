// ---- ELEMENTE ----
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logout-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const filesUl = document.getElementById('files-ul');

let token = null;

// ---- TABS ----
loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
});

// ---- LOGIN ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      token = data.token;
      showDashboard();
    } else {
      alert(data.msg || 'Login fehlgeschlagen');
    }
  } catch (err) {
    console.error(err);
  }
});

// ---- REGISTER ----
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      token = data.token;
      showDashboard();
    } else {
      alert(data.msg || 'Registrierung fehlgeschlagen');
    }
  } catch (err) {
    console.error(err);
  }
});

// ---- DASHBOARD ANZEIGEN ----
function showDashboard() {
  authContainer.classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadFiles();
}

// ---- LOGOUT ----
logoutBtn.addEventListener('click', () => {
  token = null;
  dashboard.classList.add('hidden');
  authContainer.classList.remove('hidden');
});

// ---- DATEIEN LADEN ----
async function loadFiles() {
  if (!token) return;
  try {
    const res = await fetch('http://localhost:5000/api/files', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const files = await res.json();
    filesUl.innerHTML = '';
    files.forEach(f => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = `http://localhost:5000/uploads/${f.filename}`;
      link.textContent = f.originalName;
      link.target = '_blank';
      li.appendChild(link);
      filesUl.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// ---- DATEI HOCHLADEN ----
uploadBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) return alert('Keine Datei ausgewählt');
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('http://localhost:5000/api/files/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: formData
    });
    const data = await res.json();
    if (data.filename) {
      fileInput.value = '';
      loadFiles();
    } else {
      alert('Upload fehlgeschlagen');
    }
  } catch (err) {
    console.error(err);
  }
});
