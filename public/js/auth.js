function checkAuth() {
  var token = localStorage.getItem('cdluToken');
  var role = localStorage.getItem('cdluRole');
  var name = localStorage.getItem('cdluName');
  if (!token) return null;
  return { token: token, role: role, name: name, id: localStorage.getItem('cdluId'), regId: localStorage.getItem('cdluRegId') };
}

function requireAuth(roles) {
  var user = checkAuth();
  if (!user) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
    return null;
  }
  if (roles && !roles.includes(user.role)) {
    alert('Access denied: ' + roles.join(' or ') + ' only');
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function logout() {
  localStorage.removeItem('cdluToken');
  localStorage.removeItem('cdluRole');
  localStorage.removeItem('cdluName');
  window.location.href = 'login.html';
}

function setupNav(user) {
  document.querySelectorAll('.nav-role').forEach(function(el) {
    var roles = (el.getAttribute('data-roles') || '').split(',');
    if (user && roles.includes(user.role)) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
  var nameEl = document.getElementById('userName');
  if (nameEl && user) nameEl.textContent = user.name;
}

async function adminLogin(password) {
  var result = await API.post('/auth/login', { role: 'admin', password: password });
  if (result.success) {
    localStorage.setItem('cdluToken', result.token);
    localStorage.setItem('cdluRole', 'admin');
    localStorage.setItem('cdluName', 'Admin');
    return true;
  }
  return false;
}
