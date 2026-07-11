/**
 * Prometheus Metrics Middleware
 * Expone métricas de la aplicación en /api/metrics
 */

import pino from 'pino';

const logger = pino();

// Métricas en memoria (simplificadas para demo)
const metrics = {
  requests: {
    total: 0,
    by_method: {} as Record<string, number>,
    by_status: {} as Record<number, number>,
    errors: 0,
  },
  database: {
    queries: 0,
    errors: 0,
    latency_ms: 0,
  },
  memory: {
    usage_mb: 0,
  },
};

export function metricsMiddleware(
  req: any,
  res: any,
  next: any
) {
  // Track request start time
  const startTime = Date.now();

  // Increment request counter
  metrics.requests.total++;
  metrics.requests.by_method[req.method] =
    (metrics.requests.by_method[req.method] || 0) + 1;

  // Original res.json function
  const originalJson = res.json;

  res.json = function (data: any) {
    const statusCode = res.statusCode;
    metrics.requests.by_status[statusCode] =
      (metrics.requests.by_status[statusCode] || 0) + 1;

    if (statusCode >= 400) {
      metrics.requests.errors++;
    }

    logger.info({
      path: req.path,
      method: req.method,
      status: statusCode,
      duration_ms: Date.now() - startTime,
    });

    return originalJson.call(this, data);
  };

  next();
}

export function formatPrometheusMetrics(): string {
  const now = Date.now();
  let output = '';

  // HELP and TYPE lines
  output += '# HELP http_requests_total Total HTTP requests\n';
  output += '# TYPE http_requests_total counter\n';
  output += `http_requests_total{job="backend"} ${metrics.requests.total}\n`;

  output += '# HELP http_requests_errors Total HTTP errors\n';
  output += '# TYPE http_requests_errors counter\n';
  output += `http_requests_errors{job="backend"} ${metrics.requests.errors}\n`;

  // By method
  output += '# HELP http_requests_by_method Requests by method\n';
  output += '# TYPE http_requests_by_method gauge\n';
  Object.entries(metrics.requests.by_method).forEach(([method, count]) => {
    output += `http_requests_by_method{method="${method}"} ${count}\n`;
  });

  // By status code
  output += '# HELP http_requests_by_status Requests by status code\n';
  output += '# TYPE http_requests_by_status gauge\n';
  Object.entries(metrics.requests.by_status).forEach(([status, count]) => {
    output += `http_requests_by_status{status="${status}"} ${count}\n`;
  });

  // Database metrics
  output += '# HELP db_queries_total Total database queries\n';
  output += '# TYPE db_queries_total counter\n';
  output += `db_queries_total{job="backend"} ${metrics.database.queries}\n`;

  // Memory
  output += '# HELP process_memory_bytes Process memory usage\n';
  output += '# TYPE process_memory_bytes gauge\n';
  const memUsage = process.memoryUsage();
  output += `process_memory_bytes{type="heapUsed"} ${memUsage.heapUsed}\n`;
  output += `process_memory_bytes{type="heapTotal"} ${memUsage.heapTotal}\n`;
  output += `process_memory_bytes{type="external"} ${memUsage.external}\n`;

  // Uptime
  output += '# HELP process_uptime_seconds Process uptime\n';
  output += '# TYPE process_uptime_seconds gauge\n';
  output += `process_uptime_seconds ${process.uptime()}\n`;

  return output;
}

export const metricsStore = metrics;
