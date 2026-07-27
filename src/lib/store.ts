import fs from 'fs';
import path from 'path';
import type { Cookie } from '@/types';

interface StoreData {
  [sessionId: string]: {
    cookies: Cookie[];
    savedAt: number;
  };
}

const STORE_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(STORE_DIR, 'session-store.json');

function ensureStoreFileExists() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, JSON.stringify({}), 'utf-8');
  }
}

function readStore(): StoreData {
  try {
    ensureStoreFileExists();
    const data = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(data) as StoreData;
  } catch (err) {
    console.error('Failed to read session store:', err);
    return {};
  }
}

function writeStore(data: StoreData) {
  try {
    ensureStoreFileExists();
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write session store:', err);
  }
}

export function saveSessionCookies(sessionId: string, cookies: Cookie[]) {
  const store = readStore();
  store[sessionId] = {
    cookies,
    savedAt: Date.now(),
  };
  writeStore(store);
}

export function getSessionCookies(sessionId: string): Cookie[] | null {
  const store = readStore();
  const session = store[sessionId];
  if (!session) {
    return null;
  }
  return session.cookies;
}
