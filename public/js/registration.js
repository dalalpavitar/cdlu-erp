document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    var data = {
      name: document.getElementById('studentName').value.trim(),
      fatherName: document.getElementById('fatherName').value.trim(),
      dob: document.getElementById('dob').value,
      gender: document.getElementById('gender').value,
      category: document.getElementById('category').value,
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      programme: document.getElementById('programme').value,
      qualification: document.getElementById('qualification').value,
      percentage: document.getElementById('percentage').value.trim(),
      address: document.getElementById('address').value.trim()
    };

    try {
      var result = await API.post('/students', data);
      if (result.success) {
        document.getElementById('regIdDisplay').textContent = result.reg_id;
        form.style.display = 'none';
        document.getElementById('regSuccess').style.display = 'block';
      } else {
        alert('Error: ' + (result.error || 'Registration failed'));
        btn.disabled = false;
        btn.textContent = 'Submit Registration';
      }
    } catch (err) {
      alert('Server error. Please try again.');
      btn.disabled = false;
      btn.textContent = 'Submit Registration';
    }
  });
});
