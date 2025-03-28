const client = require('prom-client');
const metricsLogger = require('../Logger/metricLogger'); 

const register = new client.Registry();

const requestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const responseTimeHistogram = new client.Histogram({
    name: 'http_response_time_seconds',
    help: 'HTTP response time in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5] 
});

register.registerMetric(requestCounter);
register.registerMetric(responseTimeHistogram);

const collectMetrics = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        requestCounter.labels(req.method, req.url, res.statusCode).inc();
        responseTimeHistogram.labels(req.method, req.url, res.statusCode).observe(duration);

        metricsLogger.info({
            method: req.method,
            route: req.url,
            status_code: res.statusCode,
            duration: duration
        });
    });

    next();
};

const metricsEndpoint = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

module.exports = { collectMetrics, metricsEndpoint };