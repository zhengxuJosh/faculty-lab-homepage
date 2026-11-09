const body = document.body;
const root = body.dataset.root || ".";
const page = body.dataset.page || "home";

const pathTo = (destination = "") => `${root}/${destination}`;

const headerMount = document.querySelector("[data-site-header]");
const footerMount = document.querySelector("[data-site-footer]");

if (headerMount) {
  headerMount.innerHTML = `
    <header class="site-header">
      <div class="nav-shell">
        <a class="brand" href="${pathTo()}" aria-label="X Lab at Great Bay University homepage">
          <span class="brand-university"><img src="${pathTo("assets/team/gbu-logo.png")}" alt="" /></span>
          <span class="brand-divider" aria-hidden="true"></span>
          <span class="brand-mark"><img src="${pathTo("assets/x-lab-logo-black.svg")}" alt="" /></span>
        </a>

        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <span></span><span></span><span class="sr-only">Menu</span>
        </button>

        <nav id="site-nav" class="site-nav" aria-label="Primary navigation">
          <a href="${pathTo()}" data-page="home" data-en="Home" data-zh="首页">Home</a>
          <a href="${pathTo("lab/")}" data-page="lab" data-en="X Lab" data-zh="X实验室">X Lab</a>
          <a href="${pathTo("join/")}" data-page="join" data-en="Join us" data-zh="加入我们">Join us</a>
        </nav>

        <button class="lang-toggle" type="button" aria-label="切换至中文">
          <span class="lang-current">EN</span><span class="lang-divider">/</span><span>中</span>
        </button>
      </div>
    </header>
  `;
}

if (footerMount) {
  footerMount.innerHTML = `
    <footer class="site-footer">
      <div class="section-shell footer-grid">
        <div>
          <a class="footer-brand" href="${pathTo()}" aria-label="X Lab homepage"><img src="${pathTo("assets/x-lab-logo-black.svg")}" alt="" loading="lazy" /></a>
        </div>
        <div class="footer-address">
          <p data-en="School of Computing and Information Technology" data-zh="信息科学技术学院">School of Computing and Information Technology</p>
          <p data-en="Great Bay University" data-zh="大湾区大学">Great Bay University</p>
        </div>
        <div class="footer-links">
          <a href="${pathTo()}" data-en="Home" data-zh="首页">Home</a>
          <a href="${pathTo("lab/")}" data-en="X Lab" data-zh="X实验室">X Lab</a>
          <a href="${pathTo("join/")}" data-en="Join us" data-zh="加入我们">Join us</a>
        </div>
        <p class="copyright">© <span id="year"></span> X Lab · Great Bay University</p>
      </div>
    </footer>
  `;
}

const languageButton = document.querySelector(".lang-toggle");
const languageCurrent = document.querySelector(".lang-current");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const header = document.querySelector(".site-header");

function setLanguage(language) {
  const isChinese = language === "zh";
  document.documentElement.lang = language;
  document.documentElement.classList.toggle("lang-zh", isChinese);

  document.querySelectorAll("[data-en][data-zh]").forEach((element) => {
    element.textContent = element.dataset[language];
  });

  if (languageCurrent && languageButton) {
    languageCurrent.textContent = isChinese ? "中" : "EN";
    languageButton.querySelector("span:last-child").textContent = isChinese ? "EN" : "中";
    languageButton.setAttribute("aria-label", isChinese ? "Switch to English" : "切换至中文");
  }

  try {
    window.localStorage.setItem("xlab-language", language);
  } catch (_) {
    // Language persistence is optional when storage is unavailable.
  }

  document.dispatchEvent(new Event("xlab:languagechange"));
}

let initialLanguage = "en";
try {
  initialLanguage = window.localStorage.getItem("xlab-language") === "zh" ? "zh" : "en";
} catch (_) {
  // English remains the default when storage is unavailable.
}
setLanguage(initialLanguage);

