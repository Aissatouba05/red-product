    let hotels = [];
    let currentHotelId = null;

    function generateId() {
      return '_' + Math.random().toString(36).substr(2, 9);
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

    // ---- RENDU DES CARTES ----
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
        card.className = 'hotel-card bg-white rounded-2xl shadow-md w-full overflow-hidden';
        card.dataset.id = h.id;

        const img = h.imageData
          ? h.imageData
          : (h.image ? `https://red-product-back-jtx4.onrender.com${h.image}` : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400');

        card.innerHTML = `
          <img src="${img}" alt="${h.nom}"
            class="w-full h-[150px] object-cover object-center"
            onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'">
          <div class="p-2 flex flex-col gap-1">
            <p class="text-red-700 text-[12px]">${h.adresse || ''}</p>
            <h2 class="font-bold text-base">${h.nom}</h2>
            ${h.description ? `<p class="text-gray-500 text-[11px]">${h.description}</p>` : ''}
            <p class="font-semibold text-[10px]">${Number(h.prix).toLocaleString('fr-FR')} ${h.devise || 'XOF'} par nuit</p>
          </div>
        `;

        card.addEventListener('click', () => openModalDetails(h.id));
        container.appendChild(card);
      });
    }

    // ---- TOKEN ----
    const authToken = localStorage.getItem('token');
    if (!authToken) window.location.href = 'index.html';
    const authHeaders = { Authorization: `Bearer ${authToken}` };

    // ---- CHARGER DEPUIS SERVEUR (ou localStorage) ----
    async function loadHotels() {
      try {
        const res = await fetch('https://red-product-back-jtx4.onrender.com/api/hotels', { headers: authHeaders });
        if (!res.ok) throw new Error();
        const data = await res.json();
        hotels = data.map(h => ({ ...h, id: h._id || h.id || generateId() }));
        saveLocal();
      } catch {
        hotels = loadLocal();
      }
      renderHotels(hotels);
    }

    // ---- MODAL AJOUTER ----
    const modal         = document.getElementById('modal');
    const openModalBtn  = document.getElementById('openModal');
    const closeModalBtn = document.getElementById('closeModal');
    const saveBtn       = document.getElementById('saveHotelBtn');

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
      const nom         = document.getElementById('addNom').value.trim();
      const email       = document.getElementById('addEmail').value.trim();
      const prix        = document.getElementById('addPrix').value.trim();
      const adresse     = document.getElementById('addAdresse').value.trim();
      const numero      = document.getElementById('addNumero').value.trim();
      const devise      = document.getElementById('addDevise').value;
      const description = document.getElementById('addDescription').value.trim();
      const imageFile   = document.getElementById('addImage').files[0];

      if (!nom || !email || !adresse || !numero || !prix) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
      }

      let savedFromServer = false;
      try {
        const formData = new FormData();
        formData.append('nom', nom); formData.append('email', email);
        formData.append('prix', prix); formData.append('adresse', adresse);
        formData.append('numero', numero); formData.append('devise', devise);
        formData.append('description', description);
        if (imageFile) formData.append('image', imageFile);

        const res = await fetch('https://red-product-back-jtx4.onrender.com/api/hotels', { method: 'POST', headers: authHeaders, body: formData });
        if (res.ok) { savedFromServer = true; modal.classList.add('hidden'); resetAddForm(); loadHotels(); }
      } catch { /* pas de serveur */ }

      if (!savedFromServer) {
        const newHotel = { id: generateId(), nom, email, prix, adresse, numero, devise, description };
        if (imageFile) {
          const reader = new FileReader();
          reader.onload = e => { newHotel.imageData = e.target.result; hotels.push(newHotel); saveLocal(); renderHotels(hotels); };
          reader.readAsDataURL(imageFile);
        } else {
          hotels.push(newHotel);
          saveLocal();
          renderHotels(hotels);
        }
        modal.classList.add('hidden');
        resetAddForm();
      }
    });

    function resetAddForm() {
      ['addNom','addEmail','addPrix','addAdresse','addNumero','addDescription'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('addDevise').value = 'XOF';
      document.getElementById('addImage').value = '';
      const prev = document.getElementById('addImagePreview');
      prev.src = ''; prev.classList.add('hidden');
    }

    // ---- MODAL DÉTAILS ----
    function openModalDetails(id) {
      const h = hotels.find(x => x.id === id);
      if (!h) return;
      currentHotelId = id;

      const img = h.imageData ? h.imageData : (h.image ? `https://red-product-back-jtx4.onrender.com${h.image}` : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600');
      document.getElementById('detailPhoto').src              = img;
      document.getElementById('detailNom').textContent        = h.nom;
      document.getElementById('detailAdresse').textContent    = h.adresse || '–';
      document.getElementById('detailEmail').textContent      = h.email || '–';
      document.getElementById('detailTelephone').textContent  = h.numero || '–';
      document.getElementById('detailPrix').textContent       = `${Number(h.prix).toLocaleString('fr-FR')} ${h.devise || 'XOF'}`;
      document.getElementById('detailDescription').textContent = h.description || '–';

      document.getElementById('modalDetails').classList.remove('hidden');
    }

    function closeModalDetails() {
      document.getElementById('modalDetails').classList.add('hidden');
      currentHotelId = null;
    }

    document.getElementById('modalDetails').addEventListener('click', e => {
      if (e.target === document.getElementById('modalDetails')) closeModalDetails();
    });

    document.getElementById('btnSupprimerDetail').addEventListener('click', async () => {
      if (!confirm('Supprimer cet hôtel ?')) return;
      let done = false;
      try {
        const res = await fetch(`https://red-product-back-jtx4.onrender.com/api/hotels/${currentHotelId}`, { method: 'DELETE', headers: authHeaders });
        if (res.ok) { done = true; closeModalDetails(); loadHotels(); }
      } catch { /* local */ }
      if (!done) { hotels = hotels.filter(h => h.id !== currentHotelId); saveLocal(); renderHotels(hotels); closeModalDetails(); }
    });

    document.getElementById('btnModifierDetail').addEventListener('click', () => {
      const h = hotels.find(x => x.id === currentHotelId);
      if (!h) return;
      document.getElementById('editId').value          = h.id;
      document.getElementById('editNom').value         = h.nom;
      document.getElementById('editAdresse').value     = h.adresse || '';
      document.getElementById('editEmail').value       = h.email || '';
      document.getElementById('editTelephone').value   = h.numero || '';
      document.getElementById('editPrix').value        = h.prix;
      document.getElementById('editDevise').value      = h.devise || 'XOF';
      document.getElementById('editDescription').value = h.description || '';
      document.getElementById('modalModifier').classList.remove('hidden');
    });

    // ---- MODAL MODIFIER ----
    function closeModalModifier() {
      document.getElementById('modalModifier').classList.add('hidden');
    }

    document.getElementById('editForm').addEventListener('submit', async e => {
      e.preventDefault();
      const id = document.getElementById('editId').value;
      const updated = {
        nom:         document.getElementById('editNom').value.trim(),
        adresse:     document.getElementById('editAdresse').value.trim(),
        email:       document.getElementById('editEmail').value.trim(),
        numero:      document.getElementById('editTelephone').value.trim(),
        prix:        document.getElementById('editPrix').value.trim(),
        devise:      document.getElementById('editDevise').value,
        description: document.getElementById('editDescription').value.trim(),
      };

      let done = false;
      try {
        const res = await fetch(`https://red-product-back-jtx4.onrender.com/api/hotels/${id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders }, body: JSON.stringify(updated),
        });
        if (res.ok) { done = true; closeModalModifier(); closeModalDetails(); loadHotels(); }
      } catch { /* local */ }

      if (!done) {
        const idx = hotels.findIndex(h => h.id === id);
        if (idx !== -1) hotels[idx] = { ...hotels[idx], ...updated };
        saveLocal();
        renderHotels(hotels);
        closeModalModifier();
        closeModalDetails();
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
        (h.adresse && h.adresse.toLowerCase().includes(q)) ||
        (h.description && h.description.toLowerCase().includes(q))
      ));
    });

    // ---- NOM UTILISATEUR ----
    const userNomEl = document.getElementById('userNom');
    if (userNomEl) {
      const nomLocal = localStorage.getItem('userNom');
      if (nomLocal) userNomEl.textContent = nomLocal;
      if (authToken) {
        fetch('https://red-product-back-jtx4.onrender.com/api/auth/me', { headers: { Authorization: `Bearer ${authToken}` } })
        .then(r => r.json())
        .then(u => { const n = u.nom || u.name || 'Utilisateur'; userNomEl.textContent = n; localStorage.setItem('userNom', n); })
        .catch(() => { userNomEl.textContent = nomLocal || 'Utilisateur'; });
      }
    }

    // ---- INIT ----
    window.addEventListener('load', loadHotels);