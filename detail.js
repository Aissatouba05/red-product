const API = 'https://red-product-back-jtx4.onrender.com';
const authToken = localStorage.getItem('token');
if (!authToken) window.location.href = 'index.html';
const authHeaders = { Authorization: `Bearer ${authToken}` };

// ---- RÉCUPÉRER L'ID DEPUIS L'URL ----
const urlParams = new URLSearchParams(window.location.search);
const hotelId = urlParams.get('id');

if (!hotelId) {
  window.location.href = 'hotel.html';
}

// ---- TOAST ----
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
    color: white; padding: 12px 28px; border-radius: 12px;
    font-size: 15px; font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15); z-index: 9999;
    animation: fadeInDown 0.3s ease;
  `;
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function getImageUrl(image) {
  if (!image) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  if (image.startsWith('http')) return image;
  return `${API}${image}`;
}

// ---- CHARGER LES DÉTAILS DE L'HÔTEL ----
async function loadDetail() {
  try {
    const res = await fetch(`${API}/api/hotels/${hotelId}`, { headers: authHeaders });
    if (!res.ok) throw new Error();
    const h = await res.json();

    document.getElementById('skeleton').classList.add('hidden');
    document.getElementById('detailContent').classList.remove('hidden');

    document.getElementById('detailImg').src          = getImageUrl(h.image);
    document.getElementById('detailNom').textContent  = h.nom;
    document.getElementById('detailAdresse').textContent = h.adresse || '–';
    document.getElementById('detailEmail').textContent   = h.email || '–';
    document.getElementById('detailTelephone').textContent = h.numero || '–';
    document.getElementById('detailDevise').textContent    = h.devise || 'XOF';
    document.getElementById('detailDescription').textContent = h.description || '–';
    document.getElementById('detailPrix').textContent =
      `${Number(h.prix).toLocaleString('fr-FR')} ${h.devise || 'XOF'} / nuit`;

    // Titre de l'onglet
    document.title = `${h.nom} — RED PRODUCT`;

    // Bouton supprimer
    document.getElementById('btnSupprimer').addEventListener('click', async () => {
      if (!confirm('Supprimer cet hôtel ?')) return;
      try {
        const r = await fetch(`${API}/api/hotels/${hotelId}`, { method: 'DELETE', headers: authHeaders });
        if (r.ok) {
          showToast('🗑️ Hôtel supprimé avec succès !', 'success');
          setTimeout(() => window.location.href = 'hotel.html', 1500);
        } else {
          alert('Erreur lors de la suppression');
        }
      } catch {
        alert('Erreur réseau / serveur');
      }
    });


    // Bouton modifier → ouvre modal
    document.getElementById('btnModifier').addEventListener('click', () => {
      document.getElementById('editId').value        = h._id || hotelId;
      document.getElementById('editNom').value       = h.nom;
      document.getElementById('editAdresse').value   = h.adresse || '';
      document.getElementById('editEmail').value     = h.email || '';
      document.getElementById('editTelephone').value = h.numero || '';
      document.getElementById('editPrix').value      = h.prix;
      document.getElementById('editDevise').value    = h.devise || 'XOF';
      document.getElementById('modalModifier').classList.remove('hidden');
    });

  } catch {
    document.getElementById('skeleton').classList.add('hidden');
    document.getElementById('detailError').classList.remove('hidden');
  }
}

// ---- MODAL MODIFIER ----
function closeModalModifier() {
  document.getElementById('modalModifier').classList.add('hidden');
}

document.getElementById('editForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const updated = {
    nom:     document.getElementById('editNom').value.trim(),
    adresse: document.getElementById('editAdresse').value.trim(),
    email:   document.getElementById('editEmail').value.trim(),
    numero:  document.getElementById('editTelephone').value.trim(),
    prix:    document.getElementById('editPrix').value.trim(),
    devise:  document.getElementById('editDevise').value,
  };

  try {
    const res = await fetch(`${API}/api/hotels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      closeModalModifier();
      showToast('✏️ Hôtel modifié avec succès !', 'success');
      setTimeout(() => loadDetail(), 1000);
    } else {
      alert('Erreur lors de la modification');
    }
  } catch {
    alert('Erreur réseau / serveur');
  }
});

document.getElementById('modalModifier').addEventListener('click', e => {
  if (e.target === document.getElementById('modalModifier')) closeModalModifier();
});

// ---- NOM UTILISATEUR ----
const userNomEl = document.getElementById('userNom');
if (userNomEl) {
  const nomLocal = localStorage.getItem('userNom');
  if (nomLocal) userNomEl.textContent = nomLocal;
  fetch(`${API}/api/auth/me`, { headers: authHeaders })
  .then(r => r.json())
  .then(u => { userNomEl.textContent = u.nom || 'Utilisateur'; })
  .catch(() => { userNomEl.textContent = nomLocal || 'Utilisateur'; });
}

// ---- PHOTO DE PROFIL ----
async function loadUserPhoto() {
  try {
    const res = await fetch(`${API}/api/auth/me`, { headers: authHeaders });
    const user = await res.json();
    if (user.photo) {
      const photoUrl = user.photo.startsWith('http') ? user.photo : `${API}${user.photo}`;
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

// ---- NOTIFICATIONS ----
let notifications = JSON.parse(localStorage.getItem('redproduct_notifs') || '[]');

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
  list.innerHTML = notifications.length === 0
    ? '<p class="text-center text-gray-400 text-sm py-4">Aucune notification</p>'
    : notifications.map(n => `
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

renderNotifs();

// ---- DÉCONNEXION ----
async function logout() {
  try {
    await fetch(`${API}/api/auth/deconnexion`, { method: 'POST', headers: authHeaders });
  } catch { /* serveur absent */ }
  localStorage.removeItem('token');
  localStorage.removeItem('userNom');
  localStorage.removeItem('userId');
  localStorage.removeItem('redproduct_photo');
  window.location = 'index.html';
}

// ---- INIT ----
window.addEventListener('load', () => {
  loadDetail();
  loadUserPhoto();
});