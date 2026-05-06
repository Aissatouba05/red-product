const API = 'https://red-product-back-jtx4.onrender.com';

let hotels = [];
let currentHotelId = null;
let currentPage = 1;
const limit = 8;

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// ---- TOKEN ----
const authToken = localStorage.getItem('token');
if (!authToken) window.location.href = 'index.html';
const authHeaders = { Authorization: `Bearer ${authToken}` };

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

// ---- IMAGE URL ----
function getImageUrl(image) {
  if (!image) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
  if (image.startsWith('http')) return image;
  return `${API}${image}`;
}

// ---- PERSISTANCE LOCALE PAR UTILISATEUR ----
function getLocalKey() {
  const userId = localStorage.getItem('userId') || 'guest';
  return 'redproduct_hotels_' + userId;
}
function saveLocal() {
  localStorage.setItem(getLocalKey(), JSON.stringify(hotels));
}
function loadLocal() {
  try {
    const data = localStorage.getItem(getLocalKey());
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

// ---- RENDU DES CARTES (avec icônes hover modifier/supprimer) ----
function renderHotels(list) {
  const container = document.getElementById('hotel');
  const noResults = document.getElementById('noResults');
  container.innerHTML = '';

  if (list.length === 0) {
    noResults.classList.remove('hidden');
    document.getElementById('hotelCount').textContent = '0';
    return;
  }
  noResults.classList.add('hidden');
  document.getElementById('hotelCount').textContent = list.length;

  list.forEach(h => {
    const card = document.createElement('div');
    card.className = 'hotel-card bg-white rounded-2xl shadow-md w-full overflow-hidden cursor-pointer transition hover:-translate-y-1 relative group';
    card.dataset.id = h.id;

    const img = h.imageData ? h.imageData : getImageUrl(h.image);

    card.innerHTML = `
      <img src="${img}" alt="${h.nom}"
        class="w-full h-[150px] object-cover object-center"
        onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'">

      <!-- Icônes modifier/supprimer (visibles au hover) -->
      <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button class="btn-modifier bg-white text-gray-700 hover:bg-gray-800 hover:text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md transition" title="Modifier">
          <i class="fa-solid fa-pen text-xs"></i>
        </button>
        <button class="btn-supprimer bg-white text-red-500 hover:bg-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md transition" title="Supprimer">
          <i class="fa-solid fa-trash text-xs"></i>
        </button>
      </div>

      <div class="p-2 flex flex-col gap-1">
        <p class="text-red-700 text-[12px]">${h.adresse || ''}</p>
        <h2 class="font-bold text-base">${h.nom}</h2>
        ${h.description ? `<p class="text-gray-500 text-[11px]">${h.description}</p>` : ''}
        <p class="font-semibold text-[10px]">${Number(h.prix).toLocaleString('fr-FR')} ${h.devise || 'XOF'} par nuit</p>
      </div>
    `;

    // Clic sur la carte → page détail
    card.addEventListener('click', (e) => {
      // Si on clique sur les boutons, ne pas naviguer
      if (e.target.closest('.btn-modifier') || e.target.closest('.btn-supprimer')) return;
      window.location.href = `detail.html?id=${h.id}`;
    });

    // Bouton modifier
    card.querySelector('.btn-modifier').addEventListener('click', (e) => {
      e.stopPropagation();
      ouvrirModifier(h.id);
    });

    // Bouton supprimer
    card.querySelector('.btn-supprimer').addEventListener('click', (e) => {
      e.stopPropagation();
      supprimerHotel(h.id);
    });

    container.appendChild(card);
  });
}

// ---- SUPPRIMER DEPUIS CARTE ----
async function supprimerHotel(id) {
  if (!confirm('Supprimer cet hôtel ?')) return;
  try {
    const res = await fetch(`${API}/api/hotels/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) {
      await loadHotels(currentPage);
      showToast('🗑️ Hôtel supprimé avec succès !', 'success');
      addNotif('🗑️ Hôtel supprimé avec succès !');
    } else {
      alert('Erreur lors de la suppression');
    }
  } catch {
    hotels = hotels.filter(h => h.id !== id);
    saveLocal();
    renderHotels(hotels);
  }
}

// ---- OUVRIR MODIFIER DEPUIS CARTE ----
function ouvrirModifier(id) {
  const h = hotels.find(x => x.id === id);
  if (!h) return;
  currentHotelId = id;
  document.getElementById('editId').value        = h.id;
  document.getElementById('editNom').value       = h.nom;
  document.getElementById('editAdresse').value   = h.adresse || '';
  document.getElementById('editEmail').value     = h.email || '';
  document.getElementById('editTelephone').value = h.numero || '';
  document.getElementById('editPrix').value      = h.prix;
  document.getElementById('editDevise').value    = h.devise || 'XOF';
  document.getElementById('modalModifier').classList.remove('hidden');
}

// ---- CHARGER DEPUIS SERVEUR avec pagination ----
async function loadHotels(page = 1) {
  currentPage = page;
  try {
    const res = await fetch(`${API}/api/hotels?page=${page}&limit=${limit}`, { headers: authHeaders });
    if (!res.ok) throw new Error();
    const data = await res.json();
    hotels = (data.hotels || []).map(h => ({ ...h, id: h._id || h.id || generateId() }));
    saveLocal();
    renderHotels(hotels);
    renderPagination(data.page, data.totalPages);
  } catch (err) {
    console.error('Erreur loadHotels:', err);
    hotels = loadLocal();
    renderHotels(hotels);
  }
}

// ---- RENDU PAGINATION ----
function renderPagination(page, totalPages) {
  const container = document.getElementById('pagination');
  if (!container) return;
  container.innerHTML = '';
  if (!totalPages || totalPages <= 1) return;

  const prev = document.createElement('button');
  prev.textContent = '←';
  prev.className = page === 1
    ? 'px-3 py-1 rounded border text-sm text-gray-300 cursor-not-allowed'
    : 'px-3 py-1 rounded border text-sm hover:bg-gray-100 cursor-pointer';
  prev.disabled = page === 1;
  prev.addEventListener('click', () => loadHotels(page - 1));
  container.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = i === page
      ? 'px-3 py-1 rounded bg-gray-800 text-white text-sm'
      : 'px-3 py-1 rounded border text-sm hover:bg-gray-100 cursor-pointer';
    btn.addEventListener('click', () => loadHotels(i));
    container.appendChild(btn);
  }

  const next = document.createElement('button');
  next.textContent = '→';
  next.className = page === totalPages
    ? 'px-3 py-1 rounded border text-sm text-gray-300 cursor-not-allowed'
    : 'px-3 py-1 rounded border text-sm hover:bg-gray-100 cursor-pointer';
  next.disabled = page === totalPages;
  next.addEventListener('click', () => loadHotels(page + 1));
  container.appendChild(next);
}

// ---- MODAL AJOUTER ----
const modal        = document.getElementById('modal');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn= document.getElementById('closeModal');
const saveBtn      = document.getElementById('saveHotelBtn');

openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

document.getElementById('addImage').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('addImagePreview');
    prev.src = e.target.result;
    prev.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

saveBtn.addEventListener('click', async () => {
  const nom     = document.getElementById('addNom').value.trim();
  const email   = document.getElementById('addEmail').value.trim();
  const prix    = document.getElementById('addPrix').value.trim();
  const adresse = document.getElementById('addAdresse').value.trim();
  const numero  = document.getElementById('addNumero').value.trim();
  const devise  = document.getElementById('addDevise').value;
  const imageFile = document.getElementById('addImage').files[0];

  if (!nom || !email || !adresse || !numero || !prix) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('email', email);
    formData.append('prix', prix);
    formData.append('adresse', adresse);
    formData.append('numero', numero);
    formData.append('devise', devise);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${API}/api/hotels`, { method: 'POST', headers: authHeaders, body: formData });
    if (res.ok) {
      modal.classList.add('hidden');
      resetAddForm();
      await loadHotels(currentPage);
      showToast('🏨 Hôtel ajouté avec succès !', 'success');
      addNotif(`🏨 Hôtel "${nom}" ajouté avec succès !`);
    } else {
      const err = await res.json();
      alert(err.error || "Erreur lors de l'ajout");
    }
  } catch {
    alert('Erreur réseau / serveur');
  }
});

function resetAddForm() {
  ['addNom','addEmail','addPrix','addAdresse','addNumero'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('addDevise').value = 'XOF';
  document.getElementById('addImage').value = '';
  const prev = document.getElementById('addImagePreview');
  prev.src = ''; prev.classList.add('hidden');
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
      await loadHotels(currentPage);
      showToast('✏️ Hôtel modifié avec succès !', 'success');
      addNotif('✏️ Hôtel modifié avec succès !');
    } else {
      alert("Erreur lors de la modification");
    }
  } catch {
    const idx = hotels.findIndex(h => h.id === id);
    if (idx !== -1) hotels[idx] = { ...hotels[idx], ...updated };
    saveLocal();
    renderHotels(hotels);
    closeModalModifier();
  }
});

