import { DatabaseSync } from 'node:sqlite';
import mysql from 'mysql2/promise';
import path from 'path';
import fs from 'node:fs';
import crypto from 'node:crypto';

let sqliteDbInstance = null;
let mysqlPoolInstance = null;
const letterCache = {};

/**
 * Determine if MySQL should be used.
 * Production / Hostinger uses MySQL when DB_CONNECTION=mysql or DB_HOST / MYSQL_HOST is defined.
 * Development uses SQLite (data/database.sqlite) by default.
 */
export function isUsingMySQL() {
  return Boolean(
    process.env.DB_CONNECTION === 'mysql' ||
    process.env.MYSQL_HOST ||
    process.env.DB_HOST
  );
}

/**
 * Get the SQLite database connection (development default)
 */
export function getSQLiteDatabase() {
  if (!sqliteDbInstance) {
    const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
    sqliteDbInstance = new DatabaseSync(dbPath);
  }
  return sqliteDbInstance;
}

/**
 * Get the MySQL connection pool (production / Hostinger)
 */
export function getMySQLPool() {
  if (!mysqlPoolInstance) {
    const host = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
    const user = process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER || 'root';
    const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
    const database = process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'massa_gizey';

    mysqlPoolInstance = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+00:00'
    });
  }
  return mysqlPoolInstance;
}

/**
 * Backwards compatibility helper
 */
export function getDatabase() {
  if (isUsingMySQL()) {
    return getMySQLPool();
  }
  return getSQLiteDatabase();
}

/**
 * Get distinct starting letters and frequency counts for the dictionary
 */
export async function getDictionaryLetters(dictionary = 'massa') {
  const dictKey = dictionary === 'gizey' ? 'gizey' : 'massa';
  if (letterCache[dictKey]) {
    return letterCache[dictKey];
  }

  const table = dictKey === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';
  let words = [];

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `SELECT wordForm FROM ${table} WHERE wordForm IS NOT NULL AND TRIM(wordForm) != ''`
    );
    words = rows;
  } else {
    const db = getSQLiteDatabase();
    words = db.prepare(
      `SELECT wordForm FROM ${table} WHERE wordForm IS NOT NULL AND TRIM(wordForm) != ''`
    ).all();
  }

  const countMap = new Map();
  for (const row of words) {
    const term = row.wordForm ? row.wordForm.trim() : '';
    if (!term) continue;
    const firstChar = Array.from(term)[0].toUpperCase();
    countMap.set(firstChar, (countMap.get(firstChar) || 0) + 1);
  }

  const sortedLetters = Array.from(countMap.keys()).sort((a, b) => 
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  );

  const result = {
    dictionary: dictKey,
    letters: sortedLetters,
    counts: Object.fromEntries(countMap)
  };

  letterCache[dictKey] = result;
  return result;
}

/**
 * Query words with search, letter filter, and pagination
 */
