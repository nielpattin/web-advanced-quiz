<script lang="ts">
	import Sidebar from '../Sidebar.svelte';
	import TopBar from '../TopBar.svelte';
	import QuizCard from '../QuizCard.svelte';
	import { onMount } from 'svelte';

	type Quiz = {
		question_id: string;
		answers: string[];
		module_id?: string;
		[key: string]: unknown;
	};

	import { modules as modulesRaw } from '../../lib/modules';
	let modules = $state(modulesRaw);

	let appState = $state({
		favoritesModuleId: 'all',
		favoritesCurrent: 0
	});
	let moduleId = $derived(() => appState.favoritesModuleId);
	let current = $derived(() => appState.favoritesCurrent);
	let favorites: Set<string> = $state(new Set());
	let allQuizzes: Quiz[] = $state([]);
	let isLoading = $state(false);

	let sidebarOpen = $state(false);

	function persistState() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('appState', JSON.stringify(appState));
		}
	}

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
					isLoading = true;
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
				} finally {
					isLoading = false;
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

	function setSidebarOpen(open: boolean) {
		sidebarOpen = open;
	}

	function setModuleIdHandler(id: string) {
		appState.favoritesModuleId = id;
		appState.favoritesCurrent = 0;
		persistState();
	}
</script>

<div class="flex flex-row min-h-screen min-w-screen w-screen bg-[#1D1B2C] text-[#CECDE0] font-sans">
	{#if typeof window !== 'undefined' && (window.innerWidth >= 768 || sidebarOpen)}
		{#if sidebarOpen && window.innerWidth < 768}
			<button
				type="button"
				class="fixed inset-0 z-[1000] bg-black/50 backdrop-opacity-60 md:hidden"
				tabIndex="0"
				aria-label="Close sidebar"
				onclick={() => (sidebarOpen = false)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						sidebarOpen = false;
					}
				}}
			></button>
		{/if}
		<div
			class="
				md:static md:block
				fixed top-0 left-0 z-[1001]
				h-screen
				transition-transform duration-200
				bg-[#29273F]
				{sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
				md:translate-x-0
				md:min-w-[200px] md:w-[250px]
			"
			style="will-change: transform;"
		>
			<Sidebar
				quizData={quizData()}
				current={current()}
				{favorites}
				{setCurrent}
				{sidebarOpen}
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
		</div>
	{/if}
	<div id="main-content-wrapper" class="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
		<div class="w-full">
			{#if typeof window !== 'undefined'}
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
					{sidebarOpen}
					setSidebarOpen={(open: boolean) => (sidebarOpen = open)}
				/>
			{/if}
		</div>
		<div
			id="main-content"
			class="main-scrollbar flex-1 flex flex-col items-center justify-start overflow-y-auto max-h-full"
		>
			{#if isLoading}
				<div class="flex flex-col items-center justify-center w-full h-[350px]">
					<svg
						class="animate-spin h-16 w-16 text-[#C294FF]"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
						></path>
					</svg>
				</div>
			{:else if quizData().length > 0}
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
					on:swipeLeft={() => {
						if (current() < quizData().length - 1) {
							appState.favoritesCurrent = current() + 1;
							persistState();
						}
					}}
					on:swipeRight={() => {
						if (current() > 0) {
							appState.favoritesCurrent = current() - 1;
							persistState();
						}
					}}
				/>
			{:else}
				<div class="text-center text-lg mt-10 text-[#8582B0]">No favorite questions found.</div>
			{/if}
		</div>
	</div>
</div>
