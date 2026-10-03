import { DatabaseSync } from 'node:sqlite';
import mysql from 'mysql2';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
const outputPath = path.join(process.cwd(), 'data', 'massa_gizey_mysql.sql');

const sqliteDb = new DatabaseSync(dbPath);

const tableDefinitions = {
  massa_dictionary: `CREATE TABLE IF NOT EXISTS \`massa_dictionary\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`wordForm\` varchar(255) NOT NULL,
  \`otherForms\` text DEFAULT NULL,
  \`dialect\` varchar(100) DEFAULT NULL,
  \`partOfSpeech\` varchar(100) NOT NULL,
  \`otherParts\` text DEFAULT NULL,
  \`pronunciation_url\` varchar(500) DEFAULT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_massa_wordForm\` (\`wordForm\`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  gizey_dictionary: `CREATE TABLE IF NOT EXISTS \`gizey_dictionary\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`wordForm\` varchar(255) NOT NULL,
  \`otherForms\` text DEFAULT NULL,
  \`partOfSpeech\` varchar(100) NOT NULL,
  \`otherParts\` text DEFAULT NULL,
  \`pronunciation_url\` varchar(500) DEFAULT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_gizey_wordForm\` (\`wordForm\`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  massa_lexicon: `CREATE TABLE IF NOT EXISTS \`massa_lexicon\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`french\` varchar(255) NOT NULL,
  \`massa\` varchar(255) NOT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_massa_lex_french\` (\`french\`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  gizey_lexicon: `CREATE TABLE IF NOT EXISTS \`gizey_lexicon\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`french\` varchar(255) NOT NULL,
  \`gizey\` varchar(255) NOT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_gizey_lex_french\` (\`french\`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  massa_word_suggestions: `CREATE TABLE IF NOT EXISTS \`massa_word_suggestions\` (
  \`id\` varchar(64) NOT NULL,
  \`dialect\` varchar(100) DEFAULT NULL,
  \`spelling\` varchar(255) NOT NULL,
  \`part_of_speech\` varchar(100) NOT NULL,
  \`meaning_1\` text DEFAULT NULL,
  \`meaning_2\` text DEFAULT NULL,
  \`meaning_3\` text DEFAULT NULL,
  \`example_1\` text DEFAULT NULL,
  \`example_2\` text DEFAULT NULL,
  \`example_3\` text DEFAULT NULL,
  \`translation_1\` text DEFAULT NULL,
  \`translation_2\` text DEFAULT NULL,
  \`translation_3\` text DEFAULT NULL,
  \`pronunciation_url\` varchar(500) DEFAULT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  gizey_word_suggestions: `CREATE TABLE IF NOT EXISTS \`gizey_word_suggestions\` (
  \`id\` varchar(64) NOT NULL,
  \`spelling\` varchar(255) NOT NULL,
  \`part_of_speech\` varchar(100) NOT NULL,
  \`meaning_1\` text DEFAULT NULL,
  \`meaning_2\` text DEFAULT NULL,
  \`meaning_3\` text DEFAULT NULL,
  \`example_1\` text DEFAULT NULL,
  \`example_2\` text DEFAULT NULL,
  \`example_3\` text DEFAULT NULL,
  \`translation_1\` text DEFAULT NULL,
  \`translation_2\` text DEFAULT NULL,
  \`translation_3\` text DEFAULT NULL,
  \`pronunciation_url\` varchar(500) DEFAULT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  massa_pronunciation_suggestions: `CREATE TABLE IF NOT EXISTS \`massa_pronunciation_suggestions\` (
  \`id\` varchar(64) NOT NULL,
  \`word_form\` varchar(255) NOT NULL,
  \`pronunciation_url\` varchar(500) NOT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  gizey_pronunciation_suggestions: `CREATE TABLE IF NOT EXISTS \`gizey_pronunciation_suggestions\` (
  \`id\` varchar(64) NOT NULL,
  \`word_form\` varchar(255) NOT NULL,
  \`pronunciation_url\` varchar(500) NOT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  users: `CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`email_verified_at\` datetime DEFAULT NULL,
  \`password\` varchar(255) NOT NULL,
  \`remember_token\` varchar(100) DEFAULT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`users_email_unique\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  password_reset_tokens: `CREATE TABLE IF NOT EXISTS \`password_reset_tokens\` (
  \`email\` varchar(255) NOT NULL,
  \`token\` varchar(255) NOT NULL,
  \`created_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  sessions: `CREATE TABLE IF NOT EXISTS \`sessions\` (
  \`id\` varchar(255) NOT NULL,
  \`user_id\` bigint(20) unsigned DEFAULT NULL,
  \`ip_address\` varchar(45) DEFAULT NULL,
  \`user_agent\` text DEFAULT NULL,
  \`payload\` longtext NOT NULL,
  \`last_activity\` int(11) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`sessions_user_id_index\` (\`user_id\`),
  KEY \`sessions_last_activity_index\` (\`last_activity\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  personal_access_tokens: `CREATE TABLE IF NOT EXISTS \`personal_access_tokens\` (
  \`id\` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  \`tokenable_type\` varchar(255) NOT NULL,
  \`tokenable_id\` bigint(20) unsigned NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`token\` varchar(64) NOT NULL,
  \`abilities\` text DEFAULT NULL,
  \`last_used_at\` datetime DEFAULT NULL,
  \`expires_at\` datetime DEFAULT NULL,
  \`created_at\` datetime DEFAULT NULL,
  \`updated_at\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`personal_access_tokens_token_unique\` (\`token\`),
  KEY \`personal_access_tokens_tokenable_type_tokenable_id_index\` (\`tokenable_type\`,\`tokenable_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
};

const output = [];

output.push(`-- -------------------------------------------------------------`);
output.push(`-- Massa & Gizey Bilingual Lexicographical Platform Database Dump`);
output.push(`-- Generated for MySQL / MariaDB (Hostinger Shared Hosting & phpMyAdmin)`);
output.push(`-- Charset: utf8mb4 (supports special phonetic letters Ɓ, Ɗ, Ɦ, Ɬ, ɮ, Ŋ, ʔ)`);
output.push(`-- -------------------------------------------------------------\n`);

output.push(`SET NAMES utf8mb4;`);
output.push(`SET FOREIGN_KEY_CHECKS = 0;`);
output.push(`SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";`);
output.push(`SET time_zone = "+00:00";\n`);

const tablesToExport = Object.keys(tableDefinitions);

for (const tableName of tablesToExport) {
  output.push(`--`);
  output.push(`-- Table structure for table \`${tableName}\``);
  output.push(`--`);
  output.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
  output.push(tableDefinitions[tableName] + '\n');

  // Fetch rows from SQLite
  try {
    const rows = sqliteDb.prepare(`SELECT * FROM ${tableName}`).all();
    if (rows && rows.length > 0) {
      output.push(`--`);
      output.push(`-- Dumping data for table \`${tableName}\` (${rows.length} rows)`);
      output.push(`--`);

      const columns = Object.keys(rows[0]);
      const quotedCols = columns.map(c => `\`${c}\``).join(', ');

      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valuesList = batch.map(row => {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return 'NULL';
            return mysql.escape(val);
          });
          return `(${values.join(', ')})`;
        });

        output.push(`INSERT INTO \`${tableName}\` (${quotedCols}) VALUES\n${valuesList.join(',\n')};`);
      }
      output.push('');
    }
  } catch (err) {
    console.warn(`Could not export rows for ${tableName}:`, err.message);
  }
}

output.push(`SET FOREIGN_KEY_CHECKS = 1;`);

fs.writeFileSync(outputPath, output.join('\n'), 'utf8');
console.log(`Successfully exported MySQL dump to: ${outputPath} (${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB)`);
