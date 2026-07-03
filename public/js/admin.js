var allStudents = [];

function adminLogin() {
  var pass = document.getElementById('adminPass').value;
  if (pass === 'cdlu@2026') {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadStudents();
  } else {
    alert('Incorrect password. Try: cdlu@2026');
  }
}

function adminLogout() {
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
}

async function loadStudents() {
  try {
    var data = await API.get('/students');
    allStudents = data;
    renderTable();
  } catch (err) {
    console.error('Failed to load students:', err);
    document.getElementById('noDataMsg').textContent = 'Error loading data from server.';
    document.getElementById('noDataMsg').style.display = 'block';
  }
}

function renderTable() {
  var data = allStudents;
  var search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  var tbody = document.getElementById('regBody');
  var noMsg = document.getElementById('noDataMsg');

  if (search) {
    data = data.filter(function (r) {
      return (r.name || '').toLowerCase().includes(search) ||
             (r.phone || '').includes(search) ||
             (r.reg_id || '').toLowerCase().includes(search) ||
             (r.father_name || '').toLowerCase().includes(search);
    });
  }

  document.getElementById('totalCount').textContent = allStudents.length;
  var today = new Date().toISOString().slice(0, 10);
  document.getElementById('todayCount').textContent = allStudents.filter(function (r) {
    return r.created_at ? r.created_at.slice(0, 10) === today : false;
  }).length;
  document.getElementById('pendingCount').textContent = allStudents.length;

  if (data.length === 0) {
    tbody.innerHTML = '';
    noMsg.style.display = 'block';
    return;
  }
  noMsg.style.display = 'none';

  var html = '';
  data.forEach(function (r, i) {
    var d = r.dob ? new Date(r.dob).toLocaleDateString('en-IN') : '-';
    var regDate = r.created_at ? new Date(r.created_at).toLocaleString('en-IN') : '-';
    html += '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td><strong>' + (r.reg_id || '-') + '</strong></td>' +
      '<td>' + (r.name || '-') + '</td>' +
      '<td>' + (r.father_name || '-') + '</td>' +
      '<td>' + d + '</td>' +
      '<td>' + (r.gender || '-') + '</td>' +
      '<td>' + (r.category || '-') + '</td>' +
      '<td>' + (r.phone || '-') + '</td>' +
      '<td>' + (r.email || '-') + '</td>' +
      '<td>' + (r.program_name || '-') + '</td>' +
      '<td>' + (r.qualification || '-') + '</td>' +
      '<td>' + (r.percentage || '-') + '</td>' +
      '<td>' + regDate + '</td>' +
      '</tr>';
  });
  tbody.innerHTML = html;
}

function filterRegistrations() {
  renderTable();
}

function exportCSV() {
  if (allStudents.length === 0) { alert('No data to export.'); return; }
  var headers = ['Reg ID', 'Name', "Father's Name", 'DOB', 'Gender', 'Category', 'Phone', 'Email', 'Programme', 'Qualification', 'Percentage', 'Address', 'Registered On'];
  var csv = headers.join(',') + '\n';
  allStudents.forEach(function (r) {
    var row = [
      r.reg_id || '', r.name || '', r.father_name || '', r.dob || '', r.gender || '',
      r.category || '', r.phone || '', r.email || '', r.program_name || '',
      r.qualification || '', r.percentage || '', (r.address || '').replace(/,/g, ';'), r.created_at || ''
    ];
    csv += row.join(',') + '\n';
  });
  downloadFile(csv, 'cdlu-students.csv', 'text/csv');
}

function exportJSON() {
  if (allStudents.length === 0) { alert('No data to export.'); return; }
  downloadFile(JSON.stringify(allStudents, null, 2), 'cdlu-students.json', 'application/json');
}

function downloadFile(content, filename, mime) {
  var blob = new Blob([content], { type: mime });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function printReport() {
  window.print();
}

async function clearAllData() {
  if (!confirm('Are you sure you want to delete ALL students?')) return;
  if (!confirm('This cannot be undone. Proceed?')) return;
  for (var s of allStudents) {
    await API.delete('/students/' + s.id);
  }
  allStudents = [];
  renderTable();
}

document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('cdluAdminLoggedIn') === 'true') {
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadStudents();
  }
});
