import { json } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export async function GET({ url }) {
	let id = url.searchParams.get('id');
	if (typeof id === 'string') id = id.trim().toLowerCase();

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const getQuizData = (moduleId: string) => {
		try {
			const filePath = join(__dirname, '../../../vi_json', `quiz-${moduleId}.json`);
			const data = readFileSync(filePath, 'utf-8');
			return JSON.parse(data);
		} catch {
			return [];
		}
	};

	let quizzes: unknown[] = [];

	if (id && /^(\d+)$/.test(id)) {
		quizzes = getQuizData(id);
	} else if (id === 'all') {
		quizzes = [];
		for (let i = 1; i <= 4; i++) {
			quizzes = quizzes.concat(getQuizData(i.toString()));
		}
	} else {
		quizzes = [];
	}

	return json({ quizzes });
}
