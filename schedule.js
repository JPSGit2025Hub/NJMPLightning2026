/*
  RTR Track Days schedule data
  --------------------------------
  To update this app for a future event:
  1. Edit eventDates so AUTO can identify the correct day by calendar date.
  2. Replace the session arrays below with the official published schedule.
  3. Use readable AM/PM time strings such as "9:10 AM" and "12:30 PM".
  4. Use type: "track" for run-group sessions, "break" for lunch, and
     "event" or "classroom" for non-track schedule items.
  5. Use group values like "White", "Red", "Black", "Blue", "Green". Combined
     sessions such as "Red / Black / White" are supported.

  The app reads all schedule information from this file. Avoid hardcoding
  session times in index.html or app.js.
*/

const eventInfo = {
  name: "RTR Track Days",
  venue: "NJMP Lightning",
  // Replace these with the actual event dates when they are final.
  eventDates: {
    friday: "2026-06-19",
    saturday: "2026-06-20",
    sunday: "2026-06-21"
  }
};

const fridayTrackSchedule = [
  { type: "track", group: "White", start: "9:10 AM", end: "9:30 AM" },
  { type: "track", group: "Red", start: "9:30 AM", end: "9:50 AM" },
  { type: "track", group: "Black", start: "9:50 AM", end: "10:10 AM" },
  { type: "track", group: "Blue", start: "10:10 AM", end: "10:30 AM" },
  { type: "track", group: "Green", label: "Intro / Green", start: "10:30 AM", end: "10:50 AM" },
  { type: "track", group: "White", start: "10:50 AM", end: "11:10 AM" },
  { type: "track", group: "Red", start: "11:10 AM", end: "11:30 AM" },
  { type: "track", group: "Black", start: "11:30 AM", end: "11:50 AM" },
  { type: "track", group: "Blue", start: "11:50 AM", end: "12:10 PM" },
  { type: "track", group: "Green", label: "Intro / Green", start: "12:10 PM", end: "12:30 PM" },
  { type: "break", label: "Lunch", start: "12:30 PM", end: "1:30 PM" },
  { type: "track", group: "White", start: "1:30 PM", end: "2:00 PM" },
  { type: "track", group: "Red", start: "2:00 PM", end: "2:30 PM" },
  { type: "track", group: "Black", start: "2:30 PM", end: "3:00 PM" },
  { type: "track", group: "Blue", start: "3:00 PM", end: "3:25 PM" },
  { type: "track", group: "Green", label: "Intro / Green", start: "3:25 PM", end: "3:50 PM" },
  { type: "track", group: "White", start: "3:50 PM", end: "4:20 PM" },
  { type: "track", group: "Red", start: "4:20 PM", end: "4:45 PM" },
  { type: "track", group: "Black", start: "4:45 PM", end: "5:10 PM" },
  { type: "track", group: "Blue", start: "5:10 PM", end: "5:35 PM" },
  { type: "track", group: "Green", label: "Intro / Green", start: "5:35 PM", end: "6:00 PM" }
];

const saturdayTrackSchedule = fridayTrackSchedule.map((session) => {
  if (session.type === "track" && session.group === "Green") {
    return { ...session, label: "Green" };
  }

  return { ...session };
});

const schedules = {
  friday: [
    { type: "event", label: "Registration", start: "7:30 AM", end: "8:15 AM" },
    { type: "event", label: "Tech Inspection", start: "7:30 AM", end: "8:15 AM" },
    { type: "event", label: "Drivers Meeting", start: "8:20 AM", end: "8:40 AM" },
    { type: "event", label: "Parade Laps - 1st Timers", start: "9:00 AM", end: "9:10 AM" },
    { type: "classroom", group: "Green", label: "Intro / Green Classroom", start: "9:15 AM", end: "10:15 AM" },
    ...fridayTrackSchedule,
    { type: "classroom", group: "Blue", label: "Blue Classroom", start: "10:45 AM", end: "11:30 AM" },
    { type: "classroom", group: "White", label: "White Classroom", start: "11:45 AM", end: "12:30 PM" },
    { type: "classroom", group: "Green", label: "Intro / Green Classroom", start: "1:30 PM", end: "2:30 PM" },
    { type: "event", label: "Track Walk - weather permitting", start: "6:15 PM", end: "6:45 PM" }
  ],
  saturday: [
    { type: "event", label: "Registration", start: "7:30 AM", end: "8:15 AM" },
    { type: "event", label: "Tech Inspection", start: "7:30 AM", end: "8:15 AM" },
    { type: "event", label: "Drivers Meeting", start: "8:20 AM", end: "8:40 AM" },
    { type: "event", label: "Parade Laps - 1st Timers", start: "9:00 AM", end: "9:10 AM" },
    { type: "classroom", group: "Green", label: "Green Classroom", start: "9:15 AM", end: "10:15 AM" },
    ...saturdayTrackSchedule,
    { type: "classroom", group: "Blue", label: "Blue Classroom", start: "10:45 AM", end: "11:30 AM" },
    { type: "classroom", group: "White", label: "White Classroom", start: "11:45 AM", end: "12:30 PM" },
    { type: "classroom", group: "Green", label: "Green Classroom", start: "1:30 PM", end: "2:30 PM" },
    { type: "event", label: "Social / BYO near the classroom", start: "6:00 PM", end: "6:30 PM" }
  ],
  sunday: [
    { type: "event", label: "Tech Inspection", start: "7:45 AM", end: "8:15 AM" },
    { type: "event", label: "Drivers Meeting", start: "8:20 AM", end: "8:40 AM" },
    { type: "track", group: "White", start: "9:00 AM", end: "9:20 AM" },
    { type: "track", group: "Red", start: "9:20 AM", end: "9:45 AM" },
    { type: "track", group: "Black", start: "9:45 AM", end: "10:05 AM" },
    { type: "track", group: "Blue", start: "10:05 AM", end: "10:25 AM" },
    { type: "track", group: "Green", start: "10:25 AM", end: "10:45 AM" },
    { type: "track", group: "White", start: "10:45 AM", end: "11:05 AM" },
    { type: "track", group: "Red", start: "11:05 AM", end: "11:30 AM" },
    { type: "track", group: "Black", start: "11:30 AM", end: "11:50 AM" },
    { type: "track", group: "Blue", start: "11:50 AM", end: "12:10 PM" },
    { type: "track", group: "Green", start: "12:10 PM", end: "12:30 PM" },
    { type: "break", label: "Lunch", start: "12:30 PM", end: "1:30 PM" },
    { type: "event", label: "Drivers Meeting", start: "1:20 PM", end: "1:30 PM" },
    { type: "track", group: "Red / Black / White", start: "1:30 PM", end: "2:00 PM" },
    { type: "track", group: "Green / Blue", start: "2:00 PM", end: "2:30 PM" },
    { type: "track", group: "Red / Black / White", start: "2:30 PM", end: "3:00 PM" },
    { type: "track", group: "Green / Blue", start: "3:00 PM", end: "3:30 PM" }
  ]
};