export async function queryWords(dictionary, { search = '', page = 1, limit = 20, letter = '' } = {}) {
  const table = dictionary === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';
  const offset = (Math.max(1, page) - 1) * limit;

  let whereClauses = [];
  let params = [];

  if (search) {
    whereClauses.push('(wordForm LIKE ? OR otherParts LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (letter) {
    // Unicode-aware comparison using SUBSTR so that characters like Ɓ, Ɗ, Ɦ, Ɬ, ɮ, Ŋ, ʔ match both upper and lower
    const upper = letter.toUpperCase();
    const lower = letter.toLowerCase();
    whereClauses.push('(SUBSTR(wordForm, 1, 1) = ? OR SUBSTR(wordForm, 1, 1) = ?)');
    params.push(upper, lower);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM ${table} ${whereSql}`,
      params
    );
    const total = countRows[0] ? Number(countRows[0].total) : 0;

    const [words] = await pool.query(
      `SELECT * FROM ${table} ${whereSql} ORDER BY LOWER(wordForm) ASC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return {
      words,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } else {
    const db = getSQLiteDatabase();
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM ${table} ${whereSql}`);
    const total = countStmt.get(...params).total;

    const dataStmt = db.prepare(`SELECT * FROM ${table} ${whereSql} ORDER BY LOWER(wordForm) ASC LIMIT ? OFFSET ?`);
    const words = dataStmt.all(...params, Number(limit), Number(offset));

    return {
      words,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

/**
 * Query word by ID
 */
export async function queryWordById(dictionary, id) {
  const table = dictionary === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return rows[0] || null;
  } else {
    const db = getSQLiteDatabase();
    return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) || null;
  }
}

/**
 * Query lexicon entries with search and pagination
 */
export async function queryLexicon(dictionary, { search = '', page = 1, limit = 20 } = {}) {
  const table = dictionary === 'gizey' ? 'gizey_lexicon' : 'massa_lexicon';
  const targetCol = dictionary === 'gizey' ? 'gizey' : 'massa';
  const offset = (Math.max(1, page) - 1) * limit;

  let whereClauses = [];
  let params = [];

  if (search) {
    whereClauses.push(`(french LIKE ? OR ${targetCol} LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM ${table} ${whereSql}`,
      params
    );
    const total = countRows[0] ? Number(countRows[0].total) : 0;

    const [items] = await pool.query(
      `SELECT * FROM ${table} ${whereSql} ORDER BY LOWER(french) ASC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } else {
    const db = getSQLiteDatabase();
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM ${table} ${whereSql}`);
    const total = countStmt.get(...params).total;

    const dataStmt = db.prepare(`SELECT * FROM ${table} ${whereSql} ORDER BY LOWER(french) ASC LIMIT ? OFFSET ?`);
    const items = dataStmt.all(...params, Number(limit), Number(offset));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

/**
 * Get daily word of the day deterministically
 */
export async function getWordOfTheDay(dictionary) {
  const table = dictionary === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';
  
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
    const total = countRows[0] ? Number(countRows[0].total) : 0;
    if (total === 0) return null;

    const offset = dayOfYear % total;
    const [rows] = await pool.query(`SELECT * FROM ${table} LIMIT 1 OFFSET ?`, [Number(offset)]);
    return rows[0] || null;
  } else {
    const db = getSQLiteDatabase();
    const total = db.prepare(`SELECT COUNT(*) as total FROM ${table}`).get().total;
    if (total === 0) return null;

    const offset = dayOfYear % total;
    return db.prepare(`SELECT * FROM ${table} LIMIT 1 OFFSET ?`).get(offset) || null;
  }
}

/**
 * Get platform overview numbers (total words, lexicon pairs)
 */
export async function getOverview(dictionary = 'massa') {
  const dictTable = dictionary === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';
  const lexTable = dictionary === 'gizey' ? 'gizey_lexicon' : 'massa_lexicon';

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [wRows] = await pool.query(`SELECT COUNT(*) as count FROM ${dictTable}`);
    const [lRows] = await pool.query(`SELECT COUNT(*) as count FROM ${lexTable}`);

    return {
      dictionary,
      total_words: wRows[0] ? Number(wRows[0].count) : 0,
      total_lexicon_pairs: lRows[0] ? Number(lRows[0].count) : 0
    };
  } else {
    const db = getSQLiteDatabase();
    const totalWords = db.prepare(`SELECT COUNT(*) as count FROM ${dictTable}`).get().count;
    const totalLexicon = db.prepare(`SELECT COUNT(*) as count FROM ${lexTable}`).get().count;

    return {
      dictionary,
      total_words: totalWords,
      total_lexicon_pairs: totalLexicon
    };
  }
}

/**
 * Save audio file base64 data to public/uploads/pronunciations/
 */
export function saveAudioBase64(base64Data, filenamePrefix = 'pronunciation') {
  if (!base64Data) return null;
  if (typeof base64Data === 'string' && (base64Data.startsWith('http://') || base64Data.startsWith('https://') || base64Data.startsWith('/uploads/'))) {
    return base64Data;
  }
  
  const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  let ext = 'webm';
  let buffer;
  if (matches) {
    const mime = matches[1];
    if (mime.includes('mp3') || mime.includes('mpeg')) ext = 'mp3';
    else if (mime.includes('wav')) ext = 'wav';
    else if (mime.includes('ogg')) ext = 'ogg';
    else if (mime.includes('m4a') || mime.includes('mp4')) ext = 'm4a';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(base64Data, 'base64');
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pronunciations');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const sanitizedPrefix = (filenamePrefix || 'pronunciation')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const filename = `${sanitizedPrefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);
  return `/uploads/pronunciations/${filename}`;
}

/**
 * Check if a word has a pronunciation attached
 */
export async function getWordPronunciation(dictionary, word) {
  const table = dictionary === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [rows] = await pool.query(
      `SELECT id, wordForm, pronunciation_url FROM ${table} WHERE LOWER(wordForm) = LOWER(?) LIMIT 1`,
      [word]
    );
    const entry = rows[0] || null;
    return {
      hasPronunciation: Boolean(entry && entry.pronunciation_url),
      pronunciation_url: entry ? entry.pronunciation_url : null,
      wordForm: entry ? entry.wordForm : word
    };
  } else {
    const db = getSQLiteDatabase();
    const entry = db.prepare(
      `SELECT id, wordForm, pronunciation_url FROM ${table} WHERE LOWER(wordForm) = LOWER(?) LIMIT 1`
    ).get(word);

    return {
      hasPronunciation: Boolean(entry && entry.pronunciation_url),
      pronunciation_url: entry ? entry.pronunciation_url : null,
      wordForm: entry ? entry.wordForm : word
    };
  }
}

/**
 * Save and attach a word pronunciation
 */
export async function saveWordPronunciation(dictionary, { wordId, wordForm, audioUrl, audioData }) {
  const dictTable = dictionary === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';
  const suggTable = dictionary === 'gizey' ? 'gizey_pronunciation_suggestions' : 'massa_pronunciation_suggestions';

  let finalUrl = audioUrl;
  if (audioData) {
    finalUrl = saveAudioBase64(audioData, `${dictionary}-${wordForm || 'word'}`);
  }

  if (!finalUrl) {
    throw new Error('No audio URL or audio recording data provided');
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const suggId = crypto.randomUUID();

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    if (wordId) {
      await pool.query(
        `UPDATE ${dictTable} SET pronunciation_url = ?, updated_at = ? WHERE id = ?`,
        [finalUrl, now, wordId]
      );
    } else if (wordForm) {
      await pool.query(
        `UPDATE ${dictTable} SET pronunciation_url = ?, updated_at = ? WHERE wordForm = ?`,
        [finalUrl, now, wordForm]
      );
    }

    await pool.query(
      `INSERT INTO ${suggTable} (id, word_form, pronunciation_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [suggId, wordForm || '', finalUrl, now, now]
    );
  } else {
    const db = getSQLiteDatabase();
    if (wordId) {
      db.prepare(`UPDATE ${dictTable} SET pronunciation_url = ?, updated_at = ? WHERE id = ?`).run(finalUrl, now, wordId);
    } else if (wordForm) {
      db.prepare(`UPDATE ${dictTable} SET pronunciation_url = ?, updated_at = ? WHERE wordForm = ?`).run(finalUrl, now, wordForm);
    }

    db.prepare(`INSERT INTO ${suggTable} (id, word_form, pronunciation_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`).run(
      suggId,
      wordForm || '',
      finalUrl,
      now,
      now
    );
  }

  return {
    success: true,
    pronunciation_url: finalUrl,
    wordId,
    wordForm
  };
}

/**
 * Insert a word contribution suggestion
 */
export async function insertWordSuggestion(dictionary, data) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let pronunciationUrl = data.pronunciation_url || null;
  if (data.audioData && !pronunciationUrl) {
    pronunciationUrl = saveAudioBase64(data.audioData, `${dictionary}-suggest-${data.spelling || 'word'}`);
  }

  if (dictionary === 'massa') {
    if (isUsingMySQL()) {
      const pool = getMySQLPool();
      await pool.query(
        `INSERT INTO massa_word_suggestions 
         (id, dialect, spelling, part_of_speech, meaning_1, example_1, translation_1, pronunciation_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.dialect || '',
          data.spelling || '',
          data.part_of_speech || '',
          data.meaning_1 || '',
          data.example_1 || '',
          data.translation_1 || '',
          pronunciationUrl,
          now,
          now
        ]
      );
    } else {
      const db = getSQLiteDatabase();
      const stmt = db.prepare(`
        INSERT INTO massa_word_suggestions 
        (id, dialect, spelling, part_of_speech, meaning_1, example_1, translation_1, pronunciation_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        data.dialect || '',
        data.spelling || '',
        data.part_of_speech || '',
        data.meaning_1 || '',
        data.example_1 || '',
        data.translation_1 || '',
        pronunciationUrl,
        now,
        now
      );
    }
    return { id, ...data, pronunciation_url: pronunciationUrl };
  } else {
    if (isUsingMySQL()) {
      const pool = getMySQLPool();
      await pool.query(
        `INSERT INTO gizey_word_suggestions 
         (id, spelling, part_of_speech, meaning_1, example_1, translation_1, pronunciation_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.spelling || '',
          data.part_of_speech || '',
          data.meaning_1 || '',
          data.example_1 || '',
          data.translation_1 || '',
          pronunciationUrl,
          now,
          now
        ]
      );
    } else {
      const db = getSQLiteDatabase();
      const stmt = db.prepare(`
        INSERT INTO gizey_word_suggestions 
        (id, spelling, part_of_speech, meaning_1, example_1, translation_1, pronunciation_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        id,
        data.spelling || '',
        data.part_of_speech || '',
        data.meaning_1 || '',
        data.example_1 || '',
        data.translation_1 || '',
        pronunciationUrl,
        now,
        now
      );
    }
    return { id, ...data, pronunciation_url: pronunciationUrl };
  }
}
