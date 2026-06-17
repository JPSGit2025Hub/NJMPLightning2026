/*
  RTR Track Days app logic
  --------------------------------
  This file intentionally reads schedule data from schedule.js only.
  To update future events, edit schedule.js first. The rendering, live status,
  and run-group detail screens will automatically reflect those changes.
*/

const GROUPS = ["WHITE", "RED", "BLACK", "BLUE", "GREEN"];
const DAY_LABELS = {
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday"
};

let activeTab = "live";
let liveDayMode = "auto";
let scheduleDay = "friday";
let selectedGroup = null;

const els = {
  tabs: document.querySelectorAll(".tab"),
  panels: document.querySelectorAll(".panel"),
  liveButtons: document.querySelectorAll("[data-live-day]"),
  scheduleButtons: document.querySelectorAll("[data-schedule-day]"),
  liveDayLabel: document.querySelector("#live-day-label"),
  nowCard: document.querySelector("#now-card"),
  nowTitle: document.querySelector("#now-title"),
  nowTime: document.querySelector("#now-time"),
  deckCard: document.querySelector("#deck-card"),
  deckTitle: document.querySelector("#deck-title"),
  deckTime: document.querySelector("#deck-time"),
  liveUpdated: document.querySelector("#live-updated"),
  scheduleList: document.querySelector("#schedule-list"),
  groupGrid: document.querySelector("#group-grid"),
  groupsOverview: document.querySelector("#groups-overview"),
  groupDetail: document.querySelector("#group-detail"),
  groupDetailContent: document.querySelector("#group-detail-content"),
  groupsBack: document.querySelector("#groups-back")
};

function init() {
  wireTabs();
  wireDaySelectors();
  wireGroups();
  renderLive();
  renderSchedule();
  renderGroupOverview();

  // Live state refreshes every 30 seconds for paddock use.
  window.setInterval(() => {
    renderLive();
    renderSchedule();
    if (selectedGroup) renderGroupDetail(selectedGroup);
  }, 30000);
}

function wireTabs() {
  els.tabs.forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab === button));
      els.panels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === activeTab));
    });
  });
}

function wireDaySelectors() {
  els.liveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      liveDayMode = button.dataset.liveDay;
      els.liveButtons.forEach((dayButton) => dayButton.classList.toggle("is-active", dayButton === button));
      renderLive();
    });
  });

  els.scheduleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scheduleDay = button.dataset.scheduleDay;
      els.scheduleButtons.forEach((dayButton) => dayButton.classList.toggle("is-active", dayButton === button));
      renderSchedule();
    });
  });
}

function wireGroups() {
  els.groupsBack.addEventListener("click", () => {
    selectedGroup = null;
    els.groupsOverview.classList.remove("is-hidden");
    els.groupDetail.classList.add("is-hidden");
  });
}

function renderLive() {
  const now = new Date();
  const autoState = liveDayMode === "auto" ? resolveAutoState(now) : null;

  if (autoState?.status === "before" || autoState?.status === "after") {
    renderEventDateState(autoState.status, now);
    return;
  }

  const day = autoState?.day || liveDayMode;

  if (liveDayMode !== "auto" && !isDateForDay(now, day)) {
    renderSelectedDayDateState(day, now);
    return;
  }

  const state = getDayState(day, now);

  els.liveDayLabel.textContent = liveDayMode === "auto" ? `AUTO - ${DAY_LABELS[day]}` : DAY_LABELS[day];

  paintGroupClass(els.nowCard, state.current?.group);
  paintGroupClass(els.deckCard, state.next?.group);

  els.nowTitle.textContent = state.headline;
  els.nowTime.textContent = state.current ? formatRange(state.current) : state.timeText;
  els.deckTitle.textContent = state.next ? getSessionName(state.next) : state.deckTitle;
  els.deckTime.textContent = state.next ? formatRange(state.next) : state.deckTime;
  els.liveUpdated.textContent = `Updated ${formatClock(now)} - refreshes every 30 seconds`;
}