languageButton?.addEventListener("click", () => {
  setLanguage(document.documentElement.lang === "en" ? "zh" : "en");
});

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navigation?.querySelectorAll("a").forEach((link) => {
  if (link.dataset.page === page) link.setAttribute("aria-current", "page");
  link.addEventListener("click", () => {
    navigation.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener(
  "scroll",
  () => header?.classList.toggle("scrolled", window.scrollY > 16),
  { passive: true },
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0, rootMargin: "0px 0px -24px 0px" },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 60}ms`;
  revealObserver.observe(element);
});

const carousel = document.querySelector(".paper-carousel");

if (carousel) {
  const batches = [...carousel.querySelectorAll(".paper-batch")];
  const dotsContainer = carousel.querySelector(".carousel-dots");
  const count = carousel.querySelector(".carousel-count");
  const previousButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeBatch = 0;
  let rotationTimer;

  const dots = batches.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show publication batch ${index + 1}`);
    dot.addEventListener("click", () => {
      showBatch(index);
      restartRotation();
    });
    dotsContainer.append(dot);
    return dot;
  });

  function showBatch(index) {
    activeBatch = (index + batches.length) % batches.length;
    batches.forEach((batch, batchIndex) => {
      const isActive = batchIndex === activeBatch;
      batch.classList.toggle("is-active", isActive);
      batch.setAttribute("aria-hidden", String(!isActive));
      dots[batchIndex].classList.toggle("is-active", isActive);
      dots[batchIndex].setAttribute("aria-current", isActive ? "true" : "false");
    });
    count.textContent = `${String(activeBatch + 1).padStart(2, "0")} / ${String(batches.length).padStart(2, "0")}`;
  }

  function stopRotation() {
    window.clearInterval(rotationTimer);
  }

  function startRotation() {
    stopRotation();
    if (reduceMotion || document.hidden) return;
    rotationTimer = window.setInterval(() => showBatch(activeBatch + 1), 6500);
  }

  function restartRotation() {
    stopRotation();
    startRotation();
  }

  previousButton?.addEventListener("click", () => {
    showBatch(activeBatch - 1);
    restartRotation();
  });
  nextButton?.addEventListener("click", () => {
    showBatch(activeBatch + 1);
    restartRotation();
  });
  carousel.addEventListener("mouseenter", stopRotation);
  carousel.addEventListener("mouseleave", startRotation);
  carousel.addEventListener("focusin", stopRotation);
  carousel.addEventListener("focusout", startRotation);
  document.addEventListener("visibilitychange", () => (document.hidden ? stopRotation() : startRotation()));

  showBatch(0);
  startRotation();
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const bookingPlanner = document.getElementById("booking-planner");

