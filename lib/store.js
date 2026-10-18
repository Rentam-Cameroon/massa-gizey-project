import crypto from 'node:crypto';
import {
  isUsingMySQL,
  getMySQLPool,
  getSQLiteDatabase,
  saveAudioBase64,
  queryWordById,
  queryWords,
  queryLexicon
} from './db.js';

let schemaReady = false;
const letterCacheRef = {};

function nowSql() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function dictKey(value) {
  return value === 'gizey' ? 'gizey' : 'massa';
}

function assertLang(value) {
  const key = String(value || '').toLowerCase();
  if (key !== 'massa' && key !== 'gizey') {
    throw new Error('Invalid language. Choose Massa or Gizey.');
  }
  return key;
}

function dictTable(lang) {
  return lang === 'gizey' ? 'gizey_dictionary' : 'massa_dictionary';
}

function lexTable(lang) {
  return lang === 'gizey' ? 'gizey_lexicon' : 'massa_lexicon';
}

function suggTable(lang) {
  return lang === 'gizey' ? 'gizey_word_suggestions' : 'massa_word_suggestions';
}

function pronSuggTable(lang) {
  return lang === 'gizey' ? 'gizey_pronunciation_suggestions' : 'massa_pronunciation_suggestions';
}

const SQLITE_STORIES = `
CREATE TABLE IF NOT EXISTS video_stories (
  id TEXT PRIMARY KEY,
  slug TEXT,
  title TEXT NOT NULL,
  category TEXT,
  topic TEXT,
  description TEXT,
  full_description TEXT,
  duration TEXT,
  duration_formatted TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  hero_image_url TEXT,
  speaker TEXT,
  vocabulary_json TEXT,
  featured INTEGER DEFAULT 0,
  is_seed INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  rating_avg REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
`;