document.getElementById('modalModifier').addEventListener('click', e => {
  if (e.target === document.getElementById('modalModifier')) closeModalModifier();
});

// ---- RECHERCHE ----
document.getElementById('search').addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  if (!q) { renderHotels(hotels); return; }
  renderHotels(hotels.filter(h =>
    h.nom.toLowerCase().includes(q) ||
    (h.adresse && h.adresse.toLowerCase().includes(q))
  ));
});

// ---- NOM UTILISATEUR ----
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

// ---- NOTIFICATIONS ----
let notifications = JSON.parse(localStorage.getItem('redproduct_notifs') || '[]');

function saveNotifs() {
  localStorage.setItem('redproduct_notifs', JSON.stringify(notifications));
}

function addNotif(message) {
  notifications.unshift({
    id: generateId(),
    message,
    date: new Date().toLocaleString('fr-FR'),
    lu: false
  });
  saveNotifs();
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
  saveNotifs();
  renderNotifs();
}

document.getElementById('bellBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('notifDropdown').classList.toggle('hidden');
  notifications = notifications.map(n => ({ ...n, lu: true }));
  saveNotifs();
  renderNotifs();
});

document.addEventListener('click', () => {
  document.getElementById('notifDropdown').classList.add('hidden');
});

renderNotifs();

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
      const photoUrl = data.photo.startsWith('http') ? data.photo : `${API}${data.photo}`;
      document.getElementById('headerPhoto').src  = photoUrl;
      document.getElementById('sidebarPhoto').src = photoUrl;
      localStorage.setItem('redproduct_photo', photoUrl);
      showToast('📸 Photo mise à jour !', 'success');
      addNotif('📸 Photo de profil mise à jour !');
    } else {
      const err = await res.json();
      alert(err.error || 'Erreur lors du changement de photo');
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
  loadHotels();
  loadUserPhoto();
});