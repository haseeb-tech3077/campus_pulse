import http from 'node:http';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const allowed = new Set(['portal-home.png','portal-marks.png','portal-course-detail.png']);
http.createServer(async (req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1);
  if (req.method !== 'POST' || !allowed.has(name)) return res.writeHead(404).end();
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  await writeFile(resolve('screenshots', name), Buffer.concat(chunks));
  res.writeHead(200).end('saved');
}).listen(19007, '127.0.0.1');
