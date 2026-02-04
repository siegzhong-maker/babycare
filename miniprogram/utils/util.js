const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

function calculateAge(birthStr) {
  if (!birthStr) return "未知";
  const birth = new Date(birthStr);
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months--;
    days += 30;
  } // Approximate
  if (months < 0) return "未出生";
  if (months < 12) return `${months}个月${days}天`;
  return `${Math.floor(months / 12)}岁${months % 12}个月`;
}

module.exports = {
  formatTime,
  calculateAge
}
