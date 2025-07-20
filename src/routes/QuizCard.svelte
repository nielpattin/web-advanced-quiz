<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		currentQuestion: any;
		current: number;
		quizData: any[];
		selectedAnswers: number[];
		questionLocked: boolean;
		checkAnswers: () => void;
		handleAnswerClick: (idx: number, questionType: string) => void;
		favorites: Set<string>;
		toggleFavorite: () => void;
		answers: any[];
	}

	let {
		currentQuestion,
		current,
		quizData,
		selectedAnswers,
		questionLocked,
		checkAnswers,
		handleAnswerClick,
		favorites,
		toggleFavorite,
		answers
	}: Props = $props();

	const dispatch = createEventDispatcher();

	let startX = 0;
	let startY = 0;
	let currentX = 0;
	let currentY = 0;
	let translateX = $state(0);
	let animating = $state(false);
	let animationDirection = $state<'left' | 'right' | null>(null);
	let isHorizontalSwipe = false;

	function handleTouchStart(e: TouchEvent) {
		if (animating) return;
		if (e.touches.length !== 1) return;
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
		currentX = startX;
		currentY = startY;
		isHorizontalSwipe = false;
	}

	function handleTouchMove(e: TouchEvent) {
		if (animating) return;
		if (e.touches.length !== 1) return;
		currentX = e.touches[0].clientX;
		currentY = e.touches[0].clientY;

		const deltaX = currentX - startX;
		const deltaY = currentY - startY;

		// Determine swipe direction and prevent interference with vertical scrolling
		if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
			isHorizontalSwipe = true;
		}

		// Only allow horizontal swipe on mobile width and when it's a horizontal swipe
		if (window.innerWidth < 768 && isHorizontalSwipe) {
			e.preventDefault(); // Prevent vertical scrolling during horizontal swipe
			translateX = deltaX;
		}
	}

	function handleTouchEnd() {
		if (animating) return;
		const deltaX = currentX - startX;
		const threshold = 60; // px

		if (window.innerWidth < 768 && isHorizontalSwipe) {
			if (deltaX < -threshold) {
				// Swipe left
				animationDirection = 'left';
				translateX = -window.innerWidth * 0.7;
				animating = true;
				setTimeout(() => {
					dispatch('swipeLeft');
					translateX = 0;
					animationDirection = null;
					animating = false;
				}, 200);
			} else if (deltaX > threshold) {
				// Swipe right
				animationDirection = 'right';
				translateX = window.innerWidth * 0.7;
				animating = true;
				setTimeout(() => {
					dispatch('swipeRight');
					translateX = 0;
					animationDirection = null;
					animating = false;
				}, 200);
			} else {
				// Snap back
				translateX = 0;
			}
		}
		isHorizontalSwipe = false;
	}
</script>

<!-- Quiz Card -->
<div
	class="quiz-card bg-[#29273F] text-[#CECDE0] rounded-2xl shadow-lg w-[90%] max-w-[90vw] px-4 pt-16 relative flex flex-col gap-2 mt-8 touch-pan-y select-none"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	style="transform: translateX({translateX}px); transition: {animating || animationDirection
		? 'transform 0.2s cubic-bezier(0.4,0,0.2,1)'
		: 'none'};"
>
	<!-- Question number and Favorite Button row -->
	<div class="flex items-center justify-between mb-2">
		<span class="text-[#8582B0] text-base">
			{#if quizData.length}
				Question {current + 1} / {quizData.length}
			{/if}
		</span>
		<!-- This is the favorite button -->
		<button
			aria-label="Toggle favorite"
			class="w-10 h-10 bg-transparent border-none p-0 flex items-center justify-center"
			onclick={toggleFavorite}
		>
			{#if favorites.has(currentQuestion?.question_id)}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="#FFD700"
					stroke="#FFD700"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon
						points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
					></polygon>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polygon
						points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
					></polygon>
				</svg>
			{/if}
		</button>
	</div>
	<!-- Question Text -->
	<div class="question-row font-semibold text-lg mb-4">
		{#if currentQuestion}
			{currentQuestion.question_text || currentQuestion.question || ''}
		{:else}
			{quizData.length === 0 ? 'Please select a module to begin.' : ''}
		{/if}
	</div>
	<!-- Answers List -->
	<div class="answers-row flex flex-col gap-4 mb-4">
		{#if currentQuestion}
			{#each answers as ans, idx}
				<button
					type="button"
					class="answer px-5 py-3 rounded-lg border-2 border-[#33314E] bg-[#302E4A] text-lg text-[#CECDE0] cursor-pointer transition-colors text-left
					       {selectedAnswers.includes(idx) ? 'border-[#C294FF]' : ''}
					       {questionLocked && currentQuestion.answers[idx]?.is_correct
						? 'border-green-400 text-green-300'
						: ''}
					       {questionLocked && selectedAnswers.includes(idx) && !currentQuestion.answers[idx]?.is_correct
						? 'border-[#FF4747] text-[#FF4747]'
						: ''}"
					onclick={() => handleAnswerClick(idx, currentQuestion.question_type)}
					aria-pressed={selectedAnswers.includes(idx)}
					aria-label={'Answer ' + (idx + 1)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ')
							handleAnswerClick(idx, currentQuestion.question_type);
					}}
				>
					{ans.answer_text || ans}
				</button>
			{/each}
		{/if}
	</div>
	<!-- Check Button -->
	<div class="flex justify-end">
		<button
			id="check-btn"
			class="mt-2 px-6 py-3 rounded-lg bg-[#C294FF] text-[#1D1B2C] font-semibold text-lg"
			onclick={checkAnswers}
			style="display: {selectedAnswers.length > 0 && !questionLocked ? 'block' : 'none'}"
		>
			Check
		</button>
	</div>
</div>
