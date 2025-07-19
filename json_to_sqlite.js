// json_to_sqlite.js

import { readdirSync, readFileSync } from 'fs';
import { join, basename, extname } from 'path';
import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const rawDir = 'vi_json';

if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
	console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN environment variables');
	console.error('Please create a .env file with your Turso credentials');
	process.exit(1);
}

const db = createClient({
	url: process.env.TURSO_URL,
	authToken: process.env.TURSO_AUTH_TOKEN
});

await db.execute(`
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

async function insertQuizzes(quizzes, quiz_number) {
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

			await db.execute({
				sql: 'INSERT OR REPLACE INTO quizzes (question_id, question_text, question_type, answers, status, quiz_number) VALUES (?, ?, ?, ?, ?, ?)',
				args: [
					q.question_id,
					q.question_text,
					q.question_type,
					JSON.stringify(q.answers),
					status,
					quiz_number
				]
			});
		}
	}
}

for (const file of files) {
	const jsonPath = join(rawDir, file);
	const quizzes = JSON.parse(readFileSync(jsonPath, 'utf8'));

	let quiz_number_base = basename(file, '.json');
	const match = quiz_number_base.match(/quiz-(\d+)/);
	let quiz_number = quiz_number_base;
	if (match && match[1]) {
		quiz_number = `module_${match[1]}`;
	}

	console.log(`Processing ${file} as ${quiz_number}...`);
	await insertQuizzes(quizzes, quiz_number);
	console.log(`✓ Inserted ${quizzes.length} questions from ${file}`);
}

console.log('Successfully uploaded all data to Turso database');
