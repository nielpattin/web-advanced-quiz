<script lang="ts">
	import { page } from '$app/state';

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

	let selectEl: HTMLSelectElement;

	let favoritesMode = $state(false);
	$effect(() => {
		favoritesMode = page.url.pathname.startsWith('/favorites');
	});

	function handleSelectMousedown(e: MouseEvent) {
		if (document.activeElement === selectEl) {
			e.preventDefault();
			selectEl.blur();
		}
	}

	function handleFavoritesClick() {
		showFavorites();
	}
	function handleBackClick() {
		onBackToAll && onBackToAll();
	}
	function handleClearFavorites() {
		onClearFavorites && onClearFavorites();
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
	<!-- Hamburger button for mobile sidebar toggle -->
	{#if typeof window !== 'undefined' && window.innerWidth < 768 && !sidebarOpen}
		<button
			class="hamburger-btn mr-4 bg-[#C294FF] rounded-lg p-2"
			aria-label="Open sidebar"
			onclick={() => setSidebarOpen(true)}
		>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
			<span class="block w-6 h-[3px] bg-[#222] my-1"></span>
		</button>
	{/if}
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
			class="ml-3 rounded-md px-3 py-2 bg-[#C294FF] text-[#1D1B2C] font-semibold"
			onclick={handleBackClick}
		>
			Go Back
		</button>
		<button
			id="clear-favorites-btn"
			class="ml-3 rounded-md px-3 py-2 bg-[#C294FF] text-[#1D1B2C] font-semibold mt-2 md:mt-0"
			onclick={handleClearFavorites}
		>
			Clear All Favorites
		</button>
	{/if}
</div>
