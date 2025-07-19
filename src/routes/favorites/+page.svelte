<script lang="ts">
	import Sidebar from '../Sidebar.svelte';
	import TopBar from '../TopBar.svelte';
	import QuizCard from '../QuizCard.svelte';

	type Quiz = {
		question_id: string;
		answers: string[];
		module_id?: string;
		[key: string]: unknown;
	};

	let modules = $state([
		{ value: '', label: 'Select Module' },
		{ value: '1', label: 'Module 1' },
		{ value: '2', label: 'Module 2' },
		{ value: '3', label: 'Module 3' },
		{ value: '4', label: 'Module 4' },
		{ value: '5', label: 'Module 5' },
		{ value: '6', label: 'Module 6' },
		{ value: '7', label: '7 - Module 1' },
		{ value: '8', label: '8 - Module 2,3,4,5,6' },
		{ value: '9', label: '9 - MUST LEARN' },
		{ value: 'all', label: 'All Modules' }
	]);
	// No dynamic fetch, keep this array in sync with main page
	import { onMount } from 'svelte';

	let appState = $state({
		favoritesModuleId: 'all',
		favoritesCurrent: 0
	});
	let moduleId = $derived(() => appState.favoritesModuleId);
	let current = $derived(() => appState.favoritesCurrent);
	let favorites: Set<string> = $state(new Set());
	let allQuizzes: Quiz[] = $state([]);

	function persistState() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('appState', JSON.stringify(appState));
		}
	}

	// quizData is now a $derived() rune below
	const quizData = $derived(() => {
		const allQuizzesVal: Quiz[] = allQuizzes;
		const favoritesVal: Set<string> = favorites;
		const moduleIdVal: string = moduleId();

		return moduleIdVal === 'all'
			? allQuizzesVal.filter((q: Quiz) => favoritesVal.has(q.question_id))
			: allQuizzesVal.filter(
					(q: Quiz) => favoritesVal.has(q.question_id) && q.module_id === moduleIdVal
				);
	});

	onMount(() => {
		if (typeof window !== 'undefined') {
			const loaded = JSON.parse(localStorage.getItem('appState') || '{}') || {};
			if (!loaded.favoritesModuleId || !modules.some((m) => m.value === loaded.favoritesModuleId)) {
				loaded.favoritesModuleId = 'all';
			}
			if (loaded.favoritesCurrent === undefined || isNaN(Number(loaded.favoritesCurrent))) {
				loaded.favoritesCurrent = 0;
			}
			appState = loaded;

			const loadData = async () => {
				let favsRaw = localStorage.getItem('favoriteQuestions');
				if (favsRaw === null) {
					localStorage.setItem('favoriteQuestions', '[]');
					favsRaw = '[]';
				}
				const favs = JSON.parse(favsRaw);
				favorites = new Set(favs);

				try {
					if ((window as any)._allModulesCache) {
						allQuizzes = (window as any)._allModulesCache;
					} else {
						const allModulesResponse = await fetch('/api/module?id=all');
						const allModulesData = await allModulesResponse.json();

						if (Array.isArray(allModulesData.quizzes)) {
							allQuizzes = allModulesData.quizzes.filter((q: Quiz) => q.status !== 'all_false');
							(window as any)._allModulesCache = allQuizzes;
						}
					}
				} catch (error) {
					console.error('Failed to load quiz data:', error);
				}
			};

			loadData();

			const storageListener = () => {
				loadData();
			};

			window.addEventListener('storage', storageListener);
			return () => window.removeEventListener('storage', storageListener);
		}
	});

	function setCurrent(idx: number) {
		appState.favoritesCurrent = idx;
		persistState();
	}

	function setSidebarOpen(open: boolean) {}

	function setModuleIdHandler(id: string) {
		appState.favoritesModuleId = id;
		appState.favoritesCurrent = 0;
		persistState();
	}
</script>

<div class="flex flex-row min-h-screen min-w-screen w-screen bg-[#1D1B2C] text-[#CECDE0] font-sans">
	<Sidebar
		quizData={quizData()}
		current={current()}
		{favorites}
		{setCurrent}
		sidebarOpen={true}
		{setSidebarOpen}
		addFavorite={(id: string) => {
			favorites = new Set([...favorites, id]);
			localStorage.setItem('favoriteQuestions', JSON.stringify([...favorites]));
		}}
		removeFavorite={(id: string) => {
			favorites = new Set([...favorites].filter((qid) => qid !== id));
			localStorage.setItem('favoriteQuestions', JSON.stringify([...favorites]));
		}}
	/>
	<div id="main-content-wrapper" class="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
		<TopBar
			{modules}
			moduleId={moduleId()}
			setModuleId={setModuleIdHandler}
			showFavorites={() => {}}
			onBackToAll={() => { import('$app/navigation').then(({ goto }) => goto('/')); }}
			onClearFavorites={() => {
				localStorage.setItem('favoriteQuestions', '[]');
				location.reload();
			}}
		/>
		<div
			id="main-content"
			class="main-scrollbar flex-1 flex flex-col items-center justify-start overflow-y-auto max-h-full"
		>
			{#if quizData().length > 0}
				<QuizCard
					currentQuestion={quizData()[current()]}
					current={current()}
					quizData={quizData()}
					selectedAnswers={[]}
					questionLocked={false}
					checkAnswers={() => {}}
					handleAnswerClick={() => {}}
					{favorites}
					toggleFavorite={() => {
						const id = quizData()[current()]?.question_id;
						if (!id) return;
						if (favorites.has(id)) {
							favorites = new Set([...favorites].filter((qid) => qid !== id));
						} else {
							favorites = new Set([...favorites, id]);
						}
						localStorage.setItem('favoriteQuestions', JSON.stringify([...favorites]));
					}}
					answers={quizData()[current()]?.answers ?? []}
				/>
			{:else}
				<div class="text-center text-lg mt-10 text-[#8582B0]">
					No favorite questions found.
					<button
						class="mt-6 px-4 py-2 rounded bg-[#28264a] text-[#CECDE0] hover:bg-[#3a3760] transition"
						onclick={() => import('$app/navigation').then(({ goto }) => goto('/'))}
					>
						Go to main page to add favorites
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
