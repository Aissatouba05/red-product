const API = 'https://red-product-back-jtx4.onrender.com';
const authToken = localStorage.getItem('token');

// Rediriger si pas connecté
if (!authToken) window.location.href = 'index.html';

const authHeaders = { Authorization: `Bearer ${authToken}` };

// ========= NOM UTILISATEUR =========
const userNomEl = document.getElementById('userNom');
if (userNomEl) {
  const nomLocal = localStorage.getItem('userNom');
  if (nomLocal) userNomEl.textContent = nomLocal;
  fetch(`${API}/api/auth/me`, { headers: authHeaders })
  .then(r => r.json())
  .then(u => {
    const n = u.nom || u.name || 'Utilisateur';
    userNomEl.textContent = n;
    localStorage.setItem('userNom', n);
    localStorage.setItem('userId', u._id || u.id);
  })
  .catch(() => { userNomEl.textContent = nomLocal || 'Utilisateur'; });
}

// ========= PHOTO DE PROFIL =========
async function loadUserPhoto() {
  try {
    const res = await fetch(`${API}/api/auth/me`, { headers: authHeaders });
    const user = await res.json();
    if (user.photo) {
      const photoUrl = `${API}${user.photo}`;
      document.getElementById('headerPhoto').src  = photoUrl;
      document.getElementById('sidebarPhoto').src = photoUrl;
      localStorage.setItem('redproduct_photo', photoUrl);
    } else {
      const savedPhoto = localStorage.getItem('redproduct_photo');
      if (savedPhoto) {
        document.getElementById('headerPhoto').src  = savedPhoto;
        document.getElementById('sidebarPhoto').src = savedPhoto;
      }
    }
  } catch {
    const savedPhoto = localStorage.getItem('redproduct_photo');
    if (savedPhoto) {
      document.getElementById('headerPhoto').src  = savedPhoto;
      document.getElementById('sidebarPhoto').src = savedPhoto;
    }
  }
}

document.getElementById('photoInput').addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('photo', file);
  try {
    const res = await fetch(`${API}/api/auth/photo`, {
      method: 'PUT',
      headers: authHeaders,
      body: formData
    });
    if (res.ok) {
      const data = await res.json();
      const photoUrl = `${API}${data.photo}`;
      document.getElementById('headerPhoto').src  = photoUrl;
      document.getElementById('sidebarPhoto').src = photoUrl;
      localStorage.setItem('redproduct_photo', photoUrl);
      addNotif('📸 Photo de profil mise à jour !');
    } else {
      alert('Erreur lors du changement de photo');
    }
  } catch {
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('headerPhoto').src  = e.target.result;
      document.getElementById('sidebarPhoto').src = e.target.result;
      localStorage.setItem('redproduct_photo', e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

// ========= DÉCONNEXION =========
async function logout() {
  try {
    await fetch(`${API}/api/auth/deconnexion`, {
      method: 'POST',
      headers: authHeaders
    });
  } catch { /* serveur absent */ }
  localStorage.removeItem('token');
  localStorage.removeItem('userNom');
  localStorage.removeItem('userId');
  window.location = 'index.html';
}

// ========= NOTIFICATIONS =========
let notifications = JSON.parse(localStorage.getItem('redproduct_notifs') || '[]');

function addNotif(message) {
  const notif = {
    id: Date.now().toString(),
    message,
    date: new Date().toLocaleString('fr-FR'),
    lu: false
  };
  notifications.unshift(notif);
  localStorage.setItem('redproduct_notifs', JSON.stringify(notifications));
  renderNotifs();
}

function renderNotifs() {
  const list  = document.getElementById('notifList');
  const badge = document.getElementById('notifBadge');
  if (!list) return;

  const nonLus = notifications.filter(n => !n.lu).length;
  if (nonLus > 0) {
    badge.textContent = nonLus > 9 ? '9+' : nonLus;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  if (notifications.length === 0) {
    list.innerHTML = '<p class="text-center text-gray-400 text-sm py-4">Aucune notification</p>';
    return;
  }

  list.innerHTML = notifications.map(n => `
    <div class="px-4 py-3 ${n.lu ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50 transition">
      <p class="text-sm text-gray-700">${n.message}</p>
      <p class="text-xs text-gray-400 mt-1">${n.date}</p>
    </div>
  `).join('');
}

function clearNotifs() {
  notifications = [];
  localStorage.setItem('redproduct_notifs', JSON.stringify(notifications));
  renderNotifs();
}

document.getElementById('bellBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('notifDropdown').classList.toggle('hidden');
  notifications = notifications.map(n => ({ ...n, lu: true }));
  localStorage.setItem('redproduct_notifs', JSON.stringify(notifications));
  renderNotifs();
});

document.addEventListener('click', () => {
  document.getElementById('notifDropdown').classList.add('hidden');
});

// ========= STATS =========
async function loadStats() {
  try {
    const res = await fetch(`${API}/api/stats`, { headers: authHeaders });
    if (!res.ok) throw new Error();
    const data = await res.json();
    document.getElementById('stat-formulaires').textContent  = data.formulaires  ?? '0';
    document.getElementById('stat-messages').textContent     = data.messages      ?? '0';
    document.getElementById('stat-utilisateurs').textContent = data.utilisateurs  ?? '0';
    document.getElementById('stat-emails').textContent       = data.emails        ?? '0';
    document.getElementById('stat-hotels').textContent       = data.hotels        ?? '0';
    document.getElementById('stat-entites').textContent      = data.entites       ?? '0';
  } catch {
    ['formulaires','messages','utilisateurs','emails','hotels','entites'].forEach(id => {
      const el = document.getElementById('stat-' + id);
      if (el) el.textContent = '0';
    });
  }
}

// ========= RECHERCHE =========
document.getElementById('search').addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  document.querySelectorAll('.stat-card').forEach(card => {
    const label = card.dataset.label || '';
    const text  = card.textContent.toLowerCase();
    card.style.display = (!q || text.includes(q) || label.includes(q)) ? '' : 'none';
  });
});

// ========= INIT =========
window.addEventListener('load', () => {
  loadStats();
  loadUserPhoto();
  renderNotifs();
});