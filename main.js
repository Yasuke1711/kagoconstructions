(() => {
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-progress]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("#mobileNav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateScrollState = () => {
    const scrollY = window.scrollY || 0;
    if (header) header.classList.toggle("is-scrolled", scrollY > 12);
    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0;
      progress.style.transform = "scaleX(" + amount + ")";
    }
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    mobileNav.hidden = true;
  };

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      mobileNav.hidden = !open;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".desktop-nav a").forEach((link) => {
    const target = link.getAttribute("href");
    if (target === currentFile) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const filterButtons = document.querySelectorAll("[data-project-filter]");
  const projectCards = document.querySelectorAll("[data-project-card]");
  if (filterButtons.length && projectCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.getAttribute("data-project-filter") || "all";
        filterButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });

        projectCards.forEach((card) => {
          const matches = filter === "all" || card.getAttribute("data-category") === filter;
          card.hidden = !matches;
        });
      });
    });
  }

  const briefForm = document.querySelector("#projectBriefForm");
  const briefOutput = document.querySelector("#briefOutput");
  const generatedBrief = document.querySelector("#generatedBrief");
  const copyButton = document.querySelector("#copyBriefButton");
  const editButton = document.querySelector("#editBriefButton");
  const copyStatus = document.querySelector("#copyStatus");

  if (briefForm && briefOutput && generatedBrief) {
    briefForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!briefForm.reportValidity()) return;

      const formData = new FormData(briefForm);
      const lines = [
        "GREM CONSTRUCTIONS | PROJECT BRIEF",
        "",
        "Project type: " + (formData.get("projectType") || "Not specified"),
        "Site location: " + (formData.get("location") || "Not specified"),
        "Preferred start: " + (formData.get("timeline") || "Not specified"),
        "Estimated budget: " + (formData.get("budget") || "To be discussed"),
        "",
        "Project notes:",
        (formData.get("details") || "No additional details supplied."),
        "",
        "Prepared using the Grem Constructions website concept."
      ];

      generatedBrief.value = lines.join("\n");
      briefOutput.hidden = false;
      if (copyStatus) copyStatus.textContent = "Your project brief is ready. Copy it to share it with the business.";
      briefOutput.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
    });

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        if (!generatedBrief.value) return;
        try {
          await navigator.clipboard.writeText(generatedBrief.value);
          if (copyStatus) copyStatus.textContent = "Copied. Your brief is ready to paste.";
        } catch (error) {
          generatedBrief.focus();
          generatedBrief.select();
          if (copyStatus) copyStatus.textContent = "Select and copy the highlighted brief.";
        }
      });
    }

    if (editButton) {
      editButton.addEventListener("click", () => {
        briefOutput.hidden = true;
        briefForm.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
    }
  }
})();