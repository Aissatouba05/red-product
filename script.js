const API = "https://red-product-back-jtx4.onrender.com";
const API_BASE = `${API}/api/auth`;

// ========= LOGIN =========
async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userNom", data.user.nom || data.user.email);
      localStorage.setItem("userId", data.user.id);
      window.location = "dashboard.html";
    } else {
      alert(data.error || "Identifiants incorrects");
    }
  } catch {
    alert("Erreur réseau / serveur");
  }
}

// ========= REGISTER =========
async function register(email, password, nom) {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nom }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Inscription réussie, connectez-vous");
      window.location = "index.html";
    } else {
      alert(data.error || "Erreur d'inscription");
    }
  } catch {
    alert("Erreur réseau / serveur");
  }
}

// ========= FORGOT PASSWORD =========
async function forgotPassword(email) {
  try {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      alert("Email envoyé, vérifiez Gmail !");
    } else {
      const data = await res.json();
      alert(data.error || "Erreur lors de l'envoi");
    }
  } catch {
    alert("Erreur réseau / serveur");
  }
}

// ========= RESET PASSWORD =========
async function resetPassword(newPassword) {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (!token) { alert("URL invalide"); return; }
  try {
    const res = await fetch(`${API_BASE}/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    if (res.ok) {
      alert("Mot de passe changé !");
      window.location = "index.html";
    } else {
      const data = await res.json();
      alert(data.error || "Erreur de réinitialisation");
    }
  } catch {
    alert("Erreur réseau / serveur");
  }
}

// ========= DÉCONNEXION =========
async function logout() {
  const token = localStorage.getItem("token");
  try {
    await fetch(`${API}/api/auth/deconnexion`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch { /* serveur absent */ }
  localStorage.removeItem("token");
  localStorage.removeItem("userNom");
  localStorage.removeItem("userId");
  window.location = "index.html";
}

// ========= AFFICHER NOM UTILISATEUR =========
const authToken = localStorage.getItem("token");
const userNomElement = document.getElementById("userNom");
if (userNomElement) {
  const nomLocal = localStorage.getItem("userNom");
  if (nomLocal) userNomElement.textContent = nomLocal;
  if (authToken) {
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(user => {
      const nom = user.nom || user.name || "Utilisateur";
      userNomElement.textContent = nom;
      localStorage.setItem("userNom", nom);
      localStorage.setItem("userId", user._id || user.id);
    })
    .catch(() => {
      userNomElement.textContent = nomLocal || "Utilisateur";
    });
  }
}