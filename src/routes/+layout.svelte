<script>
	import '../app.css';
	import { page } from '$app/stores';

	let navItems = [
		{ name: 'Home', href: '/', icon: 'home' },
		{ name: 'Tree', href: '/tree', icon: 'account_tree' },
		{ name: 'Calendar', href: '/calendar', icon: 'calendar_today' },
		{ name: 'Gallery', href: '/gallery', icon: 'photo_library' },
	];

	let isMobileMenuOpen = $state(false);
</script>

<div class="flex flex-col md:flex-row min-h-screen">
	<!-- Mobile Menu Hamburger Button -->
	<button
		class="md:hidden fixed top-3 left-4 z-[60] w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-emerald-900 dark:text-emerald-100 transition-colors"
		onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
		aria-label="Toggle menu"
	>
		<span class="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
	</button>

	<!-- Backdrop -->
	{#if isMobileMenuOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
			onclick={() => (isMobileMenuOpen = false)}
		></div>
	{/if}

	<aside class="flex w-64 fixed left-0 top-0 h-screen flex-col py-8 px-4 font-['Manrope'] text-sm tracking-tight z-50 transition-transform duration-300 ease-in-out {isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 backdrop-blur-xl bg-slate-50/95 dark:bg-slate-900/95 border-r border-slate-200/50 dark:border-slate-800/50">
		<div class="mb-10 px-2 mt-4 md:mt-0">
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-tertiary-fixed">
					<span class="material-symbols-outlined text-2xl" data-icon="account_tree">account_tree</span>
				</div>
				<div>
					<h1 class="text-2xl font-bold text-emerald-950 dark:text-emerald-100 tracking-tighter">The Living Archive</h1>
					<p class="text-[10px] uppercase tracking-widest text-secondary font-bold opacity-60">Curating Heritage</p>
				</div>
			</div>
		</div>

		<nav class="flex-1 space-y-2">
			{#each navItems as item}
				<a
					href={item.href}
					onclick={() => (isMobileMenuOpen = false)}
					class="flex items-center gap-3 px-4 py-3 transition-all duration-300
						{$page.url.pathname === item.href
							? 'rounded-xl md:rounded-l-xl md:rounded-r-none border-l-4 border-amber-400 text-emerald-900 dark:text-emerald-100 font-bold bg-white/50 dark:bg-white/5 shadow-sm md:shadow-none'
							: 'rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'}"
				>
					<span class="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
					<span>{item.name}</span>
				</a>
			{/each}
		</nav>

		<div class="mt-auto space-y-2 pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
			<a onclick={() => (isMobileMenuOpen = false)} class="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-emerald-800 transition-colors" href="/settings">
				<span class="material-symbols-outlined" data-icon="settings">settings</span>
				<span>Settings</span>
			</a>
			<a onclick={() => (isMobileMenuOpen = false)} class="flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-emerald-800 transition-colors" href="/support">
				<span class="material-symbols-outlined" data-icon="help">help</span>
				<span>Support</span>
			</a>
		</div>
	</aside>

	<!-- svelte-ignore slot_element_deprecated -->
	<main class="w-full md:w-[calc(100%-16rem)] md:ml-64 pt-16 pb-12 flex-1 min-h-screen relative bg-[var(--surface-color)] dark:bg-[var(--surface-color-dark)] bg-surface-container-low">
		<!-- TopNavBar (Shared Component) -->
		
		<slot />
	</main>
</div>
