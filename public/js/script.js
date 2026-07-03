document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav
  var hamburger = document.querySelector('.hamburger');
  var nav = document.querySelector('.nav');

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  document.querySelectorAll('.nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
    });
  });

  // Back to top
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Stats counter animation
  var statNumbers = document.querySelectorAll('.stat-item h3');
  if (statNumbers.length > 0) {
    var counted = false;
    function countUp() {
      if (counted) return;
      var triggerBottom = window.innerHeight * 0.85;
      var statsSection = document.querySelector('.stats');
      if (!statsSection) return;
      var statsTop = statsSection.getBoundingClientRect().top;
      if (statsTop < triggerBottom) {
        counted = true;
        statNumbers.forEach(function (el) {
          var text = el.textContent.replace(/,/g, '').replace(/\+/g, '');
          var target = parseInt(text);
          if (isNaN(target)) return;
          var current = 0;
          var increment = Math.ceil(target / 60);
          var timer = setInterval(function () {
            current += increment;
            if (current >= target) {
              el.textContent = target.toLocaleString() + '+';
              clearInterval(timer);
            } else {
              el.textContent = current.toLocaleString() + '+';
            }
          }, 25);
        });
      }
    }
    window.addEventListener('scroll', countUp);
    countUp();
  }

  // Tab switching (academics)
  var tabBtns = document.querySelectorAll('.tab-btn');
  var programItems = document.querySelectorAll('.program-item');
  if (tabBtns.length > 0 && programItems.length > 0) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var dept = btn.getAttribute('data-dept');
        programItems.forEach(function (item) {
          if (dept === 'all' || item.getAttribute('data-dept') === dept) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // Contact form
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = 'Thank you! Your message has been sent.';
      btn.style.background = '#138808';
      btn.style.color = '#fff';
      contactForm.reset();
      setTimeout(function () {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
      }, 3000);
    });
  }
});
