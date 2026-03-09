const Redis = require('ioredis');
const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    family: 4, 
    maxRetriesPerRequest: 1
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis (127.0.0.1:6379)');
    redis.call('PING').then(res => {
        console.log('PING:', res);
        process.exit(0);
    }).catch(err => {
        console.log('PING ERROR:', err);
        process.exit(1);
    });
});

redis.on('error', (err) => {
    console.log('REDIS ON ERROR EVENT:', err.message);
});
