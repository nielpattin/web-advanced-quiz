<script lang="ts">
  // QuizCard component for displaying the current question and answers
  export let currentQuestion: any;
  export let current: number;
  export let quizData: any[];
  export let selectedAnswers: number[];
  // setSelectedAnswers is for external reference only, not used internally
  export let questionLocked: boolean;
  export let checkAnswers: () => void;
  export let handleAnswerClick: (idx: number, questionType: string) => void;
  export let favorites: Set<string>;
  export let toggleFavorite: () => void;
  export let answers: any[];
</script>

<!-- Quiz Card -->
<div class="quiz-card bg-[#29273F] text-[#CECDE0] rounded-2xl shadow-lg w-[90%] max-w-[90vw] p-12 pt-16 relative flex flex-col gap-8 mt-8">
  <!-- Question Index -->
  <span class="block mb-2 text-[#8582B0] text-base">
    {#if quizData.length}
      Question {current + 1} / {quizData.length}
    {/if}
  </span>
  <!-- Favorite Button (top right) -->
  <div id="favorite-btn" class="absolute top-5 right-5 cursor-pointer">
    <svg class="star-icon" id="star-outline" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: {favorites.has(currentQuestion?.question_id) ? 'none' : 'block'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    <svg class="star-icon" id="star-filled" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: {favorites.has(currentQuestion?.question_id) ? 'block' : 'none'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    <button aria-label="Toggle favorite" class="absolute inset-0 w-full h-full cursor-pointer bg-transparent border-none" on:click={toggleFavorite}></button>
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
          class="answer px-5 py-3 rounded-lg border-2 border-[#33314E] bg-[#302E4A] text-lg text-[#CECDE0] cursor-pointer transition-colors
            {selectedAnswers.includes(idx) ? 'border-[#C294FF]' : ''}
            {questionLocked && currentQuestion.answers[idx]?.is_correct ? 'border-green-400 text-green-300' : ''}
            {questionLocked && selectedAnswers.includes(idx) && !currentQuestion.answers[idx]?.is_correct ? 'border-[#FF4747] text-[#FF4747]' : ''}"
          on:click={() => handleAnswerClick(idx, currentQuestion.question_type)}
          aria-pressed={selectedAnswers.includes(idx)}
          aria-label={"Answer " + (idx + 1)}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAnswerClick(idx, currentQuestion.question_type); }}
        >
          {ans.answer_text || ans}
        </button>
      {/each}
    {/if}
  </div>
  <!-- Check Button -->
  <button
    id="check-btn"
    class="mt-2 px-6 py-3 rounded-lg bg-[#C294FF] text-[#1D1B2C] font-semibold text-lg"
    on:click={checkAnswers}
    style="display: {selectedAnswers.length > 0 && !questionLocked ? 'block' : 'none'}"
  >
    Check
  </button>
</div>