const mongoose = require('mongoose');
const dns = require('dns');

function isSrvDnsRefused(err) {
  const msg = String(err?.message || '');
  return msg.includes('querySrv') && msg.includes('ECONNREFUSED');
}

async function connectDb(mongoUri) {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(mongoUri);
  } catch (err) {
    // Some networks/DNS resolvers refuse SRV lookups used by mongodb+srv://
    if (mongoUri?.startsWith('mongodb+srv://') && isSrvDnsRefused(err)) {
      try {
        dns.setServers(['1.1.1.1', '8.8.8.8']);
        await mongoose.connect(mongoUri);
        return;
      } catch (err2) {
        const help =
          'Atlas SRV DNS lookup is being refused on this network. Fix: set MONGO_URI to the Atlas Standard connection string (mongodb://...) or allow node.exe DNS in firewall/VPN.';
        err2.message = `${err2.message}\n\n${help}`;
        throw err2;
      }
    }
    throw err;
  }
}

module.exports = { connectDb };
