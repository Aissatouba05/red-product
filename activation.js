const API = 'https://red-product-back-jtx4.onrender.com';
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

async function activateAccount() {
  if (!token) {
    showError("Aucun token trouvé dans l'URL.");
    return;
  }

  // Affiche un message d'attente après 5 secondes
  const loadingMsg = document.querySelector('#stateLoading p');
  const wakeTimer = setTimeout(() => {
    loadingMsg.textContent = '⏳ Le serveur se réveille, encore quelques secondes...';
  }, 5000);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 secondes

    const res = await fetch(`${API}/api/auth/activate?token=${token}`, {
      signal: controller.signal
    });

    clearTimeout(timeout);
    clearTimeout(wakeTimer);

    const data = await res.json();

    if (res.ok) {
      document.getElementById('stateLoading').classList.add('hidden');
      document.getElementById('stateSuccess').classList.remove('hidden');
    } else {
      showError(data.error || 'Lien invalide ou expiré.');
    }
  } catch (err) {
    clearTimeout(wakeTimer);
    if (err.name === 'AbortError') {
      showError('Le serveur ne répond pas. Réessayez dans 1 minute.');
    } else {
      showError('Erreur réseau. Vérifiez votre connexion et réessayez.');
    }
  }
}

function showError(msg) {
  document.getElementById('stateLoading').classList.add('hidden');
  document.getElementById('stateError').classList.remove('hidden');
  document.getElementById('errorMsg').textContent = msg;
}

async function resendActivation() {
  const email = document.getElementById('resendEmail').value.trim();
  const msgEl = document.getElementById('resendMsg');
  if (!email) { alert('Entrez votre email.'); return; }

  try {
    const res = await fetch(`${API}/api/auth/resend-activation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    msgEl.textContent = res.ok ? '✅ Email envoyé ! Vérifiez votre boîte.' : (data.error || 'Erreur.');
    msgEl.className = res.ok ? 'text-xs text-green-600 mb-2' : 'text-xs text-red-500 mb-2';
    msgEl.classList.remove('hidden');
  } catch {
    msgEl.textContent = 'Erreur réseau / serveur.';
    msgEl.classList.remove('hidden');
  }
}

window.addEventListener('load', activateAccount);