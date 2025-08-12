require('dotenv').config({ debug: true });
console.log('MONGO_URI present?', !!process.env.MONGO_URI);
console.log('VALUE START:', (process.env.MONGO_URI || '').slice(0, 60) + 
'...');

