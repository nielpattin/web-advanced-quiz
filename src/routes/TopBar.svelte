<script lang="ts">
	interface Props {
		// TopBar component for module selection and favorites
		modules?: { value: string; label: string }[];
		moduleId: string;
		setModuleId: (id: string) => void;
		showFavorites: () => void;
		onBackToAll: () => void;
		onClearFavorites: () => void;
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
	}

	let {
		modules = [],
		moduleId = $bindable(),
		setModuleId,
		showFavorites,
		onBackToAll,
		onClearFavorites,
		sidebarOpen,
		setSidebarOpen
	}: Props = $props();

	let favoritesMode = $state(false);
	let selectEl: HTMLSelectElement;

	function handleSelectMousedown(e: MouseEvent) {
		if (document.activeElement === selectEl) {
			e.preventDefault();
			selectEl.blur();
		}
	}

	function handleFavoritesClick() {
		showFavorites();
		favoritesMode = true;
	}
	function handleBackClick() {
		favoritesMode = false;
		onBackToAll && onBackToAll();
	}
	function handleClearFavorites() {
		onClearFavorites && onClearFavorites();
		favoritesMode = false;
	}

	// Override a/d keys on select to always trigger navigation
	function handleSelectKeydown(e: KeyboardEvent) {
		if (e.key === 'a' || e.key === 'A') {
			e.preventDefault();
			const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
			document.activeElement && (document.activeElement as HTMLElement).blur();
			window.dispatchEvent(event);
		}
		if (e.key === 'd' || e.key === 'D') {
			e.preventDefault();
			const event = new KeyboardEvent('keydown', { key: 'd', bubbles: true });
			document.activeElement && (document.activeElement as HTMLElement).blur();
			window.dispatchEvent(event);
		}
	}
</script>

<!-- Top Bar -->
<div
	class="top-bar flex flex-row items-center justify-center py-4 flex-shrink-0 flex-wrap bg-[#29273F]"
>
	<!-- Module Selector -->
	<select
		bind:value={moduleId}
		bind:this={selectEl}
		onmousedown={handleSelectMousedown}
		oninput={(e) => {
			setModuleId((e.target as HTMLSelectElement).value);
			setTimeout(() => selectEl.blur(), 0);
		}}
		class="rounded-md px-3 py-2 bg-[#29273F] text-[#CECDE0] border border-[#33314E] mr-2 ml-0 md:ml-0 focus:outline-none focus:ring-0"
	>
		{#each modules as mod}
			<option value={mod.value}>{mod.label}</option>
		{/each}
		on:keydown={handleSelectKeydown}
		></select
	>
	<!-- Favorites Button -->
	{#if !favoritesMode && typeof showFavorites === 'function' && showFavorites.toString() !== '() => {}'}
		<button
			id="favorites-btn"
			class="ml-3 rounded-md px-3 py-2 bg-[#C294FF] text-[#1D1B2C] font-semibold"
			onclick={handleFavoritesClick}
		>
			Favorites
		</button>
	{/if}
	{#if favoritesMode || typeof showFavorites !== 'function' || showFavorites.toString() === '() => {}'}
		<button
			id="back-to-all-btn"
			class="ml-3 rounded-md px-3 py-2 bg-[#8582B0] text-[#CECDE0]"
			onclick={handleBackClick}
		>
			Go Back
		</button>
		<button
			id="clear-favorites-btn"
			class="ml-3 rounded-md px-3 py-2 bg-[#8582B0] text-[#CECDE0]"
			onclick={handleClearFavorites}
		>
			Clear All Favorites
		</button>
	{/if}
</div>
