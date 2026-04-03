/**
 * Vercel API로 CRON_SECRET 삭제 후 재생성
 * node scripts/vercel-fix-env.js
 */
const { execSync } = require('child_process');

const PROJECT_ID = 'prj_FRP2TCrQgq3z6OMo7aiKtlNynmac';
const TEAM_ID = 'team_nN7rmwjBybV96jlsxLSWSGrt';
const CRON_SECRET = '954dd677bda7623a65fee40a850fa59cdff7d9b7c0fd44ebe61a8f8fee97e073';
const ADMIN_API_KEY = 'f8038d0bbb0e7a776a1d813a7c5f1df3b5040222cfe5097130e3af4a886a4d31';

// Get token from vercel CLI config
function getVercelToken() {
    const os = require('os');
    const fs = require('fs');
    const paths = [
        `${os.homedir()}/AppData/Roaming/com.vercel.cli/Data/auth.json`,
        `${os.homedir()}/AppData/Roaming/com.vercel.cli/auth.json`,
        `${os.homedir()}/.local/share/com.vercel.cli/auth.json`,
        `${os.homedir()}/.vercel/auth.json`,
        `${os.homedir()}/AppData/Local/com.vercel.cli/auth.json`,
    ];
    for (const p of paths) {
        try {
            const d = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (d.token) return d.token;
        } catch (e) {}
    }
    return null;
}

async function main() {
    const token = getVercelToken();
    if (!token) {
        console.log('No Vercel token found. Trying via npx vercel whoami...');
        // Try reading token from vercel CLI output
        try {
            const out = execSync('npx vercel whoami 2>&1', { encoding: 'utf8' });
            console.log('Vercel whoami:', out);
        } catch (e) {
            console.log('whoami failed:', e.message);
        }
        return;
    }

    console.log('Token found:', token.substring(0, 15) + '...');

    const base = `https://api.vercel.com`;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 1. List env vars to find CRON_SECRET ID
    const listResp = await fetch(`${base}/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, { headers });
    const listData = await listResp.json();
    console.log('Env vars:', JSON.stringify(listData.envs?.map(e => ({ id: e.id, key: e.key, target: e.target })), null, 2));

    // Fix ADMIN_API_KEY (trailing \n from echo)
    const adminEnv = listData.envs?.find(e => e.key === 'ADMIN_API_KEY');
    if (adminEnv) {
        console.log('Deleting ADMIN_API_KEY id:', adminEnv.id);
        const delAdmin = await fetch(`${base}/v9/projects/${PROJECT_ID}/env/${adminEnv.id}?teamId=${TEAM_ID}`, {
            method: 'DELETE', headers
        });
        console.log('Delete ADMIN_API_KEY status:', delAdmin.status);
        const addAdmin = await fetch(`${base}/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, {
            method: 'POST', headers,
            body: JSON.stringify({ key: 'ADMIN_API_KEY', value: ADMIN_API_KEY, target: ['production'], type: 'encrypted' }),
        });
        const addAdminData = await addAdmin.json();
        console.log('Add ADMIN_API_KEY result:', addAdmin.status, addAdminData.key || addAdminData.error);
    }

    // Fix CRON_SECRET (trailing \n from echo)
    const cronEnv = listData.envs?.find(e => e.key === 'CRON_SECRET');
    if (cronEnv) {
        console.log('Deleting CRON_SECRET id:', cronEnv.id);
        const delCron = await fetch(`${base}/v9/projects/${PROJECT_ID}/env/${cronEnv.id}?teamId=${TEAM_ID}`, {
            method: 'DELETE', headers
        });
        console.log('Delete CRON_SECRET status:', delCron.status);
        const addCron = await fetch(`${base}/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`, {
            method: 'POST', headers,
            body: JSON.stringify({ key: 'CRON_SECRET', value: CRON_SECRET, target: ['production'], type: 'encrypted' }),
        });
        const addCronData = await addCron.json();
        console.log('Add CRON_SECRET result:', addCron.status, addCronData.key || addCronData.error);
    }
}

main().catch(console.error);
