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

		if (id && /^(\d+(?:-\d+)*)$/.test(id)) {
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

		const quizzes = rows.map((row: Record<string, unknown>) => {
			let module_id: string | undefined = undefined;
			if (typeof row.quiz_number === 'string') {
				if (row.quiz_number.startsWith('module_')) {
					const mod = row.quiz_number.replace('module_', '');
					if (!mod.includes('-')) module_id = mod;
				} else if (!row.quiz_number.includes('-')) {
					module_id = row.quiz_number;
				}
			}
			return {
				...row,
				answers: (() => {
					try {
						return typeof row.answers === 'string' ? JSON.parse(row.answers) : undefined;
					} catch {
						return [];
					}
				})(),
				module_id
			};
		});
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