if (bookingPlanner) {
  const scheduleButtons = [...document.querySelectorAll("[data-schedule-kind]")];
  const availability = globalThis.XLabAvailability;
  const busyDetails = document.getElementById("booking-day-busy");
  const timeFeedback = document.getElementById("booking-time-feedback");
  const title = document.getElementById("booking-planner-title");
  const monthLabel = document.getElementById("booking-month-label");
  const previousMonth = bookingPlanner.querySelector(".booking-month-prev");
  const nextMonth = bookingPlanner.querySelector(".booking-month-next");
  const daysContainer = document.getElementById("booking-days");
  const selectedDateLabel = document.getElementById("booking-selected-date");
  const requestForm = document.getElementById("booking-request-form");
  const beijingTodayParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", year: "numeric", month: "numeric", day: "numeric" })
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
  const today = new Date(Date.UTC(beijingTodayParts.year, beijingTodayParts.month - 1, beijingTodayParts.day));
  const firstRequestDate = new Date(today.getTime() + 86400000);
  const lastRequestDate = new Date(Math.max(today.getTime() + 30 * 86400000, Date.parse(`${availability.endDate}T00:00:00Z`)));
  let visibleYear = firstRequestDate.getUTCFullYear();
  let visibleMonth = firstRequestDate.getUTCMonth();
  let selectedDate = firstRequestDate;
  let selectedKind = "student";
  const timeInput = requestForm.elements.namedItem("time");

  function formatMeetingDate(date) {
    const language = document.documentElement.lang === "zh" ? "zh-CN" : "en-US";
    return new Intl.DateTimeFormat(language, { timeZone: "UTC", year: "numeric", month: "short", day: "numeric", weekday: "short" }).format(date);
  }

  function updateBookingLabels() {
    const isChinese = document.documentElement.lang === "zh";
    title.textContent = selectedKind === "student"
      ? (isChinese ? "有意加入的学生" : "Prospective students")
      : (isChinese ? "科研合作者" : "Research collaborators");
    selectedDateLabel.textContent = selectedDate
      ? formatMeetingDate(selectedDate)
      : (isChinese ? "请在日历中选择日期" : "Choose a date on the calendar");
    renderBusyDetails();
    validateMeetingTime();
    previousMonth.setAttribute("aria-label", isChinese ? "上个月" : "Previous month");
    nextMonth.setAttribute("aria-label", isChinese ? "下个月" : "Next month");
    daysContainer.setAttribute("aria-label", isChinese ? "希望交流的日期" : "Preferred meeting date");
  }

  function renderBusyDetails() {
    const isChinese = document.documentElement.lang === "zh";
    const periods = selectedDate ? availability.busyOn(selectedDate.toISOString().slice(0, 10)) : [];
    busyDetails.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = `${formatMeetingDate(selectedDate)} · ${isChinese ? "已占用时段" : "Busy times"}`;
    busyDetails.append(heading);
    const list = document.createElement("ul");
    for (const period of periods) {
      const item = document.createElement("li");
      item.textContent = `${period.start}–${period.end} · ${isChinese ? "已占用" : "Busy"}`;
      list.append(item);
    }
    if (periods.length) busyDetails.append(list);
    else {
      const note = document.createElement("p");
      note.textContent = isChinese ? "当天暂无已公布的占用时段，预约仍需确认。" : "No published busy times for this date. Requests still need confirmation.";
      busyDetails.append(note);
    }
  }

  function validateMeetingTime() {
    const isChinese = document.documentElement.lang === "zh";
    const duration = selectedKind === "student" ? 20 : 30;
    const valid = !timeInput.value || (selectedDate && availability.canRequest(selectedDate.toISOString().slice(0, 10), timeInput.value, duration));
    const message = isChinese
      ? `请选择可容纳完整 ${duration} 分钟会议、且不与已占用时段重叠的时间。`
      : `Choose a time for the full ${duration}-minute meeting without overlapping a busy period.`;
    timeInput.setCustomValidity(valid ? "" : message);
    timeInput.setAttribute("aria-invalid", String(!valid));
    timeFeedback.textContent = valid
      ? (isChinese ? `本次交流 ${duration} 分钟；请避开已占用时段。` : `This meeting lasts ${duration} minutes. Please avoid busy periods.`)
      : message;
    timeFeedback.classList.toggle("is-error", !valid);
    return valid;
  }

  timeInput.addEventListener("input", validateMeetingTime);

  function renderBookingCalendar() {
    const language = document.documentElement.lang === "zh" ? "zh-CN" : "en-US";
    monthLabel.textContent = new Intl.DateTimeFormat(language, { timeZone: "UTC", year: "numeric", month: "long" })
      .format(new Date(Date.UTC(visibleYear, visibleMonth, 1)));
    daysContainer.replaceChildren();
    const firstDay = new Date(Date.UTC(visibleYear, visibleMonth, 1));
    const leadingDays = (firstDay.getUTCDay() + 6) % 7;
    for (let index = 0; index < leadingDays; index += 1) {
      const spacer = document.createElement("span");
      spacer.setAttribute("aria-hidden", "true");
      daysContainer.append(spacer);
    }
    const daysInMonth = new Date(Date.UTC(visibleYear, visibleMonth + 1, 0)).getUTCDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(Date.UTC(visibleYear, visibleMonth, day));
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(day);
      const busy = availability.busyOn(date.toISOString().slice(0, 10));
      const busyLabel = document.documentElement.lang === "zh" ? "已占用" : "Busy";
      button.setAttribute("aria-label", `${formatMeetingDate(date)}${busy.length ? ` · ${busyLabel} ${busy.map((period) => `${period.start}–${period.end}`).join(", ")}` : ""}`);
      if (busy.length) {
        button.classList.add("has-busy-time");
        const marker = document.createElement("span");
        marker.className = "booking-busy-dot";
        marker.setAttribute("aria-hidden", "true");
        button.append(marker);
      }
      button.disabled = date < firstRequestDate || date > lastRequestDate;
      button.setAttribute("aria-pressed", String(selectedDate?.getTime() === date.getTime()));
      if (!button.disabled) {
        button.addEventListener("click", () => {
          selectedDate = date;
          updateBookingLabels();
          renderBookingCalendar();
        });
      }
      daysContainer.append(button);
    }
    previousMonth.disabled = visibleYear === firstRequestDate.getUTCFullYear() && visibleMonth === firstRequestDate.getUTCMonth();
    nextMonth.disabled = visibleYear === lastRequestDate.getUTCFullYear() && visibleMonth === lastRequestDate.getUTCMonth();
  }

  scheduleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedKind = button.dataset.scheduleKind;
      bookingPlanner.hidden = false;
      scheduleButtons.forEach((item) => item.setAttribute("aria-expanded", "true"));
      updateBookingLabels();
      bookingPlanner.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
  });

  function changeMonth(amount) {
    const date = new Date(Date.UTC(visibleYear, visibleMonth + amount, 1));
    visibleYear = date.getUTCFullYear();
    visibleMonth = date.getUTCMonth();
    renderBookingCalendar();
  }
  previousMonth.addEventListener("click", () => changeMonth(-1));
  nextMonth.addEventListener("click", () => changeMonth(1));

  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!selectedDate) {
      daysContainer.querySelector("button:not(:disabled)")?.focus();
      return;
    }
    if (selectedDate < firstRequestDate || selectedDate > lastRequestDate || !validateMeetingTime()) {
      timeInput.reportValidity();
      return;
    }
    const values = new FormData(requestForm);
    const role = selectedKind === "student" ? "Prospective Student" : "Research Collaboration";
    const body = [
      `Meeting type: ${role}`,
      `Preferred date: ${selectedDate.toISOString().slice(0, 10)}`,
      `Preferred time: ${values.get("time")} (Beijing time, UTC+8)`,
      `Meeting duration: ${selectedKind === "student" ? 20 : 30} minutes`,
      `Preferred platform: ${values.get("platform")}`,
      `Name: ${values.get("name")}`,
      `Email: ${values.get("email")}`,
      `Institution: ${values.get("institution")}`,
      `Research topic: ${values.get("topic")}`,
      "",
      "This is a meeting request. Please confirm the time and share the meeting link.",
    ].join("\n");
    window.location.href = `mailto:zhengx@gbu.edu.cn?subject=${encodeURIComponent(`X Lab Meeting Request — ${role}`)}&body=${encodeURIComponent(body)}`;
  });

  document.addEventListener("xlab:languagechange", () => {
    updateBookingLabels();
    renderBookingCalendar();
  });
  updateBookingLabels();
  renderBookingCalendar();
}
