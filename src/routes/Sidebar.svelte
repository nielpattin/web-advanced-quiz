<script lang="ts">
	type SidebarProps = {
		quizData: { question_id: string }[];
		current: number;
		favorites: Set<string>;
		setCurrent: (idx: number) => void;
		sidebarOpen: boolean;
		setSidebarOpen: (open: boolean) => void;
		addFavorite: (id: string) => void;
		removeFavorite: (id: string) => void;
	};

	const {
		quizData,
		current,
		favorites,
		setCurrent,
		sidebarOpen,
		setSidebarOpen,
		addFavorite,
		removeFavorite
	} = $props();

	// Remove debounce so scroll happens immediately on every current change
	$effect(() => {
		const btns = document.querySelectorAll('.sidebar-btn');
		const btn = btns[current] as HTMLElement | undefined;
		const sidebar = btn?.closest('.sidebar') as HTMLElement | null;
		if (btn && sidebar) {
			if (document.activeElement !== btn) btn.focus();
			if (document.activeElement !== btn) btn.focus();
			btn.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
		}
	});
</script>

<!-- Sidebar Navigation -->
<div
	class="sidebar flex flex-col gap-2 h-screen max-h-screen overflow-y-auto overflow-x-hidden bg-[#29273F] min-w-[200px] w-[250px]"
>
	{#each quizData as q, idx}
		<button
			style="outline: none; box-shadow: none;"
			class="sidebar-btn flex items-center justify-between px-6 py-2 rounded-lg text-base outline-none {idx ===
			current
				? 'bg-[#C294FF] text-[#222] font-bold'
				: 'hover:bg-[#8582B0]'}"
			onclick={() => {
				setCurrent(idx);
				if (typeof window !== 'undefined' && window.innerWidth < 900) {
					setSidebarOpen(false);
				}
				setTimeout(() => {
					const btns = document.querySelectorAll('.sidebar-btn');
					const btn = btns[idx] as HTMLElement | undefined;
					const sidebar = btn?.closest('.sidebar') as HTMLElement | null;
					if (btn && sidebar) {
						btn.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
					}
				}, 0);
			}}
			aria-label={'Go to question ' + (idx + 1)}
		>
			<span>Question {idx + 1}</span>
			{#if favorites.has(q.question_id)}
				<!-- Sidebar: Favorite Star -->
				<span class="ml-2 flex-shrink-0 flex items-center justify-end w-6">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="#FFD700"
						stroke="#FFD700"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><polygon
							points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
						></polygon></svg
					>
				</span>
			{/if}
		</button>
	{/each}
</div>
