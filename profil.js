// ========= MODAL PROFIL =========
// Ce fichier est partagé entre dashboard.html et hotel.html

const API_PROFIL = 'https://red-product-back-jtx4.onrender.com';
const authTokenProfil = localStorage.getItem('token');
const authHeadersProfil = { Authorization: `Bearer ${authTokenProfil}` };

// Ouvrir le modal profil
function openModalProfil() {
  fetch(`${API_PROFIL}/api/auth/me`, { headers: authHeadersProfil })
  .then(r => r.json())
  .then(user => {
    document.getElementById('profilNom').value   = user.nom || '';
    document.getElementById('profilEmail').value = user.email || '';
    document.getElementById('profilPwd').value   = '';
    document.getElementById('profilPwd2').value  = '';

    // Afficher la photo actuelle
    const photoUrl = user.photo
      ? (user.photo.startsWith('http') ? user.photo : `${API_PROFIL}${user.photo}`)
      : (localStorage.getItem('redproduct_photo') || '');
    if (photoUrl) {
      document.getElementById('profilPhotoPreview').src = photoUrl;
      document.getElementById('profilPhotoPreview').classList.remove('hidden');
    }

    document.getElementById('modalProfil').classList.remove('hidden');
  })
  .catch(() => {
    document.getElementById('modalProfil').classList.remove('hidden');
  });
}

function closeModalProfil() {
  document.getElementById('modalProfil').classList.add('hidden');
}

// Fermer en cliquant dehors
document.getElementById('modalProfil').addEventListener('click', e => {
  if (e.target === document.getElementById('modalProfil')) closeModalProfil();
});

// Prévisualisation nouvelle photo
document.getElementById('profilPhotoInput').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('profilPhotoPreview').src = e.target.result;
    document.getElementById('profilPhotoPreview').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

// Sauvegarder le profil
document.getElementById('profilForm').addEventListener('submit', async e => {
  e.preventDefault();

  const nom    = document.getElementById('profilNom').value.trim();
  const email  = document.getElementById('profilEmail').value.trim();
  const pwd    = document.getElementById('profilPwd').value;
  const pwd2   = document.getElementById('profilPwd2').value;
  const msgErr = document.getElementById('profilMsgErr');
  const msgOk  = document.getElementById('profilMsgOk');

  msgErr.classList.add('hidden');
  msgOk.classList.add('hidden');

  // Validation mot de passe
  if (pwd && pwd !== pwd2) {
    msgErr.textContent = 'Les mots de passe ne correspondent pas.';
    msgErr.classList.remove('hidden');
    return;
  }
  if (pwd && pwd.length < 6) {
    msgErr.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
    msgErr.classList.remove('hidden');
    return;
  }

  try {
    // 1. Mettre à jour nom, email, mot de passe
    const body = { nom, email };
    if (pwd) body.password = pwd;

    const res = await fetch(`${API_PROFIL}/api/auth/profil`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeadersProfil },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json();
      msgErr.textContent = err.error || 'Erreur lors de la mise à jour.';
      msgErr.classList.remove('hidden');
      return;
    }

    const data = await res.json();
    localStorage.setItem('userNom', data.user.nom);

    // Mettre à jour le nom affiché
    const userNomEl = document.getElementById('userNom');
    if (userNomEl) userNomEl.textContent = data.user.nom;

    // 2. Mettre à jour la photo si une nouvelle est sélectionnée
    const photoFile = document.getElementById('profilPhotoInput').files[0];
    if (photoFile) {
      const formData = new FormData();
      formData.append('photo', photoFile);
      const photoRes = await fetch(`${API_PROFIL}/api/auth/photo`, {
        method: 'PUT',
        headers: authHeadersProfil,
        body: formData
      });
      if (photoRes.ok) {
        const photoData = await photoRes.json();
        const photoUrl = photoData.photo.startsWith('http') ? photoData.photo : `${API_PROFIL}${photoData.photo}`;
        document.getElementById('headerPhoto').src  = photoUrl;
        document.getElementById('sidebarPhoto').src = photoUrl;
        localStorage.setItem('redproduct_photo', photoUrl);
      }
    }

    msgOk.textContent = 'Profil mis à jour avec succès ✅';
    msgOk.classList.remove('hidden');

    // Fermer après 1.5 secondes
    setTimeout(() => closeModalProfil(), 1500);

  } catch {
    msgErr.textContent = 'Erreur réseau / serveur.';
    msgErr.classList.remove('hidden');
  }
});