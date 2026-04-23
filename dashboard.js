  const API = 'https://red-product-back-jtx4.onrender.com';

    // ========= NOM UTILISATEUR =========
    const authToken = localStorage.getItem('token');
    const userNomEl = document.getElementById('userNom');
    if (userNomEl) {
      const nomLocal = localStorage.getItem('userNom');
      if (nomLocal) userNomEl.textContent = nomLocal;
      if (authToken) {
        fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        .then(r => r.json())
        .then(u => {
          const n = u.nom || u.name || 'Utilisateur';
          userNomEl.textContent = n;
          localStorage.setItem('userNom', n);
        })
        .catch(() => { userNomEl.textContent = nomLocal || 'Utilisateur'; });
      }
    }

    // ========= CHARGER LES STATS =========
    async function loadStats() {
      try {
        const res = await fetch(`${API}/api/stats`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error();
        const data = await res.json();

        document.getElementById('stat-formulaires').textContent  = data.formulaires  ?? '0';
        document.getElementById('stat-messages').textContent     = data.messages      ?? '0';
        document.getElementById('stat-utilisateurs').textContent = data.utilisateurs  ?? '0';
        document.getElementById('stat-emails').textContent       = data.emails        ?? '0';
        document.getElementById('stat-hotels').textContent       = data.hotels        ?? '0';
        document.getElementById('stat-entites').textContent      = data.entites       ?? '0';

      } catch {
        // Serveur absent → afficher 0 partout
        ['formulaires','messages','utilisateurs','emails','hotels','entites'].forEach(id => {
          const el = document.getElementById('stat-' + id);
          if (el) el.textContent = '0';
        });
      }
    }

    // ========= RECHERCHE =========
    document.getElementById('search').addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.stat-card');
      cards.forEach(card => {
        const label = card.dataset.label || '';
        const text  = card.textContent.toLowerCase();
        card.style.display = (!q || text.includes(q) || label.includes(q)) ? '' : 'none';
      });
    });

    // ========= INIT =========
    window.addEventListener('load', loadStats);