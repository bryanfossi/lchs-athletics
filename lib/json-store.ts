import { readFile, writeFile } from 'fs/promises';

export async function readJson<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, 'utf-8')) as T;
  } catch {
    return defaultValue;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