const MYSQL_STORIES = `
CREATE TABLE IF NOT EXISTS \`video_stories\` (
  \`id\` varchar(64) NOT NULL,
  \`slug\` varchar(255) DEFAULT NULL,
  \`title\` varchar(255) NOT NULL,
  \`category\` varchar(100) DEFAULT NULL,
  \`topic\` varchar(100) DEFAULT NULL,
  \`description\` text DEFAULT NULL,
  \`full_description\` text DEFAULT NULL,
  \`duration\` varchar(50) DEFAULT NULL,
  \`duration_formatted\` varchar(50) DEFAULT NULL,
  \`video_url\` varchar(1000) DEFAULT NULL,
  \`thumbnail_url\` varchar(1000) DEFAULT NULL,
  \`hero_image_url\` varchar(1000) DEFAULT NULL,
  \`speaker\` varchar(255) DEFAULT NULL,
  \`vocabulary_json\` text DEFAULT NULL,
  \`featured\` tinyint(1) DEFAULT 0,
  \`is_seed\` tinyint(1) DEFAULT 0,
  \`views\` int(11) DEFAULT 0,
  \`likes_count\` int(11) DEFAULT 0,
  \`rating_avg\` decimal(3,2) DEFAULT 0,
  \`rating_count\` int(11) DEFAULT 0,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_stories_featured\` (\`featured\`),
  KEY \`idx_stories_topic\` (\`topic\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const SEED_STORIES = [
  {
    id: 'why-words-travel',
    title: 'Why Words Travel',
    category: 'LANGUAGE',
    topic: 'Language',
    duration: '6 min watch',
    duration_formatted: '06:42',
    description: 'Follow the routes words take across borders, trade paths, and generations.',
    full_description: 'Words rarely stay still. Follow how trade, migration, technology, and everyday conversation carry words between languages and communities.',
    thumbnail_url: '/images/story_map.png',
    hero_image_url: '/images/featured_story_man.png',
    featured: 1,
    views: 14280,
    likes_count: 124,
    rating_avg: 4.6,
    rating_count: 38,
    vocabulary_json: JSON.stringify([
      { tag: 'borrowed word', desc: 'A word adopted from another language and naturalized into native use.' },
      { tag: 'language contact', desc: 'Social interaction between speakers of differing linguistic systems.' },
      { tag: 'etymology', desc: 'The study of the origin of words and the historical way their meanings changed.' },
      { tag: 'dialect', desc: 'A regional or social variety of language distinguished by pronunciation, grammar, or vocabulary.' }
    ])
  },
  {
    id: 'borrowed-words-history',
    title: 'A Brief History of Borrowed Words',
    category: 'HISTORY',
    topic: 'History',
    duration: '8 min watch',
    duration_formatted: '08:15',
    description: 'A short history of the words English has welcomed, adapted, and made its own.',
    full_description: 'A short history of the words English has welcomed, adapted, and made its own.',
    thumbnail_url: '/images/story_script.png',
    hero_image_url: '/images/story_script.png',
    featured: 0,
    views: 9840,
    likes_count: 96,
    rating_avg: 4.8,
    rating_count: 29
  },
  {
    id: 'language-of-place',
    title: 'The Language of Place',
    category: 'CULTURE',
    topic: 'Culture',
    duration: '5 min watch',
    duration_formatted: '05:30',
    description: 'Place names hold clues to landscapes, memory, and the people who call them home.',
    full_description: 'Place names hold clues to landscapes, memory, and the people who call them home.',
    thumbnail_url: '/images/story_signpost.png',
    hero_image_url: '/images/story_signpost.png',
    featured: 0,
    views: 11400,
    likes_count: 108,
    rating_avg: 4.7,
    rating_count: 34
  },
  {
    id: 'roots-of-rhythm',
    title: 'Roots of Rhythm in Speech',
    category: 'LANGUAGE',
    topic: 'Language',
    duration: '7 min watch',
    duration_formatted: '07:12',
    description: 'How prosody, cadence, and cadence patterns define emotional resonance across world tongues.',
    full_description: 'How prosody, cadence, and cadence patterns define emotional resonance across world tongues.',
    thumbnail_url: '/images/story_map.png',
    hero_image_url: '/images/story_map.png',
    featured: 0,
    views: 6210,
    likes_count: 77,
    rating_avg: 4.5,
    rating_count: 19
  }
];

async function seedStoriesIfEmpty() {
  const countRows = await all('SELECT COUNT(*) as total FROM video_stories');
  const total = Number(countRows[0]?.total || 0);
  if (total > 0) return;

  const ts = nowSql();
  for (const story of SEED_STORIES) {
    await run(
      `INSERT INTO video_stories (
        id, slug, title, category, topic, description, full_description, duration, duration_formatted,
        video_url, thumbnail_url, hero_image_url, speaker, vocabulary_json, featured, is_seed,
        views, likes_count, rating_avg, rating_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        story.id,
        story.id,
        story.title,
        story.category,
        story.topic,
        story.description,
        story.full_description,
        story.duration,
        story.duration_formatted,
        null,
        story.thumbnail_url,
        story.hero_image_url,
        null,
        story.vocabulary_json || null,
        story.featured,
        1,
        story.views,
        story.likes_count,
        story.rating_avg,
        story.rating_count,
        ts,
        ts
      ]
    );
  }
}

export async function ensureTables() {
  if (schemaReady) return;
  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    await pool.query(MYSQL_STORIES);
  } else {
    getSQLiteDatabase().exec(SQLITE_STORIES);
  }
  schemaReady = true;
  await seedStoriesIfEmpty();
}

async function all(sql, params = []) {
  if (isUsingMySQL()) {
    const [rows] = await getMySQLPool().query(sql, params);
    return rows;
  }
  const db = getSQLiteDatabase();
  const stmt = db.prepare(sql);
  return params.length ? stmt.all(...params) : stmt.all();
}

async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0] || null;
}

async function run(sql, params = []) {
  if (isUsingMySQL()) {
    const [result] = await getMySQLPool().query(sql, params);
    return result;
  }
  return getSQLiteDatabase().prepare(sql).run(...params);
}

export function invalidateLetterCache(lang) {
  if (lang) delete letterCacheRef[lang];
}

