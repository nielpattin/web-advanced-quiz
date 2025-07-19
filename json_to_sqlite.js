// json_to_sqlite.js

import { readdirSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join, basename, extname } from 'path';
import Database from 'better-sqlite3';

const rawDir = 'vi_json';
const dbPath = 'src/lib/server/quiz-all.db';

// Delete the old database file if it exists
if (existsSync(dbPath)) {
  unlinkSync(dbPath);
  console.log(`Removed old database file: ${dbPath}`);
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS quizzes (
    question_id TEXT PRIMARY KEY,
    question_text TEXT,
    question_type TEXT,
    answers TEXT,
    status TEXT,
    quiz_number TEXT
  )
`);

const files = readdirSync(rawDir).filter((f) => extname(f) === '.json');

const insert = db.prepare(
	'INSERT OR REPLACE INTO quizzes (question_id, question_text, question_type, answers, status, quiz_number) VALUES (?, ?, ?, ?, ?, ?)'
);

const dbTransaction = db.transaction((quizzes, quiz_number) => {
    const grouped = {};
	for (const q of quizzes) {
		const key = q.question_text.trim();
		if (!grouped[key]) grouped[key] = [];
		grouped[key].push(q);
	}

	for (const group of Object.values(grouped)) {
		for (const q of group) {
			const allFalse = q.answers.every((a) => !a.is_correct);
			const status = allFalse ? 'all_false' : 'correct';
			insert.run(
				q.question_id,
				q.question_text,
				q.question_type,
				JSON.stringify(q.answers),
				status,
				quiz_number
			);
		}
	}
});


for (const file of files) {
	const jsonPath = join(rawDir, file);
	const quizzes = JSON.parse(readFileSync(jsonPath, 'utf8'));

	// Extract quiz_number from file name
	// e.g. quiz-1.json -> module_1
	let quiz_number_base = basename(file, '.json');
	const match = quiz_number_base.match(/quiz-(\d+)/);
	let quiz_number = quiz_number_base; // Default to base name
	if (match && match[1]) {
		quiz_number = `module_${match[1]}`;
	}

    dbTransaction(quizzes, quiz_number);
}

db.close();

console.log(`Successfully created ${dbPath}`);