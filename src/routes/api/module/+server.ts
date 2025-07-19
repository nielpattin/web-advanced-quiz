import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET({ url }) {
	let id = url.searchParams.get('id');
	if (typeof id === 'string') id = id.trim().toLowerCase();
	const dbPath = join(process.cwd(), 'src/lib/server/quiz-all.db');

	if (!existsSync(dbPath)) {
		return json({ error: 'Database not found' }, { status: 404 });
	}

	try {
		const db = new Database(dbPath, { readonly: true });
		let rows: Record<string, unknown>[] = [];

		if (id && /^[1-9]$/.test(id)) {
			const moduleKey = `module_${id}`;
			rows = db.prepare('SELECT * FROM quizzes WHERE quiz_number = ?').all(moduleKey) as Record<
				string,
				unknown
			>[];
		} else if (id === 'all') {
			rows = db.prepare('SELECT * FROM quizzes').all() as Record<string, unknown>[];
		} else if (id) {
			rows = [];
		} else {
			rows = [];
		}
		db.close();

		const quizzes = rows.map((row: Record<string, unknown>) => ({
			...row,
			answers: (() => {
				try {
					return typeof row.answers === 'string' ? JSON.parse(row.answers) : undefined;
				} catch {
					return [];
				}
			})()
		}));
		return json({ quizzes });
	} catch (err) {
		let message = 'Unknown error';
		let stack: string | undefined = undefined;
		if (err instanceof Error) {
			message = err.message;
			stack = err.stack;
		}
		return json(
			{
				error: 'Failed to read module database',
				details: message,
				stack
			},
			{ status: 500 }
		);
	}
}
