import { mkdir, chmod } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { spawn } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import path from 'node:path';

const databaseUrl = process.env.DATABASE_URL?.trim();
const backupDir = process.env.BACKUP_DIR?.trim();
if (!databaseUrl) throw new Error('DATABASE_URL is required');
if (!backupDir || !path.isAbsolute(backupDir)) throw new Error('BACKUP_DIR must be an absolute path');

const url = new URL(databaseUrl);
if (url.protocol !== 'mysql:') throw new Error('DATABASE_URL must use mysql://');
const database = url.pathname.replace(/^\//, '');
if (!database) throw new Error('DATABASE_URL must include a database name');

await mkdir(backupDir, { recursive: true, mode: 0o700 });
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
const target = path.join(backupDir, `blog-engine-${timestamp}.sql.gz`);
const args = ['--single-transaction', '--routines', '--triggers', '--set-gtid-purged=OFF', '-h', url.hostname, '-P', url.port || '3306', '-u', decodeURIComponent(url.username), database];
const dump = spawn('mysqldump', args, { env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) }, stdio: ['ignore', 'pipe', 'inherit'] });
const dumpExit = new Promise((resolve, reject) => {
  dump.once('error', reject);
  dump.once('close', resolve);
});
await pipeline(dump.stdout, createGzip({ level: 9 }), createWriteStream(target, { mode: 0o600 }));
const exitCode = await dumpExit;
if (exitCode !== 0) throw new Error(`mysqldump exited with code ${exitCode}`);
await chmod(target, 0o600);
process.stdout.write(`${target}\n`);
