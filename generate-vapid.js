#!/usr/bin/env node
// Run once to generate VAPID keys: node generate-vapid.js
// Requires: npm install  (installs web-push from package.json)
const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();

console.log('\nVAPID keys generated. Add these to Netlify:\n');
console.log('  Site settings → Environment variables → Add variable\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:you@example.com`);
console.log('\nOr with Netlify CLI:');
console.log(`  netlify env:set VAPID_PUBLIC_KEY "${keys.publicKey}"`);
console.log(`  netlify env:set VAPID_PRIVATE_KEY "${keys.privateKey}"`);
console.log(`  netlify env:set VAPID_EMAIL "mailto:you@example.com"`);