export function mapStory(row) {
  if (!row) return null;
  let vocabulary = [];
  if (row.vocabulary_json) {
    try {
      vocabulary = JSON.parse(row.vocabulary_json);
    } catch {
      vocabulary = [];
    }
  }
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    category: row.category,
    topic: row.topic,
    duration: row.duration,
    durationFormatted: row.duration_formatted,
    description: row.description,
    fullDescription: row.full_description || row.description,
    thumbnail: row.thumbnail_url,
    heroImage: row.hero_image_url || row.thumbnail_url,
    mainVideoFrame: row.hero_image_url || row.thumbnail_url,
    videoUrl: row.video_url,
    speaker: row.speaker,
    featured: Boolean(Number(row.featured)),
    isSeed: Boolean(Number(row.is_seed)),
    views: Number(row.views || 0),
    likesCount: Number(row.likes_count || 0),
    ratingAvg: Number(row.rating_avg || 0),
    ratingCount: Number(row.rating_count || 0),
    vocabulary,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listStories({ search = '', topic = '', admin = false } = {}) {
  await ensureTables();
  const realCount = await get('SELECT COUNT(*) as total FROM video_stories WHERE is_seed = 0');
  const hasReal = Number(realCount?.total || 0) > 0;

  let sql = 'SELECT * FROM video_stories WHERE 1=1';
  const params = [];
  if (!admin && hasReal) {
    sql += ' AND is_seed = 0';
  }
  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ? OR topic LIKE ? OR speaker LIKE ?)';
    const q = `%${search}%`;
    params.push(q, q, q, q);
  }
  if (topic && topic !== 'All stories') {
    sql += ' AND topic = ?';
    params.push(topic);
  }
  sql += ' ORDER BY featured DESC, created_at DESC, title ASC';
  const rows = await all(sql, params);
  return rows.map(mapStory);
}

export async function getStoryById(id, { bumpViews = false } = {}) {
  await ensureTables();
  const row = await get('SELECT * FROM video_stories WHERE id = ? OR slug = ?', [id, id]);
  if (!row) return null;
  const realCount = await get('SELECT COUNT(*) as total FROM video_stories WHERE is_seed = 0');
  const hasReal = Number(realCount?.total || 0) > 0;
  if (hasReal && Number(row.is_seed) === 1) return null;
  if (bumpViews) {
    await run('UPDATE video_stories SET views = COALESCE(views, 0) + 1 WHERE id = ?', [row.id]);
    row.views = Number(row.views || 0) + 1;
  }
  return mapStory(row);
}

function slugify(title, fallbackId) {
  const base = String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return base || fallbackId;
}

