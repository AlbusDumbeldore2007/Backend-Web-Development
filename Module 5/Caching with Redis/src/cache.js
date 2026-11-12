'use strict';

// ─── YOUR FILE — implement this ───────────────────────────────────────────────
// Implement three Redis helper functions using ioredis.
//
// cacheGet(key)
//   - redis.get(key) → string | null
//   - If string: JSON.parse and return the object
//   - If null: return null (cache miss)
//   - Wrap in try/catch: on error, log and return null (graceful degradation)
//
// cacheSet(key, data, ttlSeconds)
//   - redis.set(key, JSON.stringify(data), 'EX', ttlSeconds)
//   - Wrap in try/catch: on error, log (don't fail the request)
//
// cacheDel(key)
//   - redis.del(key)
//   - Wrap in try/catch: on error, log
//
// Redis connection:
//   host: process.env.REDIS_HOST || 'localhost'
//   port: parseInt(process.env.REDIS_PORT || '6379')
//   lazyConnect: true

const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  family: 4,
  lazyConnect: true,
});

redis.on('error', (err) => {
  console.error('[redis] connection error:', err.message);
});

// Initiate connection if lazyConnect is enabled without crashing on failure
redis.connect().catch((err) => {
  console.warn('[redis] Initial connect failed:', err.message);
});

async function ensureConnected() {
  if (redis.status === 'wait') {
    try {
      await redis.connect();
    } catch (err) {
      // Ignored: downstream commands will handle error or offline queue
    }
  }
}

async function cacheGet(key) {
  try {
    await ensureConnected();
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.error('[cache] get error:', err.message);
    return null;
  }
}

async function cacheSet(key, data, ttlSeconds) {
  try {
    await ensureConnected();
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[cache] set error:', err.message);
  }
}

async function cacheDel(key) {
  try {
    await ensureConnected();
    await redis.del(key);
  } catch (err) {
    console.error('[cache] del error:', err.message);
  }
}

module.exports = { redis, cacheGet, cacheSet, cacheDel };
