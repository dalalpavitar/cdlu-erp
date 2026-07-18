/* University Website - Common Scripts */
document.addEventListener("DOMContentLoaded", function() {

  /* === Mobile Nav === */
  var hamburger = document.querySelector(".hamburger");
  var mobileNav = document.querySelector(".mobile-nav");
  var overlay = document.querySelector(".mobile-nav-overlay");
  var closeBtn = document.querySelector(".mobile-nav-close");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", function() {
      hamburger.classList.toggle("active");
      mobileNav.classList.toggle("open");
      if (overlay) overlay.classList.toggle("open");
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function() {
        hamburger.classList.remove("active");
        mobileNav.classList.remove("open");
        if (overlay) overlay.classList.remove("open");
      });
    }
    if (overlay) {
      overlay.addEventListener("click", function() {
        hamburger.classList.remove("active");
        mobileNav.classList.remove("open");
        overlay.classList.remove("open");
      });
    }
  }

  /* Mobile submenu toggles */
  document.querySelectorAll(".mobile-submenu-toggle").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var submenu = this.parentElement.nextElementSibling;
      if (submenu && submenu.classList.contains("mobile-submenu")) {
        submenu.classList.toggle("open");
        this.textContent = submenu.classList.contains("open") ? "-" : "+";
      }
    });
  });

  /* === Back to Top === */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function() {
      backToTop.classList.toggle("visible", window.scrollY > 400);
    });
    backToTop.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* === Stats Counter Animation === */
  var statNumbers = document.querySelectorAll(".stat-item h3");
  if (statNumbers.length > 0) {
    var counted = false;
    function countUp() {
      if (counted) return;
      var triggerBottom = window.innerHeight * 0.85;
      var statsSection = document.querySelector(".stats-bar");
      if (!statsSection) return;
      var statsTop = statsSection.getBoundingClientRect().top;
      if (statsTop < triggerBottom) {
        counted = true;
        statNumbers.forEach(function(el) {
          var text = el.textContent.replace(/,/g, "").replace(/\+/g, "");
          var target = parseInt(text);
          if (isNaN(target)) return;
          var current = 0;
          var increment = Math.ceil(target / 60);
          var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
              el.textContent = target.toLocaleString() + "+";
              clearInterval(timer);
            } else {
              el.textContent = current.toLocaleString() + "+";
            }
          }, 25);
        });
      }
    }
    window.addEventListener("scroll", countUp);
    countUp();
  }

  /* === Tab Switching === */
  var tabBtns = document.querySelectorAll(".tab-btn");
  var programItems = document.querySelectorAll(".program-item");
  if (tabBtns.length > 0 && programItems.length > 0) {
    tabBtns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        tabBtns.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var dept = btn.getAttribute("data-dept");
        programItems.forEach(function(item) {
          item.style.display = (dept === "all" || item.getAttribute("data-dept") === dept) ? "block" : "none";
        });
      });
    });
  }

  /* === Filter Tabs === */
  var filterTabs = document.querySelectorAll(".filter-tab");
  var filterItems = document.querySelectorAll(".filter-item");
  if (filterTabs.length > 0 && filterItems.length > 0) {
    filterTabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        filterTabs.forEach(function(t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var cat = tab.getAttribute("data-filter");
        filterItems.forEach(function(item) {
          item.style.display = (cat === "all" || item.getAttribute("data-category") === cat) ? "block" : "none";
        });
      });
    });
  }

  /* === Lightbox === */
  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = document.querySelector(".lightbox img");
  var lightboxClose = document.querySelector(".lightbox-close");
  if (lightbox) {
    document.querySelectorAll("[data-lightbox]").forEach(function(el) {
      el.addEventListener("click", function() {
        var src = this.getAttribute("data-lightbox") || this.querySelector("img")?.src;
        if (src && lightboxImg) {
          lightboxImg.src = src;
          lightbox.classList.add("open");
        }
      });
    });
    if (lightboxClose) {
      lightboxClose.addEventListener("click", function() { lightbox.classList.remove("open"); });
    }
    lightbox.addEventListener("click", function(e) {
      if (e.target === lightbox) lightbox.classList.remove("open");
    });
  }

  /* === Hero Slider === */
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".slider-dot");
  if (slides.length > 0) {
    var current = 0;
    function showSlide(idx) {
      slides.forEach(function(s) { s.classList.remove("active"); });
      dots.forEach(function(d) { d.classList.remove("active"); });
      slides[idx].classList.add("active");
      dots[idx].classList.add("active");
      current = idx;
    }
    function nextSlide() { showSlide((current + 1) % slides.length); }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() { showSlide(i); });
    });
    setInterval(nextSlide, 5000);
  }

  /* === Visitor Counter === */
  var visitorEls = document.querySelectorAll(".visitor-count");
  if (visitorEls.length > 0) {
    fetch("/api/visitors/count").then(function(r) { return r.json(); }).then(function(data) {
      visitorEls.forEach(function(el) { el.textContent = data.count.toLocaleString(); });
    }).catch(function() {
      visitorEls.forEach(function(el) { el.textContent = "0"; });
    });
    fetch("/api/visitors/track", { method: "POST" }).catch(function() {});
  }

  /* === Load Notices === */
  var noticeBoard = document.getElementById("noticeBoard");
  if (noticeBoard) {
    fetch("/api/notices")
      .then(function(r) { return r.json(); })
      .then(function(notices) {
        if (!notices || notices.length === 0) {
          noticeBoard.innerHTML = "<p style='text-align:center;color:var(--text-muted);padding:20px;'>No notices at this time.</p>";
          return;
        }
        var html = "";
        notices.slice(0, 8).forEach(function(n) {
          var dotClass = n.priority || "normal";
          var date = n.created_at ? new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
          html += "<div class='notice-item'><div class='notice-dot " + dotClass + "'></div><div class='notice-body'><div class='notice-title'>" + n.title + "</div><div class='notice-meta'>" + date + "<span class='notice-priority " + dotClass + "'>" + dotClass + "</span></div></div></div>";
        });
        noticeBoard.innerHTML = html;
      })
      .catch(function() {
        noticeBoard.innerHTML = "<p style='text-align:center;color:var(--text-muted);padding:20px;'>Unable to load notices.</p>";
      });
  }

  /* === Load Events === */
  var eventsList = document.getElementById("eventsList");
  if (eventsList) {
    fetch("/api/events")
      .then(function(r) { return r.json(); })
      .then(function(events) {
        if (!events || events.length === 0) {
          eventsList.innerHTML = "<p style='text-align:center;color:var(--text-muted);padding:20px;'>No upcoming events.</p>";
          return;
        }
        var html = "";
        events.slice(0, 6).forEach(function(e) {
          var d = new Date(e.event_date);
          var day = d.getDate();
          var month = d.toLocaleString("en", { month: "short" });
          html += "<div class='event-item'><div class='event-date-box'><span class='day'>" + day + "</span><span class='month'>" + month + "</span></div><div class='event-info'><h4>" + e.title + "</h4><p>" + (e.description || "") + "</p><div class='event-meta'>" + (e.location ? "📍 " + e.location : "") + (e.event_time ? " 🕐 " + e.event_time : "") + "</div></div></div>";
        });
        eventsList.innerHTML = html;
      })
      .catch(function() {
        eventsList.innerHTML = "<p style='text-align:center;color:var(--text-muted);padding:20px;'>Unable to load events.</p>";
      });
  }

  /* === Contact Form === */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var data = {};
      contactForm.querySelectorAll("input, textarea, select").forEach(function(el) {
        if (el.id && el.type !== "submit") data[el.id] = el.value.trim();
      });
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function(r) { return r.json(); }).then(function(res) {
        var msg = document.getElementById("formMessage");
        if (msg) {
          msg.textContent = res.message || "Thank you for your message!";
          msg.className = "alert alert-success";
          msg.style.display = "block";
        }
        contactForm.reset();
      }).catch(function() {
        var msg = document.getElementById("formMessage");
        if (msg) {
          msg.textContent = "Something went wrong. Please try again.";
          msg.className = "alert alert-error";
          msg.style.display = "block";
        }
      });
    });
  }

  /* === Font Size Controls === */
  document.querySelectorAll(".font-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var action = this.getAttribute("data-action");
      var body = document.body;
      var current = parseFloat(window.getComputedStyle(body).fontSize);
      if (action === "increase" && current < 20) body.style.fontSize = (current + 1) + "px";
      if (action === "decrease" && current > 12) body.style.fontSize = (current - 1) + "px";
      if (action === "reset") body.style.fontSize = "";
    });
  });

});
