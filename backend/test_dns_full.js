import dns from 'dns';

const checks = [
    'google.com',
    'ufvmlnrzayuwhimvfgpq.supabase.co', // API
    'db.ufvmlnrzayuwhimvfgpq.supabase.co' // DB
];

checks.forEach(hostname => {
    dns.lookup(hostname, (err, address) => {
        if (err) {
            console.error(`[FAIL] ${hostname}: ${err.code}`);
        } else {
            console.log(`[OK]   ${hostname}: ${address}`);
        }
    });
});
