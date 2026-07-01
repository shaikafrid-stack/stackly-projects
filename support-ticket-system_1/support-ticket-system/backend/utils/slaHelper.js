const SLA_HOURS = {
  critical: { response: 1, resolution: 4 },
  high:     { response: 4, resolution: 24 },
  medium:   { response: 8, resolution: 48 },
  low:      { response: 24, resolution: 72 },
};

exports.getSLADeadlines = (priority) => {
  const hours = SLA_HOURS[priority] || SLA_HOURS.medium;
  const now = new Date();
  return {
    response_deadline: new Date(now.getTime() + hours.response * 3600000),
    resolution_deadline: new Date(now.getTime() + hours.resolution * 3600000),
  };
};

exports.checkSLABreach = (sla) => {
  const now = new Date();
  return now > new Date(sla.resolution_deadline);
};
