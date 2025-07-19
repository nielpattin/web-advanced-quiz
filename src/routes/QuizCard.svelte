<script lang="ts">
	interface Props {
		// QuizCard component for displaying the current question and answers
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
</script>

<!-- Quiz Card -->
<div
	class="quiz-card bg-[#29273F] text-[#CECDE0] rounded-2xl shadow-lg w-[90%] max-w-[90vw] px-4 pt-16 relative flex flex-col gap-2 mt-8"
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
