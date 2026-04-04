<script lang="ts">
	import { goto } from '$app/navigation';
	import members from '$lib/data/members.json';

	type Member = {
		id: string;
		name: string;
		generation: string;
		image?: string;
	};

	type Props = {
		placeholder?: string;
		wrapperClass?: string;
		inputClass?: string;
		iconClass?: string;
		dropdownClass?: string;
		emptyLabel?: string;
		maxResults?: number;
	};

	let {
		placeholder = 'Search members...',
		wrapperClass = 'relative w-64',
		inputClass =
			'pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm focus:ring-1 focus:ring-tertiary w-full',
		iconClass = 'material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg',
		dropdownClass =
			'absolute top-[calc(100%+0.5rem)] left-0 right-0 z-[70] max-h-80 overflow-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-2xl',
		emptyLabel = 'Member tidak ditemukan',
		maxResults = 8
	}: Props = $props();

	const allMembers = members as Member[];
	let wrapperElement: HTMLDivElement | null = null;
	let query = $state('');
	let isFocused = $state(false);
	let keepDropdownOpenOnBlur = false;
	let dropdownTapTimer: ReturnType<typeof setTimeout> | null = null;

	const normalizedQuery = $derived(query.trim().toLowerCase());
	const results = $derived(
		normalizedQuery.length === 0
			? []
			: allMembers
					.filter((member) => member.name.toLowerCase().includes(normalizedQuery))
					.slice(0, maxResults)
	);
	const shouldShowDropdown = $derived(isFocused && normalizedQuery.length > 0);

	function handleFocusOut(event: FocusEvent) {
		const nextTarget = event.relatedTarget as Node | null;
		if (nextTarget && wrapperElement?.contains(nextTarget)) return;
		if (keepDropdownOpenOnBlur) return;
		isFocused = false;
	}

	function markDropdownInteraction() {
		keepDropdownOpenOnBlur = true;
		if (dropdownTapTimer) {
			clearTimeout(dropdownTapTimer);
		}
		dropdownTapTimer = setTimeout(() => {
			keepDropdownOpenOnBlur = false;
			dropdownTapTimer = null;
		}, 180);
	}

	async function openMember(memberId: string) {
		keepDropdownOpenOnBlur = false;
		if (dropdownTapTimer) {
			clearTimeout(dropdownTapTimer);
			dropdownTapTimer = null;
		}
		query = '';
		isFocused = false;
		await goto(`/profile/${memberId}`);
	}

	async function handleInputKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' || results.length === 0) return;
		event.preventDefault();
		await openMember(results[0].id);
	}
</script>

<div bind:this={wrapperElement} class={wrapperClass} onfocusout={handleFocusOut}>
	<span class={iconClass} data-icon="search">search</span>
	<input
		class={inputClass}
		placeholder={placeholder}
		type="text"
		bind:value={query}
		onfocus={() => (isFocused = true)}
		oninput={() => (isFocused = true)}
		onkeydown={handleInputKeydown}
		autocomplete="off"
	/>

	{#if shouldShowDropdown}
		<div class={dropdownClass}>
			{#if results.length > 0}
				<ul class="py-2">
					{#each results as member}
						<li>
							<button
								type="button"
								class="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-container-low"
								onpointerdown={markDropdownInteraction}
								onmousedown={markDropdownInteraction}
								ontouchstart={markDropdownInteraction}
								onclick={() => openMember(member.id)}
							>
								<img
									src={member.image}
									alt={`Foto ${member.name}`}
									class="h-10 w-10 rounded-full border border-outline-variant/30 object-cover"
								/>
								<div class="min-w-0">
									<p class="truncate text-sm font-semibold text-primary">{member.name}</p>
									<p class="truncate text-xs text-secondary">{member.generation}</p>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="px-4 py-3 text-sm text-secondary">{emptyLabel}</p>
			{/if}
		</div>
	{/if}
</div>
