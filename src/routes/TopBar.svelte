<script lang="ts">
	// TopBar component for module selection and favorites
	export let modules: { value: string; label: string }[] = [];
	export let moduleId: string;
	export let setModuleId: (id: string) => void;
	// current, favorites, quizData, setQuizData, setCurrent, appState, setAppState are for external reference only, not used internally
	export let showFavorites: () => void;
</script>

<!-- Top Bar -->
<div
	class="top-bar flex flex-row items-center justify-center py-4 flex-shrink-0 flex-wrap bg-[#29273F] z-20"
>
	<!-- Module Selector -->
	<select
		bind:value={moduleId}
		on:change={() => setModuleId(moduleId)}
		class="rounded-md px-3 py-2 bg-[#29273F] text-[#CECDE0] border border-[#33314E] mr-2"
	>
		{#each modules as mod}
			<option value={mod.value}>{mod.label}</option>
		{/each}
	</select>
	<!-- Favorites Button -->
	<button
		id="favorites-btn"
		class="ml-3 rounded-md px-3 py-2 bg-[#C294FF] text-[#1D1B2C] font-semibold"
		on:click={showFavorites}
	>
		Favorites
	</button>
	<!-- Other top bar controls (hidden for now) -->
	<button id="show-all-btn" class="ml-3 rounded-md px-3 py-2 bg-[#8582B0] text-[#CECDE0] hidden"
		>Show All</button
	>
	<span id="favorites-label" class="ml-3 text-lg hidden"></span>
	<button id="back-to-all-btn" class="ml-3 rounded-md px-3 py-2 bg-[#8582B0] text-[#CECDE0] hidden"
		>Back to All Modules</button
	>
	<button
		id="clear-favorites-btn"
		class="ml-3 rounded-md px-3 py-2 bg-[#8582B0] text-[#CECDE0] hidden">Clear Favorites</button
	>
</div>
