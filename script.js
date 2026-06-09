// === THEME (must run first) ===
(function initTheme() {
  const storageKey = "aanya-theme";
  const stored = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

function runWhenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

runWhenReady(() => {
  console.log("Portfolio loaded ✅");

  // === SCROLL PROGRESS BAR ===
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("role", "presentation");
  progressBar.setAttribute("aria-hidden", "true");
  document.body.prepend(progressBar);

  let progressTick = false;

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    progressTick = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!progressTick) {
        progressTick = true;
        requestAnimationFrame(updateScrollProgress);
      }
    },
    { passive: true }
  );
  updateScrollProgress();

  // === REVEAL ON SCROLL ===
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  // === NAV SHRINK ON SCROLL ===
  const nav = document.querySelector(".nav");
  if (nav) {
    const onNavScroll = () => {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onNavScroll, { passive: true });
    onNavScroll();
  }

  // === ABOUT STATS COUNTERS ===
  const statNumbers = document.querySelectorAll(".about__stat-number[data-count]");
  if (statNumbers.length && "IntersectionObserver" in window) {
    const animateCount = (el) => {
      const target = Number(el.getAttribute("data-count")) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1400;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = `${value}${suffix}`;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = `${target}${suffix}`;
        }
      };

      requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    statNumbers.forEach((el) => statsObserver.observe(el));
  }

  // === PAGE-LOAD SPLASH ===
  const splash = document.createElement("div");
  splash.className = "page-splash";
  splash.setAttribute("aria-hidden", "true");
  splash.innerHTML = '<span class="page-splash__brand">Aanya Sharma</span>';
  document.body.appendChild(splash);
  window.setTimeout(() => splash.remove(), 900);

  // === THEME TOGGLE (UI) ===
  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    const storageKey = "aanya-theme";

    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") || "light";

    const setToggleUi = (theme) => {
      const isDark = theme === "dark";
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
      themeToggle.textContent = isDark ? "☀️" : "🌙";
    };

    setToggleUi(getTheme());

    themeToggle.addEventListener("click", () => {
      const next = getTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(storageKey, next);
      setToggleUi(next);
    });
  }

  // Contact form (existing handler — preserved)
  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    const contactSuccess = document.getElementById("contact-success");

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      console.log(data);

      // Grab the four values from the form and rename fullName → full_name for the database
      const full_name = data.fullName;
      const email = data.email;
      const subject = data.subject;
      const message = data.message;

      // Find or create the red error message element (stays hidden until something fails)
      let contactError = document.getElementById("contact-error");
      if (!contactError) {
        contactError = document.createElement("p");
        contactError.id = "contact-error";
        contactError.className = "contact-error";
        contactError.textContent = "Something went wrong. Please try again.";
        contactError.style.color = "#ef4444";
        contactForm.parentNode.insertBefore(contactError, contactSuccess);
      }

      // Hide any previous error or success message while we try again
      contactError.hidden = true;
      contactSuccess.hidden = true;
      contactForm.hidden = false;

      // Make sure the Supabase client loaded (supabase-config.js must run before script.js)
      if (typeof supabaseClient === "undefined") {
        console.error("supabaseClient is missing — check script order on contact.html");
        contactError.hidden = false;
        return;
      }

      let response;

      try {
        // Send the submission to Supabase
        response = await supabaseClient
          .from("form")
          .insert([{ full_name, email, subject, message }]);
      } catch (err) {
        // Network or unexpected error (e.g. opening the page as a local file)
        console.error(err);
        contactError.hidden = false;
        return;
      }

      // Log the full response so we can debug in the browser console
      console.log(response);

      if (response.error) {
        // Database said no — log the real reason, keep form visible
        console.error("Supabase error:", response.error);
        contactError.hidden = false;
        return;
      }

      // Success — hide the form, show the green message, clear the fields for next time
      contactForm.reset();
      contactForm.hidden = true;
      contactSuccess.hidden = false;
    });
  }

  // Hamburger (existing handler — preserved)
  const navToggle = document.querySelector(".nav__toggle");

  if (nav && navToggle) {
    const navLinks = nav.querySelectorAll(".nav__link");

    const closeMenu = () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  // === ADMIN INBOX (only runs on admin.html) ===
  const adminInbox = document.getElementById("admin-inbox");

  if (adminInbox) {
    const adminCount = document.getElementById("admin-count");
    const unreadOnlyToggle = document.getElementById("admin-unread-only");

    // Turn a database timestamp into a friendly "2 hours ago" string
    function timeAgo(dateString) {
      const now = new Date();
      const then = new Date(dateString);
      const seconds = Math.floor((now - then) / 1000);

      if (seconds < 60) {
        return "just now";
      }

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
      }

      const days = Math.floor(hours / 24);
      if (days < 7) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
      }

      return then.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    // Update the toolbar counter, e.g. "📬 12 messages"
    function updateAdminCount(total) {
      if (!adminCount) {
        return;
      }
      const label = total === 1 ? "message" : "messages";
      adminCount.textContent = `📬 ${total} ${label}`;
    }

    // Build one HTML card for a single database row
    function createMessageCard(row) {
      const card = document.createElement("article");
      card.className = "message-card";
      card.dataset.id = String(row.id);

      if (row.is_read) {
        card.classList.add("is-read");
      }

      card.innerHTML = `
        <div class="message-card__top">
          <h3 class="message-card__subject"></h3>
          <time class="message-card__time"></time>
        </div>
        <p class="message-card__sender"></p>
        <p class="message-card__body"></p>
        <div class="message-card__actions">
          <button type="button" class="message-card__mark-read">Mark as Read</button>
        </div>
      `;

      card.querySelector(".message-card__subject").textContent = row.subject;
      card.querySelector(".message-card__time").textContent = timeAgo(row.created_at);
      card.querySelector(".message-card__time").setAttribute("datetime", row.created_at);
      card.querySelector(".message-card__sender").textContent = `${row.full_name} · ${row.email}`;
      card.querySelector(".message-card__body").textContent = row.message;

      const markReadBtn = card.querySelector(".message-card__mark-read");

      if (row.is_read) {
        markReadBtn.disabled = true;
        markReadBtn.textContent = "Read";
      }

      return card;
    }

    // Wire the "Mark as Read" button on a single card
    function wireMarkAsRead(card) {
      const markReadBtn = card.querySelector(".message-card__mark-read");

      if (!markReadBtn || card.classList.contains("is-read")) {
        return;
      }

      markReadBtn.addEventListener("click", async () => {
        const rowId = card.dataset.id;

        if (typeof supabaseClient === "undefined") {
          console.error("supabaseClient is missing — check script order on admin.html");
          return;
        }

        markReadBtn.disabled = true;

        let response;

        try {
          response = await supabaseClient
            .from("form")
            .update({ is_read: true })
            .eq("id", rowId);
        } catch (err) {
          console.error(err);
          markReadBtn.disabled = false;
          return;
        }

        if (response.error) {
          console.error("Supabase error:", response.error);
          markReadBtn.disabled = false;
          return;
        }

        // Success — restyle only this card, no full reload
        card.classList.add("is-read");
        markReadBtn.textContent = "Read";
      });
    }

    // Fetch every message from Supabase and paint the grid
    async function loadAdminInbox() {
      if (typeof supabaseClient === "undefined") {
        console.error("supabaseClient is missing — check script order on admin.html");
        adminInbox.innerHTML =
          '<p class="admin__empty">Could not connect to the database. Check supabase-config.js.</p>';
        return;
      }

      adminInbox.innerHTML = '<p class="admin__empty">Loading messages…</p>';

      let response;

      try {
        response = await supabaseClient
          .from("form")
          .select("*")
          .order("created_at", { ascending: false });
      } catch (err) {
        console.error(err);
        adminInbox.innerHTML =
          '<p class="admin__empty">Something went wrong while loading messages.</p>';
        return;
      }

      if (response.error) {
        console.error("Supabase error:", response.error);
        adminInbox.innerHTML =
          '<p class="admin__empty">Could not load messages. Check your Supabase permissions.</p>';
        return;
      }

      const rows = response.data || [];
      adminInbox.innerHTML = "";

      if (rows.length === 0) {
        adminInbox.innerHTML =
          '<p class="admin__empty">No messages yet. Share your contact page to get started.</p>';
      } else {
        rows.forEach((row) => {
          const card = createMessageCard(row);
          wireMarkAsRead(card);
          adminInbox.appendChild(card);
        });
      }

      updateAdminCount(rows.length);
    }

    // When "Unread only" is checked, hide read cards with a CSS class on the grid
    if (unreadOnlyToggle) {
      unreadOnlyToggle.addEventListener("change", () => {
        adminInbox.classList.toggle("admin__grid--unread-only", unreadOnlyToggle.checked);
      });
    }

    loadAdminInbox();
  }
});
