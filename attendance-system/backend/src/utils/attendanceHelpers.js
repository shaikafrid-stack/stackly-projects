/**
 * Business logic for computing attendance status and total hours.
 */

// Compute total working hours between check-in and check-out (as decimal hours)
function computeTotalHours(checkIn, checkOut) {
  const diffMs = new Date(checkOut) - new Date(checkIn);
  const hours = diffMs / (1000 * 60 * 60);
  return Math.max(0, Math.round(hours * 100) / 100);
}

// Determine attendance status based on check-in time vs shift start, and total hours worked
function computeStatus({ checkInTime, shiftStartTime, graceMinutes = 15, totalHours }) {
  if (!checkInTime) return 'Absent';

  let isLate = false;
  if (shiftStartTime) {
    const [sh, sm] = shiftStartTime.split(':').map(Number);
    const shiftStart = new Date(checkInTime);
    shiftStart.setHours(sh, sm, 0, 0);
    const graceLimit = new Date(shiftStart.getTime() + graceMinutes * 60000);
    if (new Date(checkInTime) > graceLimit) {
      isLate = true;
    }
  }

  if (totalHours !== null && totalHours !== undefined) {
    if (totalHours < 4) return 'Half Day';
  }

  return isLate ? 'Late' : 'Present';
}

module.exports = { computeTotalHours, computeStatus };