function renderSelectedDayDateState(day, now) {
  const selectedDate = eventInfo.eventDates[day];
  const today = getISODate(now);
  const isBefore = today < selectedDate;
  const firstTrack = getSortedSessions(day).find((session) => session.type === "track");
  const finalTrack = [...getSortedSessions(day)].reverse().find((session) => session.type === "track");

  els.liveDayLabel.textContent = `${DAY_LABELS[day]} - ${formatEventDate(selectedDate)}`;
  paintGroupClass(els.nowCard, null);
  paintGroupClass(els.deckCard, isBefore ? firstTrack?.group : finalTrack?.group);

  els.nowTitle.textContent = isBefore ? `${DAY_LABELS[day]} NOT STARTED` : `${DAY_LABELS[day]} CONCLUDED`;
  els.nowTime.textContent = formatEventDate(selectedDate);
  els.deckTitle.textContent = isBefore ? getSessionName(firstTrack) : "Final session completed";
  els.deckTime.textContent = isBefore ? formatRange(firstTrack) : formatRange(finalTrack);
  els.liveUpdated.textContent = `Updated ${formatClock(now)} - refreshes every 30 seconds`;
}

function renderEventDateState(status, now) {
  const isBefore = status === "before";

  els.liveDayLabel.textContent = `AUTO - ${formatEventDateRange()}`;
  paintGroupClass(els.nowCard, null);
  paintGroupClass(els.deckCard, null);

  els.nowTitle.textContent = isBefore ? "EVENT NOT STARTED" : "EVENT CONCLUDED";
  els.nowTime.textContent = formatEventDateRange();
  els.deckTitle.textContent = eventInfo.venue;
  els.deckTime.textContent = isBefore ? "First session Friday" : "Final session completed";
  els.liveUpdated.textContent = `Updated ${formatClock(now)} - refreshes every 30 seconds`;
}

function renderSchedule() {
  const now = new Date();
  const day = scheduleDay;
  const state = getScheduleState(day, now);
  const next = state.next;
  const current = state.current;

  els.scheduleList.innerHTML = "";

  getSortedSessions(day).forEach((session) => {
    const card = document.createElement("article");
    card.className = "schedule-card";
    paintGroupClass(card, session.group);
    if (session.type === "break") card.classList.add("break-card");
    if (session.type === "event") card.classList.add("event-card");
    if (session.type === "classroom") card.classList.add("classroom-card");

    const name = document.createElement("strong");
    name.textContent = getSessionName(session);

    const time = document.createElement("span");
    time.textContent = formatRange(session);

    card.append(name, time);

    if (current === session) {
      card.classList.add("is-current");
      card.append(makeBadge("Current"));
    } else if (next === session) {
      card.classList.add("is-next");
      card.append(makeBadge("Next"));
    }

    els.scheduleList.append(card);
  });
}

