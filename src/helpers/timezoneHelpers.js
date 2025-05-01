const moment = require('moment-timezone');


function getExpiryTime() {
  return new Date(Date.now() + 15 * 60 * 1000); 
}

function getCurrentTime() {
  const utcNow = moment.utc();
  const karachiTime = utcNow.tz(getTimeZone());
  return karachiTime.format("HH:mm:00");
}

function getCurrentDay() {
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const utcNow = moment.utc();
  const karachiTime = utcNow.tz(getTimeZone());
  return weekDays[karachiTime.day()];
}

function formatDate() {
  const utcNow = moment.utc();
  const karachiTime = utcNow.tz(getTimeZone());
  return `${karachiTime.format("MM-DD-YYYY")} 00:00:00`;
}
function getTimeZone(location) {
  const TIMEZONE = "Asia/Karachi";
  return TIMEZONE;
}

function getCurrentTimeForTimezone(timezone) {
  const utcNow = moment.utc();
  const localTime = utcNow.tz(timezone);
  console.log(utcNow.format("HH:mm:00"), "utcNow.format('HH:mm:00')");

  return localTime.format("HH:mm:00");
}
function getCurrentTimeForTimezoneReminder(timezone) {
  const utcNow = moment.utc();
  const localTime = utcNow.tz(timezone);
  console.log(utcNow.toISOString(), "UTC time in ISO format");        

  return moment
    .tz(localTime, timezone)
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
}

function getCurrentDayForTimezone(timezone) {
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const utcNow = moment.utc();
  const localTime = utcNow.tz(timezone);
  return weekDays[localTime.day()];
}

function formatDateForTimezone(timezone) {
  const utcNow = moment.utc();
  const localTime = utcNow.tz(timezone);
  console.log(localTime.format("MM-DD-YYYY"), "localTime.format('MM-DD-YYYY')");
  return `${localTime.format("MM-DD-YYYY")} 00:00:00`;
}
function isValidTimezone(timezone) {
  return moment.tz.zone(timezone) !== null;
}

const getFormattedDateTime = (timezone) => {
  const now = moment().tz(timezone); 
  return now.utc().format(); 
};

module.exports = {
  getExpiryTime,
  getCurrentDay,
  getCurrentTime,
  formatDate,
  getTimeZone,
  getCurrentTimeForTimezone,
  getCurrentDayForTimezone,
  formatDateForTimezone,
  isValidTimezone,
  getCurrentTimeForTimezoneReminder,
  getFormattedDateTime,
};
