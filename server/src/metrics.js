const records = [];
let total = 0;
let errors = 0;
const started = Date.now();

export function metricsMiddleware(req, res, next) {
  const begin = performance.now();
  res.on('finish', () => {
    if (req.path === '/api/metrics') return;
    const ms = Math.round((performance.now() - begin) * 100) / 100;
    records.push(ms);
    if (records.length > 200) records.shift();
    total += 1;
    if (res.statusCode >= 400) errors += 1;
  });
  next();
}

export function getMetrics() {
  const sorted = [...records].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    uptimeSeconds: Math.round((Date.now() - started) / 1000),
    requestsTotal: total,
    httpErrorsTotal: errors,
    recentRequests: sorted.length,
    averageLatencyMs: sorted.length ? Math.round((sum / sorted.length) * 100) / 100 : 0,
    p95LatencyMs: sorted.length ? sorted[Math.ceil(sorted.length * .95) - 1] : 0,
    memoryRssMb: Math.round(process.memoryUsage().rss / 1048576)
  };
}
