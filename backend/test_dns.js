import dns from 'dns';

const hostname = 'db.ufvmlnrzayuwhimvfgpq.supabase.co';

console.log(`Looking up ${hostname}...`);

dns.lookup(hostname, (err, address, family) => {
    if (err) {
        console.error('DNS Lookup Error:', err);
    } else {
        console.log(`Address: ${address}, Family: IPv${family}`);
    }
});
