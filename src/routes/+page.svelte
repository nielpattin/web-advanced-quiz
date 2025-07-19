<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import TopBar from './TopBar.svelte';
	import QuizCard from './QuizCard.svelte';
	import FavoritesModal from './FavoritesModal.svelte';

	type Quiz = {
		question_id: string;
		answers: string[];
		[key: string]: unknown;
	};
	let quizData = $state<Quiz[]>([]);
	let current = $state<number>(0);
	let selectedAnswers = $state<number[]>([]);
	let questionLocked = $state(false);

	async function showFavorites() {
		const { goto } = await import('$app/navigation');
		goto('/favorites');
	}
	function onBackToAll() {
		if (typeof window !== 'undefined') {
			appState.currentView = 'all';
			moduleId = appState.all.module;
			loadQuizForModule(moduleId, appState.all.questionIndex);
		}
	}
	function onClearFavorites() {
		favorites = new Set();
		if (typeof window !== 'undefined') {
			localStorage.setItem('favoriteQuestions', '[]');
		}
		if (appState.currentView === 'favorites') {
			appState.currentView = 'all';
			moduleId = appState.all.module;
			loadQuizForModule(moduleId, appState.all.questionIndex);
		}
	}
	async function setModuleId(id: string) {
		moduleQuizCache.clear(); // Clear cache to ensure fresh data
		moduleId = id;
		appState.all.questionIndex = 0;
		current = 0;
		selectedAnswers = [];
		questionLocked = false;
		await loadQuizForModule(id, 0);
	}

	let currentQuestion = $derived(quizData[current]);
	let answers = $derived(currentQuestion ? (currentQuestion.answers ?? []) : []);

	let moduleQuizCache = new Map();
	let favorites = $state(new Set<string>());
	let appState = $state({
		currentView: 'all',
		all: { module: '', questionIndex: 0 },
		favorites: { questionIndex: 0 }
	});

	if (typeof window !== 'undefined') {
		favorites = new Set<string>(JSON.parse(localStorage.getItem('favoriteQuestions') || '[]'));
		{
			const loaded = JSON.parse(localStorage.getItem('appState') || '{}') || {};
			if (!loaded.all) loaded.all = { module: '', questionIndex: 0 };
			if (!loaded.favorites) loaded.favorites = { questionIndex: 0 };
			if (!loaded.currentView) loaded.currentView = 'all';
			appState = loaded;
		}
	}

	(() => {
		if (!appState.all) appState.all = { module: '', questionIndex: 0 };
		if (!appState.favorites) appState.favorites = { questionIndex: 0 };
		if (!appState.currentView) appState.currentView = 'all';
	})();

	let moduleId = $state('');
	import { modules } from '../lib/modules';

	// Sidebar open state
	let sidebarOpen = $state(typeof window !== 'undefined' && window.innerWidth >= 768);

	// Favorites modal
	let showFavModal = $state(false);
	let favIdList = $derived(Array.from(favorites).join(', '));

	// Quiz loading logic
	async function loadQuizForModule(moduleId: string, startAt = 0) {
		if (!moduleId) {
			quizData = [];
			current = 0;
			return;
		}
		if (moduleQuizCache.has(moduleId)) {
			quizData = moduleQuizCache.get(moduleId);
		} else {
			let url = `/api/module?id=${moduleId}`;
			const res = await fetch(url);
			const data = await res.json();
			const loadedQuizzes = Array.isArray(data.quizzes)
				? data.quizzes.filter((q: any) => q.status !== 'all_false')
				: [];
			moduleQuizCache.set(moduleId, loadedQuizzes);
			quizData = loadedQuizzes;
		}

		current = typeof startAt === 'number' ? Math.max(0, Math.min(startAt, quizData.length - 1)) : 0;
		selectedAnswers = [];
		questionLocked = false;
	}

	function handleAnswerClick(idx: number, questionType: string) {
		if (questionLocked) return;
		if (questionType === 'multiple_answer_question') {
			if (selectedAnswers.includes(idx)) {
				selectedAnswers = selectedAnswers.filter((i) => i !== idx);
			} else {
				selectedAnswers = [...selectedAnswers, idx];
			}
		} else {
			selectedAnswers = [idx];
			checkAnswers();
		}
	}

	function checkAnswers() {
		if (!currentQuestion) return;
		questionLocked = true;
	}

	function goToNextModule() {
		if (!moduleId) return;
		let idx = modules.findIndex((m) => m.value === moduleId);
		const realModules = modules.filter((m) => m.value !== '' && m.value !== 'all');
		let currentRealIdx = realModules.findIndex((m) => m.value === moduleId);
		let nextRealIdx = (currentRealIdx + 1) % realModules.length;
		const nextModuleId = realModules[nextRealIdx].value;
		if (nextModuleId && nextModuleId !== '') {
			moduleId = nextModuleId;
			loadQuizForModule(moduleId, 0);
		} else if (realModules.length > 0) {
			moduleId = realModules[0].value;
			loadQuizForModule(moduleId, 0);
		}
	}

	function goToPreviousModule() {
		if (!moduleId) return;
		const realModules = modules.filter((m) => m.value !== '' && m.value !== 'all');
		let currentRealIdx = realModules.findIndex((m) => m.value === moduleId);
		let prevRealIdx = (currentRealIdx - 1 + realModules.length) % realModules.length;
		const prevModuleId = realModules[prevRealIdx].value;
		if (prevModuleId && prevModuleId !== '') {
			moduleId = prevModuleId;
			loadQuizForModule(moduleId, 0);
		} else if (realModules.length > 0) {
			moduleId = realModules[realModules.length - 1].value;
			loadQuizForModule(moduleId, 0);
		}
	}

	function handleKeyNavigation(e: KeyboardEvent) {
		if (
			document.activeElement &&
			['INPUT', 'SELECT', 'TEXTAREA'].includes((document.activeElement as HTMLElement).tagName)
		)
			return;
		if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
			if (current < quizData.length - 1) {
				current++;
				selectedAnswers = [];
				questionLocked = false;
			} else {
				goToNextModule();
			}
		} else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
			if (current > 0) {
				current--;
				selectedAnswers = [];
				questionLocked = false;
			} else {
				goToPreviousModule();
			}
		}
	}

	let isInitialLoad = true;
	$effect(() => {
		window.addEventListener('keydown', handleKeyNavigation);
		if (isInitialLoad) {
			const initialModule = appState.all.module || modules[0].value; // Default to "Select Module" if no module saved
			moduleId = initialModule;
			loadQuizForModule(moduleId, appState.all.questionIndex);
			isInitialLoad = false;
		}
		return () => window.removeEventListener('keydown', handleKeyNavigation);
	});

	// Auto-save favorites to localStorage when they change
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('favoriteQuestions', JSON.stringify(Array.from(favorites)));
		}
	});

	// Auto-save appState to localStorage when it changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('appState', JSON.stringify(appState));
		}
	});
	// Auto-save current module and question index to appState
	$effect(() => {
		if (typeof window !== 'undefined' && moduleId !== undefined) {
			appState.all.module = moduleId;
			appState.all.questionIndex = current;
		}
	});

	// Responsive sidebar: close on mobile, open on desktop
	$effect(() => {
		if (typeof window === 'undefined') return;
		const mediaQuery = window.matchMedia('(min-width: 768px)');
		const handleResize = () => {
			sidebarOpen = mediaQuery.matches;
		};
		handleResize();
		mediaQuery.addEventListener('change', handleResize);
		return () => mediaQuery.removeEventListener('change', handleResize);
	});
