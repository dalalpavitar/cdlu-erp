var API = {
  base: '',

  getToken() {
    return localStorage.getItem('cdluToken');
  },

  async get(endpoint) {
    var token = this.getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var res = await fetch(this.base + '/api' + endpoint, { headers });
    return res.json();
  },

  async post(endpoint, data) {
    var token = this.getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var res = await fetch(this.base + '/api' + endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async put(endpoint, data) {
    var token = this.getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var res = await fetch(this.base + '/api' + endpoint, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async delete(endpoint) {
    var token = this.getToken();
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    var res = await fetch(this.base + '/api' + endpoint, { method: 'DELETE', headers });
    return res.json();
  },

  formToObject(formId) {
    var form = document.getElementById(formId);
    var data = {};
    var elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(function(el) {
      if (el.id && el.type !== 'submit') {
        data[el.id] = el.value.trim();
      }
    });
    return data;
  },

  showMessage(elementId, message, isError) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.display = 'block';
    el.style.color = isError ? '#c0392b' : '#138808';
    el.style.background = isError ? '#fce4e4' : '#e8f5e9';
    el.style.padding = '12px';
    el.style.borderRadius = '5px';
    el.style.marginTop = '10px';
    el.style.textAlign = 'center';
    setTimeout(function() { el.style.display = 'none'; }, 5000);
  }
};
