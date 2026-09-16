import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';
import path from 'node:path';

const databaseUrl = process.env.DATABASE_URL?.trim();
const backupFile = process.argv[2];
if (!databaseUrl) throw new Error('DATABASE_URL is required');
if (!backupFile || !path.isAbsolute(backupFile) || !backupFile.endsWith('.sql.gz')) throw new Error('Pass an absolute .sql.gz backup path');
await access(backupFile);

const url = new URL(databaseUrl);
if (url.protocol !== 'mysql:') throw new Error('DATABASE_URL must use mysql://');
const database = url.pathname.replace(/^\//, '');
if (!database) throw new Error('DATABASE_URL must include a database name');
const args = ['-h', url.hostname, '-P', url.port || '3306', '-u', decodeURIComponent(url.username), database];
const restore = spawn('mysql', args, { env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) }, stdio: ['pipe', 'inherit', 'inherit'] });
const restoreExit = new Promise((resolve, reject) => {
  restore.once('error', reject);
  restore.once('close', resolve);
});
await pipeline(createReadStream(backupFile), createGunzip(), restore.stdin);
const exitCode = await restoreExit;
if (exitCode !== 0) throw new Error(`mysql exited with code ${exitCode}`);
process.stdout.write(`Restore completed from ${backupFile}\n`);
