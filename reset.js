 async function handleReset() {
      const email  = document.getElementById('email').value.trim();
      const btn    = document.getElementById('submitBtn');
      const msgOk  = document.getElementById('msgSuccess');
      const msgErr = document.getElementById('msgError');

      msgOk.classList.add('hidden');
      msgErr.classList.add('hidden');
      btn.textContent = 'Envoi en cours…';
      btn.disabled = true;

      try {
        const res = await fetch('https://red-product-back-jtx4.onrender.com/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
          msgOk.classList.remove('hidden');
          document.getElementById('email').value = '';
        } else {
          msgErr.textContent = data.message || data.error || "Erreur lors de l'envoi.";
          msgErr.classList.remove('hidden');
        }
      } catch {
        msgErr.textContent = 'Erreur réseau / serveur.';
        msgErr.classList.remove('hidden');
      }

      btn.textContent = 'Envoyer';
      btn.disabled = false;
    }