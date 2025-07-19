import { json } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET({ url }) {
	let id = url.searchParams.get('id');
	if (typeof id === 'string') id = id.trim().toLowerCase();

	const getQuizData = (moduleId: string) => {
		try {
			const filePath = join(
				process.cwd(),
				'src',
				'lib',
				'server',
				'vi_json',
				`quiz-${moduleId}.json`
			);
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