export async function createStory(data) {
  await ensureTables();
  const id = data.id || crypto.randomUUID();
  const ts = nowSql();
  const isSeed = data.is_seed ? 1 : 0;
  if (!isSeed) {
    await run('DELETE FROM video_stories WHERE is_seed = 1');
  }
  const slug = data.slug || slugify(data.title, id);
  const vocab = Array.isArray(data.vocabulary)
    ? JSON.stringify(data.vocabulary)
    : data.vocabulary_json || null;

  await run(
    `INSERT INTO video_stories (
      id, slug, title, category, topic, description, full_description, duration, duration_formatted,
      video_url, thumbnail_url, hero_image_url, speaker, vocabulary_json, featured, is_seed,
      views, likes_count, rating_avg, rating_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      slug,
      data.title || '',
      data.category || '',
      data.topic || data.category || '',
      data.description || '',
      data.full_description || data.fullDescription || data.description || '',
      data.duration || '',
      data.duration_formatted || data.durationFormatted || data.duration || '',
      data.video_url || data.videoUrl || null,
      data.thumbnail_url || data.thumbnail || null,
      data.hero_image_url || data.heroImage || data.thumbnail_url || null,
      data.speaker || null,
      vocab,
      data.featured ? 1 : 0,
      isSeed,
      Number(data.views || 0),
      Number(data.likes_count || data.likesCount || 0),
      Number(data.rating_avg || data.ratingAvg || 0),
      Number(data.rating_count || data.ratingCount || 0),
      ts,
      ts
    ]
  );
  return getStoryById(id);
}

export async function updateStory(id, data) {
  await ensureTables();
  const existing = await get('SELECT * FROM video_stories WHERE id = ?', [id]);
  if (!existing) return null;

  const vocab = Object.prototype.hasOwnProperty.call(data, 'vocabulary')
    ? JSON.stringify(data.vocabulary || [])
    : Object.prototype.hasOwnProperty.call(data, 'vocabulary_json')
      ? data.vocabulary_json
      : existing.vocabulary_json;

  const next = {
    title: data.title ?? existing.title,
    slug: data.slug ?? existing.slug,
    category: data.category ?? existing.category,
    topic: data.topic ?? data.category ?? existing.topic,
    description: data.description ?? existing.description,
    full_description: data.full_description ?? data.fullDescription ?? existing.full_description,
    duration: data.duration ?? existing.duration,
    duration_formatted: data.duration_formatted ?? data.durationFormatted ?? existing.duration_formatted,
    video_url: data.video_url ?? data.videoUrl ?? existing.video_url,
    thumbnail_url: data.thumbnail_url ?? data.thumbnail ?? existing.thumbnail_url,
    hero_image_url: data.hero_image_url ?? data.heroImage ?? existing.hero_image_url,
    speaker: data.speaker ?? existing.speaker,
    featured: data.featured === undefined ? existing.featured : (data.featured ? 1 : 0),
    vocabulary_json: vocab
  };

  await run(
    `UPDATE video_stories SET
      title = ?, slug = ?, category = ?, topic = ?, description = ?, full_description = ?,
      duration = ?, duration_formatted = ?, video_url = ?, thumbnail_url = ?, hero_image_url = ?,
      speaker = ?, vocabulary_json = ?, featured = ?, updated_at = ?
     WHERE id = ?`,
    [
      next.title, next.slug, next.category, next.topic, next.description, next.full_description,
      next.duration, next.duration_formatted, next.video_url, next.thumbnail_url, next.hero_image_url,
      next.speaker, next.vocabulary_json, next.featured, nowSql(), id
    ]
  );
  return getStoryById(id);
}

export async function deleteStory(id) {
  await ensureTables();
  await run('DELETE FROM video_stories WHERE id = ?', [id]);
  const remaining = await get('SELECT COUNT(*) as total FROM video_stories');
  if (Number(remaining?.total || 0) === 0) {
    schemaReady = true;
    await seedStoriesIfEmpty();
  }
  return true;
}

export async function getAdminOverview() {
  await ensureTables();
  const count = async (sql) => Number((await get(sql))?.total || 0);
  const [massaWords, gizeyWords, massaLex, gizeyLex, massaSugg, gizeySugg, massaPron, gizeyPron, stories, seedStories] = await Promise.all([
    count('SELECT COUNT(*) as total FROM massa_dictionary'),
    count('SELECT COUNT(*) as total FROM gizey_dictionary'),
    count('SELECT COUNT(*) as total FROM massa_lexicon'),
    count('SELECT COUNT(*) as total FROM gizey_lexicon'),
    count('SELECT COUNT(*) as total FROM massa_word_suggestions'),
    count('SELECT COUNT(*) as total FROM gizey_word_suggestions'),
    count('SELECT COUNT(*) as total FROM massa_pronunciation_suggestions'),
    count('SELECT COUNT(*) as total FROM gizey_pronunciation_suggestions'),
    count('SELECT COUNT(*) as total FROM video_stories'),
    count('SELECT COUNT(*) as total FROM video_stories WHERE is_seed = 1')
  ]);

  return {
    massaWords,
    gizeyWords,
    massaLex,
    gizeyLex,
    pendingSuggestions: massaSugg + gizeySugg,
    pendingPronunciations: massaPron + gizeyPron,
    stories,
    seedStories,
    totals: {
      words: massaWords + gizeyWords,
      lexicon: massaLex + gizeyLex
    }
  };
}

export async function adminQueryWords(lang, opts) {
  return queryWords(assertLang(lang), opts);
}

function formatInitialLetters(rows) {
  const counts = {};
  for (const row of rows) {
    const letter = Array.from(String(row.letter || '').trim())[0]?.toLocaleUpperCase('fr');
    if (letter) counts[letter] = (counts[letter] || 0) + Number(row.total || 0);
  }
  const letters = Object.keys(counts).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  return { letters, counts };
}

export async function adminGetDictionaryLetters(lang) {
  const key = assertLang(lang);
  const rows = await all(
    `SELECT SUBSTR(TRIM(wordForm), 1, 1) AS letter, COUNT(*) AS total
     FROM ${dictTable(key)}
     WHERE wordForm IS NOT NULL AND TRIM(wordForm) <> ''
     GROUP BY SUBSTR(TRIM(wordForm), 1, 1)
     ORDER BY LOWER(SUBSTR(TRIM(wordForm), 1, 1)) ASC`
  );
  return formatInitialLetters(rows);
}

export async function createDictionaryEntry(lang, data) {
  const key = assertLang(lang);
  const table = dictTable(key);
  const ts = nowSql();
  let pronunciationUrl = data.pronunciation_url || null;
  if (data.audioData) {
    pronunciationUrl = saveAudioBase64(data.audioData, `${key}-${data.wordForm || 'word'}`);
  }

  const wordForm = data.wordForm || '';
  const otherForms = data.otherForms || null;
  const partOfSpeech = data.partOfSpeech || '';
  const otherParts = data.otherParts || null;

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    if (key === 'massa') {
      const [result] = await pool.query(
        `INSERT INTO ${table} (wordForm, otherForms, dialect, partOfSpeech, otherParts, pronunciation_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [wordForm, otherForms, data.dialect || null, partOfSpeech, otherParts, pronunciationUrl, ts, ts]
      );
      return queryWordById(key, result.insertId);
    }
    const [result] = await pool.query(
      `INSERT INTO ${table} (wordForm, otherForms, partOfSpeech, otherParts, pronunciation_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [wordForm, otherForms, partOfSpeech, otherParts, pronunciationUrl, ts, ts]
    );
    return queryWordById(key, result.insertId);
  }

  const db = getSQLiteDatabase();
  let info;
  if (key === 'massa') {
    info = db.prepare(
      `INSERT INTO ${table} (wordForm, otherForms, dialect, partOfSpeech, otherParts, pronunciation_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(wordForm, otherForms, data.dialect || null, partOfSpeech, otherParts, pronunciationUrl, ts, ts);
  } else {
    info = db.prepare(
      `INSERT INTO ${table} (wordForm, otherForms, partOfSpeech, otherParts, pronunciation_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(wordForm, otherForms, partOfSpeech, otherParts, pronunciationUrl, ts, ts);
  }
  return queryWordById(key, info.lastInsertRowid);
}

export async function updateDictionaryEntry(lang, id, data) {
  const key = assertLang(lang);
  const table = dictTable(key);
  const existing = await queryWordById(key, id);
  if (!existing) return null;
  const ts = nowSql();
  let pronunciationUrl = data.pronunciation_url !== undefined ? data.pronunciation_url : existing.pronunciation_url;
  if (data.audioData) {
    pronunciationUrl = saveAudioBase64(data.audioData, `${key}-${data.wordForm || existing.wordForm || 'word'}`);
  }

  if (key === 'massa') {
    await run(
      `UPDATE ${table} SET wordForm = ?, otherForms = ?, dialect = ?, partOfSpeech = ?, otherParts = ?, pronunciation_url = ?, updated_at = ? WHERE id = ?`,
      [
        data.wordForm ?? existing.wordForm,
        data.otherForms ?? existing.otherForms,
        data.dialect ?? existing.dialect,
        data.partOfSpeech ?? existing.partOfSpeech,
        data.otherParts ?? existing.otherParts,
        pronunciationUrl,
        ts,
        id
      ]
    );
  } else {
    await run(
      `UPDATE ${table} SET wordForm = ?, otherForms = ?, partOfSpeech = ?, otherParts = ?, pronunciation_url = ?, updated_at = ? WHERE id = ?`,
      [
        data.wordForm ?? existing.wordForm,
        data.otherForms ?? existing.otherForms,
        data.partOfSpeech ?? existing.partOfSpeech,
        data.otherParts ?? existing.otherParts,
        pronunciationUrl,
        ts,
        id
      ]
    );
  }
  return queryWordById(key, id);
}

export async function deleteDictionaryEntry(lang, id) {
  const key = assertLang(lang);
  await run(`DELETE FROM ${dictTable(key)} WHERE id = ?`, [id]);
  return true;
}

export async function adminQueryLexicon(lang, opts) {
  return queryLexicon(assertLang(lang), opts);
}

export async function adminGetLexiconLetters(lang) {
  const key = assertLang(lang);
  const column = key === 'gizey' ? 'gizey' : 'massa';
  const rows = await all(
    `SELECT SUBSTR(TRIM(${column}), 1, 1) AS letter, COUNT(*) AS total
     FROM ${lexTable(key)}
     WHERE ${column} IS NOT NULL AND TRIM(${column}) <> ''
     GROUP BY SUBSTR(TRIM(${column}), 1, 1)
     ORDER BY LOWER(SUBSTR(TRIM(${column}), 1, 1)) ASC`
  );
  return formatInitialLetters(rows);
}

export async function createLexiconEntry(lang, data) {
  const key = assertLang(lang);
  const table = lexTable(key);
  const ts = nowSql();
  const french = data.french || '';
  const target = key === 'gizey' ? (data.gizey || '') : (data.massa || '');

  if (isUsingMySQL()) {
    const pool = getMySQLPool();
    const [result] = await pool.query(
      `INSERT INTO ${table} (french, ${key}, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [french, target, ts, ts]
    );
    const rows = await all(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
    return rows[0] || null;
  }
  const info = getSQLiteDatabase().prepare(
    `INSERT INTO ${table} (french, ${key}, created_at, updated_at) VALUES (?, ?, ?, ?)`
  ).run(french, target, ts, ts);
  return get(`SELECT * FROM ${table} WHERE id = ?`, [info.lastInsertRowid]);
}

export async function updateLexiconEntry(lang, id, data) {
  const key = assertLang(lang);
  const table = lexTable(key);
  const existing = await get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!existing) return null;
  const french = data.french ?? existing.french;
  const target = key === 'gizey' ? (data.gizey ?? existing.gizey) : (data.massa ?? existing.massa);
  await run(
    `UPDATE ${table} SET french = ?, ${key} = ?, updated_at = ? WHERE id = ?`,
    [french, target, nowSql(), id]
  );
  return get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
}

export async function deleteLexiconEntry(lang, id) {
  const key = assertLang(lang);
  await run(`DELETE FROM ${lexTable(key)} WHERE id = ?`, [id]);
  return true;
}

export async function listWordSuggestions(lang, { search = '', page = 1, limit = 20 } = {}) {
  const key = assertLang(lang);
  const table = suggTable(key);
  const offset = (Math.max(1, page) - 1) * limit;
  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE spelling LIKE ? OR part_of_speech LIKE ? OR meaning_1 LIKE ?';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const total = Number((await get(`SELECT COUNT(*) as total FROM ${table} ${where}`, params))?.total || 0);
  const items = await all(
    `SELECT * FROM ${table} ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
}

export async function updateWordSuggestion(lang, id, data) {
  const key = assertLang(lang);
  const table = suggTable(key);
  const existing = await get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!existing) return null;
  const merged = { ...existing, ...data };
  let pronunciationUrl = merged.pronunciation_url || null;
  if (data.audioData) {
    pronunciationUrl = saveAudioBase64(data.audioData, `${key}-suggest-${merged.spelling || 'word'}`);
  }
  const ts = nowSql();
  if (key === 'massa') {
    await run(
      `UPDATE ${table} SET dialect = ?, spelling = ?, part_of_speech = ?, meaning_1 = ?, meaning_2 = ?, meaning_3 = ?,
        example_1 = ?, example_2 = ?, example_3 = ?, translation_1 = ?, translation_2 = ?, translation_3 = ?,
        pronunciation_url = ?, updated_at = ? WHERE id = ?`,
      [
        merged.dialect || '', merged.spelling || '', merged.part_of_speech || '',
        merged.meaning_1 || null, merged.meaning_2 || null, merged.meaning_3 || null,
        merged.example_1 || null, merged.example_2 || null, merged.example_3 || null,
        merged.translation_1 || null, merged.translation_2 || null, merged.translation_3 || null,
        pronunciationUrl, ts, id
      ]
    );
  } else {
    await run(
      `UPDATE ${table} SET spelling = ?, part_of_speech = ?, meaning_1 = ?, meaning_2 = ?, meaning_3 = ?,
        example_1 = ?, example_2 = ?, example_3 = ?, translation_1 = ?, translation_2 = ?, translation_3 = ?,
        pronunciation_url = ?, updated_at = ? WHERE id = ?`,
      [
        merged.spelling || '', merged.part_of_speech || '',
        merged.meaning_1 || null, merged.meaning_2 || null, merged.meaning_3 || null,
        merged.example_1 || null, merged.example_2 || null, merged.example_3 || null,
        merged.translation_1 || null, merged.translation_2 || null, merged.translation_3 || null,
        pronunciationUrl, ts, id
      ]
    );
  }
  return get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
}

function composeOtherParts(sugg) {
  const blocks = [];
  for (let i = 1; i <= 3; i += 1) {
    const meaning = sugg[`meaning_${i}`];
    const example = sugg[`example_${i}`];
    const translation = sugg[`translation_${i}`];
    if (!meaning && !example && !translation) continue;
    const lines = [];
    if (meaning) lines.push(meaning);
    if (example) lines.push(`Example: ${example}`);
    if (translation) lines.push(`Translation: ${translation}`);
    blocks.push(lines.join('\n'));
  }
  return blocks.join('\n\n') || null;
}

export async function acceptWordSuggestion(lang, id, overrides = {}) {
  const key = assertLang(lang);
  const table = suggTable(key);
  const sugg = await get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!sugg) return null;
  const merged = { ...sugg, ...overrides };
  const entry = await createDictionaryEntry(key, {
    wordForm: merged.spelling,
    dialect: merged.dialect,
    partOfSpeech: merged.part_of_speech,
    otherParts: composeOtherParts(merged),
    pronunciation_url: merged.pronunciation_url
  });
  await run(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return entry;
}

export async function rejectWordSuggestion(lang, id) {
  const key = assertLang(lang);
  await run(`DELETE FROM ${suggTable(key)} WHERE id = ?`, [id]);
  return true;
}

export async function listPronunciationSuggestions(lang, { search = '', page = 1, limit = 20 } = {}) {
  const key = assertLang(lang);
  const table = pronSuggTable(key);
  const offset = (Math.max(1, page) - 1) * limit;
  let where = '';
  const params = [];
  if (search) {
    where = 'WHERE word_form LIKE ?';
    params.push(`%${search}%`);
  }
  const total = Number((await get(`SELECT COUNT(*) as total FROM ${table} ${where}`, params))?.total || 0);
  const items = await all(
    `SELECT * FROM ${table} ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
}

export async function acceptPronunciationSuggestion(lang, id) {
  const key = assertLang(lang);
  const table = pronSuggTable(key);
  const sugg = await get(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  if (!sugg) return { ok: false, reason: 'not_found' };

  const dict = dictTable(key);
  const word = await get(
    `SELECT * FROM ${dict} WHERE LOWER(wordForm) = LOWER(?) LIMIT 1`,
    [sugg.word_form]
  );
  if (!word) {
    return { ok: false, reason: 'word_missing', suggestion: sugg };
  }
  await run(
    `UPDATE ${dict} SET pronunciation_url = ?, updated_at = ? WHERE id = ?`,
    [sugg.pronunciation_url, nowSql(), word.id]
  );
  await run(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return { ok: true, word: { ...word, pronunciation_url: sugg.pronunciation_url }, suggestion: sugg };
}

export async function rejectPronunciationSuggestion(lang, id) {
  const key = assertLang(lang);
  await run(`DELETE FROM ${pronSuggTable(key)} WHERE id = ?`, [id]);
  return true;
}

export { dictKey, queryWordById };