</script>

<!-- Main Layout -->
<div class="flex flex-row min-h-screen min-w-screen w-screen bg-[#1D1B2C] text-[#CECDE0] font-sans">
	<!-- Sidebar -->
	<div
		class="fixed top-0 left-0 h-full z-40 bg-[#29273F] transition-transform duration-200 ease-in-out
			   md:static md:translate-x-0 md:min-w-[200px] md:w-[250px]"
		class:translate-x-[-100%]={!sidebarOpen &&
			typeof window !== 'undefined' &&
			window.innerWidth < 768}
		class:translate-x-0={sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)}
	>
		<Sidebar
			{quizData}
			{current}
			{favorites}
			{sidebarOpen}
			setCurrent={(idx: number) => {
				current = idx;
				selectedAnswers = [];
				questionLocked = false;
				if (typeof window !== 'undefined' && window.innerWidth < 768) {
					sidebarOpen = false;
				}
			}}
			setSidebarOpen={(open: boolean) => (sidebarOpen = open)}
			addFavorite={() => {}}
			removeFavorite={() => {}}
		/>
	</div>

	<!-- Backdrop for mobile -->
	{#if sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768}
		<button
			type="button"
			class="fixed inset-0 bg-black/50 z-30"
			onclick={() => (sidebarOpen = false)}
			aria-label="Close sidebar"
		></button>
	{/if}

	<!-- Hamburger button for mobile sidebar toggle -->
	{#if !sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768}
		<button
			class="hamburger-btn fixed top-4 left-4 z-20 bg-[#C294FF] rounded-lg p-2"
			aria-label="Open sidebar"
			onclick={() => (sidebarOpen = true)}
		>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
		</button>
	{/if}

	<!-- Main Content Wrapper -->
	<div id="main-content-wrapper" class="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
		<!-- Top Bar -->
		<div class="w-full relative z-10">
			{#if typeof window !== 'undefined'}
				<TopBar
					{modules}
					{moduleId}
					{setModuleId}
					{showFavorites}
					{onBackToAll}
					{onClearFavorites}
					{sidebarOpen}
					setSidebarOpen={(open: boolean) => (sidebarOpen = open)}
				/>
			{/if}
		</div>
		<!-- Main Content -->
		<div
			id="main-content"
			class="main-scrollbar flex-1 flex flex-col items-center justify-start overflow-y-auto max-h-full"
		>
			<!-- Question Card -->
			<QuizCard
				{currentQuestion}
				{current}
				{quizData}
				{selectedAnswers}
				{questionLocked}
				{checkAnswers}
				{handleAnswerClick}
				{favorites}
				toggleFavorite={() => {
					if (!currentQuestion) return;
					if (favorites.has(currentQuestion.question_id)) {
						favorites.delete(currentQuestion.question_id);
						favorites = new Set(favorites);
					} else {
						favorites.add(currentQuestion.question_id);
						favorites = new Set(favorites);
					}
				}}
				{answers}
			/>
			<!-- Navigation Tips -->
			<div class="desktop-tip text-[#8582B0] mt-6 text-base hidden md:block">
				Press &#8592; or &#8594; to navigate
			</div>
			<div class="mobile-tip text-[#8582B0] mt-6 text-base block md:hidden">
				Swipe left or right to navigate
			</div>
		</div>
	</div>
	<!-- Floating Favorites ID Button and Modal -->
	<button
		id="fav-id-fab"
		class="fav-id-fab fixed bottom-6 right-6 z-[1000] bg-[#6c63ff] text-white rounded-full w-14 h-14 shadow-lg text-2xl flex items-center justify-center hover:bg-[#574fd6]"
		onclick={() => (showFavModal = true)}
	>
		★
	</button>
	<FavoritesModal
		{showFavModal}
		{favIdList}
		closeModal={() => (showFavModal = false)}
		importFavorites={(ids: string) => {
			const newIds = ids
				.split(',')
				.map((id) => id.trim())
				.filter(Boolean);
			favorites = new Set([...Array.from(favorites), ...newIds]);
		}}
	/>
</div>
