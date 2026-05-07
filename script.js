
// const API = "https://red-product-back-jtx4.onrender.com";
// const API_BASE = `${API}/api/auth`;

// // ========= LOGIN =========
// async function login(email, password) {
//   try {
//     const res = await fetch(`${API_BASE}/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await res.json();
//     if (res.ok) {
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("userNom", data.user.nom || data.user.email);
//       localStorage.setItem("userId", data.user.id);

//       // ✅ Charger la photo de profil depuis le backend dès la connexion
//       try {
//         const meRes = await fetch(`${API_BASE}/me`, {
//           headers: { Authorization: `Bearer ${data.token}` }
//         });
//         const user = await meRes.json();
//         if (user.photo) {
//           const photoUrl = user.photo.startsWith('http') ? user.photo : `${API}${user.photo}`;
//           localStorage.setItem("redproduct_photo", photoUrl);
//         } else {
//           localStorage.removeItem("redproduct_photo");
//         }
//       } catch { /* pas grave */ }

//       // ✅ Afficher toast succès avant redirection
//       showToast("Connexion réussie ✅", "success");
//       setTimeout(() => { window.location = "dashboard.html"; }, 1500);
//     } else {
//       alert(data.error || "Identifiants incorrects");
//     }
//   } catch {
//     alert("Erreur réseau / serveur");
//   }
// }

// // ========= REGISTER =========
// async function register(email, password, nom) {
//   try {
//     const res = await fetch(`${API_BASE}/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password, nom }),
//     });
//     const data = await res.json();
//     if (res.ok) {
//       alert("Inscription réussie, connectez-vous");
//       window.location = "index.html";
//     } else {
//       alert(data.error || "Erreur d'inscription");
//     }
//   } catch {
//     alert("Erreur réseau / serveur");
//   }
// }

// // ========= FORGOT PASSWORD =========
// async function forgotPassword(email) {
//   try {
//     const res = await fetch(`${API_BASE}/forgot-password`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email }),
//     });
//     if (res.ok) {
//       alert("Email envoyé, vérifiez Gmail !");
//     } else {
//       const data = await res.json();
//       alert(data.error || "Erreur lors de l'envoi");
//     }
//   } catch {
//     alert("Erreur réseau / serveur");
//   }
// }

// // ========= RESET PASSWORD =========
// async function resetPassword(newPassword) {
//   const urlParams = new URLSearchParams(window.location.search);
//   const token = urlParams.get("token");
//   if (!token) { alert("URL invalide"); return; }
//   try {
//     const res = await fetch(`${API_BASE}/reset-password/${token}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ password: newPassword }),
//     });
//     if (res.ok) {
//       alert("Mot de passe changé !");
//       window.location = "index.html";
//     } else {
//       const data = await res.json();
//       alert(data.error || "Erreur de réinitialisation");
//     }
//   } catch {
//     alert("Erreur réseau / serveur");
//   }
// }

// // ========= DÉCONNEXION =========
// async function logout() {
//   const token = localStorage.getItem("token");
//   try {
//     await fetch(`${API}/api/auth/deconnexion`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` }
//     });
//   } catch { /* serveur absent */ }
//   // ✅ Vider tout le localStorage sauf la photo n'est pas supprimée
//   // car elle sera rechargée depuis le backend au prochain login
//   localStorage.removeItem("token");
//   localStorage.removeItem("userNom");
//   localStorage.removeItem("userId");
//   localStorage.removeItem("redproduct_photo"); // ← supprimée aussi, rechargée au login
//   window.location = "index.html";
// }

// // ========= TOAST NOTIFICATION =========
// function showToast(message, type = "success") {
//   const toast = document.createElement("div");
//   toast.textContent = message;
//   toast.style.cssText = `
//     position: fixed;
//     top: 24px;
//     left: 50%;
//     transform: translateX(-50%);
//     background: ${type === "success" ? "#22c55e" : "#ef4444"};
//     color: white;
//     padding: 12px 28px;
//     border-radius: 12px;
//     font-size: 15px;
//     font-weight: 600;
//     box-shadow: 0 8px 24px rgba(0,0,0,0.15);
//     z-index: 9999;
//     animation: fadeInDown 0.3s ease;
//   `;

//   // Ajouter animation CSS
//   if (!document.getElementById("toast-style")) {
//     const style = document.createElement("style");
//     style.id = "toast-style";
//     style.textContent = `
//       @keyframes fadeInDown {
//         from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
//         to   { opacity: 1; transform: translateX(-50%) translateY(0); }
//       }
//     `;
//     document.head.appendChild(style);
//   }

//   document.body.appendChild(toast);
//   setTimeout(() => toast.remove(), 1400);
// }

// // ========= AFFICHER NOM UTILISATEUR =========
// const authToken = localStorage.getItem("token");
// const userNomElement = document.getElementById("userNom");
// if (userNomElement) {
//   const nomLocal = localStorage.getItem("userNom");
//   if (nomLocal) userNomElement.textContent = nomLocal;
//   if (authToken) {
//     fetch(`${API}/api/auth/me`, {
//       headers: { Authorization: `Bearer ${authToken}` }
//     })
//     .then(res => res.json())
//     .then(user => {
//       const nom = user.nom || user.name || "Utilisateur";
//       userNomElement.textContent = nom;
//       localStorage.setItem("userNom", nom);
//       localStorage.setItem("userId", user._id || user.id);
//       // ✅ Mettre à jour la photo à chaque chargement de page
//       if (user.photo) {
//         localStorage.setItem("redproduct_photo", `${API}${user.photo}`);
//       }
//     })
//     .catch(() => {
//       userNomElement.textContent = nomLocal || "Utilisateur";
//     });
//   }
// }


    
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

      // ✅ Charger la photo de profil depuis le backend dès la connexion
      try {
        const meRes = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const user = await meRes.json();
        if (user.photo) {
          const photoUrl = user.photo.startsWith('http') ? user.photo : `${API}${user.photo}`;
          localStorage.setItem("redproduct_photo", photoUrl);
        } else {
          localStorage.removeItem("redproduct_photo");
        }
      } catch { /* pas grave */ }

      // ✅ Afficher toast succès avant redirection
      showToast("Connexion réussie ✅", "success");
      setTimeout(() => { window.location = "dashboard.html"; }, 1500);
    } else if (res.status === 403) {
      // Compte non activé
      alert("⚠️ Compte non activé. Vérifiez votre email ou allez sur la page d'activation.");
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
  // ✅ Vider tout le localStorage sauf la photo n'est pas supprimée
  // car elle sera rechargée depuis le backend au prochain login
  localStorage.removeItem("token");
  localStorage.removeItem("userNom");
  localStorage.removeItem("userId");
  localStorage.removeItem("redproduct_photo"); // ← supprimée aussi, rechargée au login
  window.location = "index.html";
}

// ========= TOAST NOTIFICATION =========
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === "success" ? "#22c55e" : "#ef4444"};
    color: white;
    padding: 12px 28px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: fadeInDown 0.3s ease;
  `;

  // Ajouter animation CSS
  if (!document.getElementById("toast-style")) {
    const style = document.createElement("style");
    style.id = "toast-style";
    style.textContent = `
      @keyframes fadeInDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1400);
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
      // ✅ Mettre à jour la photo à chaque chargement de page
      if (user.photo) {
        localStorage.setItem("redproduct_photo", `${API}${user.photo}`);
      }
    })
    .catch(() => {
      userNomElement.textContent = nomLocal || "Utilisateur";
    });
  }
}