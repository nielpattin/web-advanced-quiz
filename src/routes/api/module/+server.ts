import { json } from '@sveltejs/kit';
import { createClient } from '@libsql/client';
import { TURSO_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

export async function GET({ url }) {
	const id = url.searchParams.get('id')?.trim().toLowerCase();

	const db = createClient({
		url: TURSO_URL,
		authToken: TURSO_AUTH_TOKEN
	});

	let quizzes: unknown[] = [];

	try {
		if (id && /^(\d+)$/.test(id)) {
			const moduleKey = `module_${id}`;
			const rows = await db.execute({
				sql: 'SELECT * FROM quizzes WHERE quiz_number = ?',
				args: [moduleKey]
			});
			quizzes = rows.rows.map((row: { [key: string]: unknown }) => ({
				...row,
				answers: typeof row.answers === 'string' ? JSON.parse(row.answers as string) : row.answers
			}));
		} else if (id === 'all') {
			const rows = await db.execute('SELECT * FROM quizzes');
			quizzes = rows.rows.map((row: { [key: string]: unknown }) => ({
				...row,
				answers: typeof row.answers === 'string' ? JSON.parse(row.answers as string) : row.answers
			}));
		} else {
			quizzes = [];
		}
	} catch (err) {
		return json(
			{ error: 'Failed to fetch from Turso', details: err instanceof Error ? err.message : err },
			{ status: 500 }
		);
	}

	return json({ quizzes });
}
