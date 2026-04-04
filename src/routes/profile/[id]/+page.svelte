<script lang="ts">
	import MemberSearch from '$lib/components/MemberSearch.svelte';

	let { data } = $props();
	let member = $derived(data.member);

	type FamilyRef = {
		relation: string;
		name?: string;
		image?: string;
		id?: string;
	};

	function resolveFamilyMember(fam: FamilyRef) {
		if (fam.id) {
			const byId = data.members.find((m) => m.id === fam.id);
			if (byId) return byId;
		}

		if (!fam.name) return null;

		const targetName = fam.name.trim().toLowerCase();
		return data.members.find((m) => m.name.trim().toLowerCase() === targetName) || null;
	}
</script>

<!-- Main Content Canvas -->

<!-- TopNavBar Anchor -->
<header
	class="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-white/70 backdrop-blur-xl flex justify-between items-center h-16 pl-16 pr-4 md:px-8 border-b border-slate-100/10"
>
	<div class="flex items-center gap-2 md:gap-4 truncate">
		<span class="text-lg md:text-xl font-black text-emerald-900 tracking-tight truncate min-w-0" title="The Living Archive">The Living Archive</span>
		<span class="hidden md:block h-4 w-[1px] bg-outline-variant/30"></span>
		<nav class="hidden md:flex gap-6 text-sm font-medium">
			<a class="text-slate-600 hover:text-amber-600 transition-colors" href="/tree">Directory</a>
			<a class="text-emerald-900 font-bold" href="/profile/{member.id}">Member Profile</a>
		</nav>
	</div>
	<div class="flex items-center justify-end gap-6 flex-1 md:flex-none max-w-[200px] md:max-w-none">
		<MemberSearch
			placeholder="Search..."
			wrapperClass="relative w-full md:w-64"
			inputClass="bg-surface-container-low border-none rounded-full py-1.5 pl-10 pr-4 text-sm w-full focus:ring-2 focus:ring-primary/10 transition-all"
			iconClass="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
		/>
	</div>
</header>

<!-- Profile Content -->
<div class="pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto">
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
		<!-- Left Column: Identity Card -->
		<div class="col-span-1 lg:col-span-4 space-y-8">
			<div
				class="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(25,28,29,0.04)] lg:sticky lg:top-24"
			>
				<div class="aspect-square w-full rounded-2xl overflow-hidden mb-8 relative group">
					<img
						class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
						src={member.image}
						alt="Portrait of {member.name}"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
					>
						<span class="text-white text-xs font-medium tracking-widest uppercase"
							>Member Since {member.memberSince}</span
						>
					</div>
				</div>

				<div class="space-y-4">
					<div>
						<h1 class="text-4xl font-extrabold text-primary tracking-tighter leading-none">
							{member.name}
						</h1>
						<div
							class="inline-flex items-center mt-3 px-3 py-1 bg-tertiary-fixed/30 text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full"
						>
							{member.generation}
						</div>
					</div>

					<p class="text-secondary text-sm leading-relaxed font-light">
						{member.description}
					</p>

					<div class="pt-6 space-y-4 border-t border-outline-variant/20">
						<div class="flex items-center gap-4">
							<div
								class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary"
							>
								<span class="material-symbols-outlined" data-icon="cake">cake</span>
							</div>
							<div>
								<p class="text-[10px] text-secondary font-bold uppercase tracking-wider">Born</p>
								<p class="text-sm font-semibold">{member.born}</p>
							</div>
						</div>

						<div class="flex items-center gap-4">
							<div
								class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary"
							>
								<span class="material-symbols-outlined" data-icon="architecture">architecture</span>
							</div>
							<div>
								<p class="text-[10px] text-secondary font-bold uppercase tracking-wider">
									Occupation
								</p>
								<p class="text-sm font-semibold">{member.occupation}</p>
							</div>
						</div>

						<div class="flex items-center gap-4">
							<div
								class="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary"
							>
								<span class="material-symbols-outlined" data-icon="location_on">location_on</span>
							</div>
							<div>
								<p class="text-[10px] text-secondary font-bold uppercase tracking-wider">
									Current Residence
								</p>
								<p class="text-sm font-semibold">{member.residence}</p>
							</div>
						</div>
					</div>

					<div class="pt-6">
						<button
							class="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 md:py-4 rounded-xl font-bold shadow-lg shadow-primary/10 hover:-translate-y-0.5 transition-transform duration-300"
						>
							Download Biography
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Right Column: Timeline, Family & Gallery -->
		<div class="col-span-1 lg:col-span-8 space-y-12">
			<!-- Life Timeline -->
			<section>
				<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
					<h2 class="text-[22px] md:text-2xl font-black text-primary tracking-tight flex items-center gap-3">
						<span class="w-6 md:w-8 h-[2px] bg-tertiary-fixed"></span>
						Life Timeline
					</h2>
					<button
						class="text-primary text-xs font-bold uppercase tracking-widest hover:text-tertiary transition-colors flex w-fit items-center gap-2"
					>
						View Full Journey <span
							class="material-symbols-outlined text-sm"
							data-icon="arrow_forward">arrow_forward</span
						>
					</button>
				</div>

				<div class="relative ml-[14px] md:ml-4 pl-8 md:pl-12 border-l-2 border-emerald-900/10 space-y-10 md:space-y-12">
					{#each member.timeline as event}
						<div class="relative">
							<div
								class="absolute -left-[41px] md:-left-[57px] top-0 w-8 h-8 md:w-11 md:h-11 bg-white rounded-full border-4 border-emerald-900 flex items-center justify-center text-emerald-900 shadow-xl"
							>
								<span class="material-symbols-outlined text-base md:text-lg">{event.icon}</span>
							</div>
							<div class="space-y-1">
								<span class="text-[10px] md:text-xs font-bold text-emerald-900 uppercase tracking-widest"
									>{event.year}</span
								>
								<h3 class="text-base md:text-lg font-bold">{event.title}</h3>
								<p class="text-secondary text-sm max-w-lg leading-relaxed">{event.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- Immediate Family -->
			<section>
				<h2 class="text-[22px] md:text-2xl font-black text-primary tracking-tight mb-6 md:mb-8 flex items-center gap-3">
					<span class="w-6 md:w-8 h-[2px] bg-tertiary-fixed"></span>
					Immediate Family
				</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each member.family as fam}
						{@const fMember = resolveFamilyMember(fam)}
						{#if fMember}
							<a
								href="/profile/{fMember.id}"
								class="group cursor-pointer bg-surface-container-low p-4 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-md block"
							>
								<div
									class="w-12 h-12 rounded-full overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all duration-500"
								>
									<img
										class="w-full h-full object-cover"
										src={fMember.image}
										alt="{fMember.name} photo"
									/>
								</div>
								<p class="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">
									{fam.relation}
								</p>
								<p class="text-sm font-bold text-primary group-hover:text-emerald-700">
									{fMember.name}
								</p>
							</a>
						{:else}
							<div
								class="bg-surface-container-low p-4 rounded-2xl"
							>
								<div class="w-12 h-12 rounded-full mb-3 bg-surface-container-high flex items-center justify-center text-outline">
									<span class="material-symbols-outlined text-base" data-icon="person">person</span>
								</div>
								<p class="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">
									{fam.relation}
								</p>
								<p class="text-sm font-bold text-primary">Unknown member</p>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		</div>
	</div>
</div>
