// Public busy times only. All dates and times are in Asia/Shanghai (UTC+8).
globalThis.XLabAvailability = (() => {
  const startDate = "2026-11-09";
  const endDate = "2027-01-01";
  const weekly = Object.freeze([
    Object.freeze({ weekday: 1, start: "17:45", end: "21:00" }),
    Object.freeze({ weekday: 3, start: "09:30", end: "12:15" }),
  ]);
  const oneOff = Object.freeze([
    Object.freeze({ date: "2026-11-10", start: "16:00", end: "17:00" }),
    Object.freeze({ date: "2026-11-12", start: "16:00", end: "17:30" }),
  ]);
  const minutes = (time) => {
    if (!/^\d{2}:\d{2}$/.test(time)) return NaN;
    const [hours, mins] = time.split(":").map(Number);
    return hours < 24 && mins < 60 ? hours * 60 + mins : NaN;
  };
  function busyOn(dateKey) {
    const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
    const recurring = dateKey >= startDate && dateKey <= endDate
      ? weekly.filter((period) => period.weekday === weekday)
      : [];
    return [...recurring, ...oneOff.filter((period) => period.date === dateKey)]
      .sort((a, b) => minutes(a.start) - minutes(b.start));
  }
  function canRequest(dateKey, time, duration) {
    const start = minutes(time);
    const end = start + duration;
    return Number.isFinite(start) && duration > 0 && end <= 1440
      && !busyOn(dateKey).some((period) => start < minutes(period.end) && end > minutes(period.start));
  }
  return Object.freeze({ startDate, endDate, weekly, oneOff, busyOn, canRequest });
})();
