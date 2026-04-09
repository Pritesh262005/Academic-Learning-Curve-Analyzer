function safePercent(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function groupBy(list, keyFn) {
  return list.reduce((acc, item) => {
    const k = keyFn(item);
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {});
}

function computeSubjectAverages(marks) {
  const bySubject = groupBy(marks, (m) => m.subject);
  const entries = Object.entries(bySubject).map(([subject, items]) => {
    const totalScore = items.reduce((s, m) => s + m.score, 0);
    const totalMax = items.reduce((s, m) => s + m.maxScore, 0);
    return { subject, averagePercent: safePercent(totalScore, totalMax), count: items.length };
  });
  entries.sort((a, b) => b.averagePercent - a.averagePercent);
  return entries;
}

function computeOverallAverage(marks) {
  const totalScore = marks.reduce((s, m) => s + m.score, 0);
  const totalMax = marks.reduce((s, m) => s + m.maxScore, 0);
  return safePercent(totalScore, totalMax);
}

function predictNextOverallAverage({ series }) {
  if (!series.length) return 0;
  if (series.length === 1) return series[0].value;
  const last = series[series.length - 1].value;
  const prev = series[series.length - 2].value;
  const trend = last - prev;
  const predicted = Math.max(0, Math.min(100, last + trend));
  return Math.round(predicted * 10) / 10;
}

module.exports = {
  safePercent,
  groupBy,
  computeSubjectAverages,
  computeOverallAverage,
  predictNextOverallAverage,
};