function renderGroupOverview() {
  els.groupGrid.innerHTML = "";

  GROUPS.forEach((group) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `group-card ${groupClass(group)}`;
    button.innerHTML = `<strong>${group}</strong>`;
    button.addEventListener("click", () => {
      selectedGroup = group;
      renderGroupDetail(group);
      els.groupsOverview.classList.add("is-hidden");
      els.groupDetail.classList.remove("is-hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    els.groupGrid.append(button);
  });
}

function renderGroupDetail(group) {
  const wrapper = document.createElement("div");

  const header = document.createElement("div");
  header.className = `detail-header ${groupClass(group)}`;
  header.innerHTML = `<h2>${group}</h2>`;
  wrapper.append(header);

    Object.keys(DAY_LABELS).forEach((day) => {
    const block = document.createElement("section");
    block.className = "day-block";
    block.innerHTML = `<h3>${DAY_LABELS[day]}</h3>`;

    getSortedSessions(day)
      .filter((session) => sessionAppliesToGroup(session, group))
      .forEach((session) => {
        const pill = document.createElement("div");
        pill.className = `session-pill ${groupClass(group)}`;
        if (session.type === "classroom") pill.classList.add("classroom-card");
        pill.innerHTML = `<span>${getSessionName(session)}</span><span>${formatRange(session)}</span>`;
        block.append(pill);
      });

    wrapper.append(block);
  });

  els.groupDetailContent.replaceChildren(wrapper);
}

function getDayState(day, now) {
  const sessions = getSortedSessions(day).filter((session) => session.type === "track" || session.type === "break");
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = sessions.find((session) => minutes >= toMinutes(session.start) && minutes < toMinutes(session.end));
  const trackSessions = sessions.filter((session) => session.type === "track");
  const firstTrack = trackSessions[0];
  const finalTrack = trackSessions[trackSessions.length - 1];
  const nextTrack = trackSessions.find((session) => toMinutes(session.start) > minutes);

  if (current?.type === "break") {
    return {
      headline: "LUNCH BREAK",
      current,
      next: nextTrack,
      timeText: formatRange(current),
      deckTitle: nextTrack ? getSessionName(nextTrack) : "Final session complete",
      deckTime: nextTrack ? formatRange(nextTrack) : formatRange(finalTrack)
    };
  }

  if (current?.group) {
    return {
      headline: current.group,
      current,
      next: nextTrack,
      timeText: formatRange(current),
      deckTitle: nextTrack ? getSessionName(nextTrack) : "Final session complete",
      deckTime: nextTrack ? formatRange(nextTrack) : formatRange(finalTrack)
    };
  }

  if (firstTrack && minutes < toMinutes(firstTrack.start)) {
    return {
      headline: "TRACK NOT YET HOT",
      current: null,
      next: firstTrack,
      timeText: "First session pending",
      deckTitle: firstTrack.group,
      deckTime: formatRange(firstTrack)
    };
  }

  if (finalTrack && minutes >= toMinutes(finalTrack.end)) {
    return {
      headline: "TRACK COLD",
      current: finalTrack,
      next: null,
      timeText: "Final session completed",
      deckTitle: "Final session completed",
      deckTime: formatRange(finalTrack)
    };
  }

  return {
    headline: "BETWEEN SESSIONS",
    current: null,
    next: nextTrack,
    timeText: "Next session staging",
    deckTitle: nextTrack ? nextTrack.group : "Schedule complete",
    deckTime: nextTrack ? formatRange(nextTrack) : "--"
  };
}

function getScheduleState(day, now) {
  if (!isDateForDay(now, day)) {
    return { current: null, next: null };
  }

  const sessions = getSortedSessions(day);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = sessions.find((session) => minutes >= toMinutes(session.start) && minutes < toMinutes(session.end));
  const next = sessions.find((session) => toMinutes(session.start) > minutes);

  return { current, next };
}

function resolveAutoState(now) {
  const isoDate = getISODate(now);

  const byDate = Object.entries(eventInfo.eventDates).find(([, date]) => date === isoDate);
  if (byDate) return { status: "during", day: byDate[0] };

  const eventStart = eventInfo.eventDates.friday;
  const eventEnd = eventInfo.eventDates.sunday;

  if (isoDate < eventStart) return { status: "before", day: "friday" };
  if (isoDate > eventEnd) return { status: "after", day: "sunday" };

  return { status: "before", day: "friday" };
}

function getISODate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function isDateForDay(date, day) {
  return getISODate(date) === eventInfo.eventDates[day];
}

function paintGroupClass(element, group) {
  element.classList.remove("group-white", "group-red", "group-black", "group-blue", "group-green", "group-mixed", "break-card", "event-card", "classroom-card");
  if (group) {
    element.classList.add(groupClass(group));
  } else {
    element.classList.add("break-card");
  }
}

function groupClass(group) {
  const normalized = normalizeGroup(group);
  if (normalized.includes("/")) return "group-mixed";

  return `group-${normalized.toLowerCase()}`;
}

function getSessionName(session) {
  return session?.label || session?.group || "Session";
}

function countGroupSessions(group) {
  return Object.values(schedules)
    .flat()
    .filter((session) => sessionAppliesToGroup(session, group)).length;
}

function makeBadge(text) {
  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = text;
  return badge;
}

function toMinutes(value) {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function formatRange(session) {
  return `${formatTime(session.start)} - ${formatTime(session.end)}`;
}

function formatStart(session) {
  return formatTime(session.start);
}

function formatEnd(session) {
  return formatTime(session.end);
}

function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatTime(value) {
  if (/[AP]M/i.test(value)) return value;

  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function formatEventDateRange() {
  const start = dateFromISO(eventInfo.eventDates.friday);
  const end = dateFromISO(eventInfo.eventDates.sunday);
  const sameMonth = start.getMonth() === end.getMonth();
  const month = start.toLocaleDateString([], { month: "long" });
  const endMonth = end.toLocaleDateString([], { month: "long" });
  const year = end.getFullYear();

  if (sameMonth) {
    return `${month} ${start.getDate()}-${end.getDate()}, ${year}`;
  }

  return `${month} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
}

function formatEventDate(value) {
  return dateFromISO(value).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function dateFromISO(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getSortedSessions(day) {
  return [...(schedules[day] || [])].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
}

function normalizeGroup(group) {
  return String(group || "").toUpperCase().trim();
}

function sessionAppliesToGroup(session, group) {
  if (!session.group) return false;

  const target = normalizeGroup(group);
  return normalizeGroup(session.group)
    .split("/")
    .map((item) => item.trim())
    .includes(target);
}

document.addEventListener("DOMContentLoaded", init);
