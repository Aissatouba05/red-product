  // Récupérer le token depuis l'URL
    // Ex: http://localhost/new-password.html?token=xxxx
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');

    // Si pas de token dans l'URL → afficher erreur
    if (!resetToken) {
      document.getElementById('msgToken').classList.remove('hidden');
      document.getElementById('formReset').classList.add('hidden');
    }

    // Afficher / cacher mot de passe
    function toggleVisi(inputId, iconId) {
      const input = document.getElementById(inputId);
      const icon  = document.getElementById(iconId);
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    }

    async function handleNewPassword() {
      const pwd    = document.getElementById('pwd').value;
      const pwd2   = document.getElementById('pwd2').value;
      const btn    = document.getElementById('submitBtn');
      const msgOk  = document.getElementById('msgSuccess');
      const msgErr = document.getElementById('msgError');

      msgOk.classList.add('hidden');
      msgErr.classList.add('hidden');

      if (pwd !== pwd2) {
        msgErr.textContent = 'Les mots de passe ne correspondent pas.';
        msgErr.classList.remove('hidden');
        return;
      }

      btn.textContent = 'Enregistrement…';
      btn.disabled = true;

      try {
        const res = await fetch(`https://red-product-back-jtx4.onrender.com/api/auth/reset-password/${resetToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd }),
        });

        const data = await res.json();

        if (res.ok) {
          msgOk.classList.remove('hidden');
          document.getElementById('formReset').classList.add('hidden');
        } else {
          msgErr.textContent = data.error || data.message || 'Erreur lors de la réinitialisation.';
          msgErr.classList.remove('hidden');
        }
      } catch {
        msgErr.textContent = 'Erreur réseau / serveur.';
        msgErr.classList.remove('hidden');
      }

      btn.textContent = 'Changer le mot de passe';
      btn.disabled = false;
    }