<script lang="ts">
	import members from '$lib/data/members.json';
	import { onMount } from 'svelte';

	type Member = {
		id: string;
		name: string;
		generation: string;
		born?: string;
		residence?: string;
		occupation?: string;
		image?: string;
		family?: Array<{ relation: string; id: string }>;
	};

	type Couple = {
		person1: Member;
		person2: Member | null;
		children: Member[];
	};

	type Branch = {
		parents: Member[];
		couples: Couple[];
	};

	const allMembers = members as Member[];

	const generation1 = allMembers.filter((member) => member.generation.startsWith('1st'));
	const generation2 = allMembers.filter((member) => member.generation.startsWith('2nd'));
	const generation3 = allMembers.filter((member) => member.generation.startsWith('3rd'));
	const generation4 = allMembers.filter((member) => member.generation.startsWith('4th'));

	function createSecondGenGroups() {
		const groups: Member[][] = [];
		const processedIds = new Set<string>();

		for (const member of generation2) {
			if (processedIds.has(member.id)) continue;

			const directSpouseId = member.family?.find((relation) => relation.relation === 'Spouse')?.id;
			const directSpouse = directSpouseId
				? generation2.find((candidate) => candidate.id === directSpouseId)
				: undefined;
			const reverseSpouse = generation2.find((candidate) =>
				candidate.family?.some(
					(relation) => relation.relation === 'Spouse' && relation.id === member.id
				)
			);
			const spouse = directSpouse || reverseSpouse;

			if (spouse && !processedIds.has(spouse.id)) {
				groups.push([member, spouse]);
				processedIds.add(member.id);
				processedIds.add(spouse.id);
				continue;
			}

			groups.push([member]);
			processedIds.add(member.id);
		}

		return groups;
	}

	const secondGenGroups = createSecondGenGroups();

	// Create couples from generation 3
	function createCouples(): Couple[] {
		const couples: Couple[] = [];
		const processedIds = new Set<string>();

		for (const member of generation3) {
			if (processedIds.has(member.id)) continue;

			const spouseRel = member.family?.find((f) => f.relation === 'Spouse');
			if (!spouseRel) {
				// Single person (no spouse)
				const children = generation4.filter((child) =>
					child.family?.some((f) => f.id === member.id && (f.relation === 'Father' || f.relation === 'Mother'))
				);
				couples.push({ person1: member, person2: null, children });
				processedIds.add(member.id);
			} else {
				const spouse = allMembers.find((m) => m.id === spouseRel.id);
				if (spouse && !processedIds.has(spouse.id)) {
					const children = generation4.filter((child) =>
						child.family?.some((f) => (f.id === member.id || f.id === spouse.id) && (f.relation.includes('Father') || f.relation.includes('Mother')))
					);
					couples.push({ person1: member, person2: spouse, children });
					processedIds.add(member.id);
					processedIds.add(spouse.id);
				}
			}
		}

		const partnered = couples
			.filter((couple) => couple.person2)
			.sort((a, b) => Number(a.person1.id) - Number(b.person1.id));
		const single = couples
			.filter((couple) => !couple.person2)
			.sort((a, b) => Number(a.person1.id) - Number(b.person1.id));

		return [...partnered, ...single];
	}

	const couples = createCouples();

	function memberBelongsToBranch(member: Member, parentIds: Set<string>) {
		return (
			member.family?.some(
				(f) => (f.relation === 'Father' || f.relation === 'Mother') && parentIds.has(f.id)
			) || false
		);
	}

	function createBranches(): Branch[] {
		return secondGenGroups.map((parents) => {
			const parentIds = new Set(parents.map((parent) => parent.id));
			const branchCouples = couples.filter((couple) => {
				const matchPerson1 = memberBelongsToBranch(couple.person1, parentIds);
				const matchPerson2 = couple.person2
					? memberBelongsToBranch(couple.person2, parentIds)
					: false;
				return matchPerson1 || matchPerson2;
			});

			return {
				parents,
				couples: branchCouples
			};
		});
	}

	const branches = createBranches();

	const COUPLE_GAP_DESKTOP_PX = 80;
	const COUPLE_GAP_MOBILE_PX = 48;
	const BRANCH_GAP_DESKTOP_PX = 80;
	const BRANCH_GAP_MOBILE_PX = 48;
	const MIN_ZOOM_DESKTOP = 0.6;
	const MIN_ZOOM_MOBILE = 0.35;
	const MAX_ZOOM = 2;
	const ZOOM_STEP = 0.1;
	const INITIAL_ZOOM_DESKTOP = MIN_ZOOM_DESKTOP;
	const INITIAL_ZOOM_MOBILE = 0.42;
	const ROOT_CONNECTOR_LEFT_TRIM_PX = 620;
	const ROOT_CONNECTOR_RIGHT_TRIM_PX = 260;

	let isMobileViewport = $state(false);
	let supportsCssZoom = $state(true);
	let hasInitializedZoom = false;
	let zoomLevel = $state(INITIAL_ZOOM_DESKTOP);
	let treeViewport: HTMLDivElement | null = null;
	const zoomLayerStyle = $derived(
		supportsCssZoom
			? `zoom: ${zoomLevel};`
			: `transform: scale(${zoomLevel}); transform-origin: top left;`
	);

	function centerTreeViewport() {
		if (!treeViewport) return;

		treeViewport.scrollTop = 0;
		treeViewport.scrollLeft = Math.max(
			0,
			Math.round((treeViewport.scrollWidth - treeViewport.clientWidth) / 2)
		);
	}

	function currentMinZoom() {
		return isMobileViewport ? MIN_ZOOM_MOBILE : MIN_ZOOM_DESKTOP;
	}

	function coupleGapPx() {
		return isMobileViewport ? COUPLE_GAP_MOBILE_PX : COUPLE_GAP_DESKTOP_PX;
	}

	function branchGapPx() {
		return isMobileViewport ? BRANCH_GAP_MOBILE_PX : BRANCH_GAP_DESKTOP_PX;
	}

	onMount(() => {
		if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
			supportsCssZoom = CSS.supports('zoom', '1');
		}

		const mobileMediaQuery = window.matchMedia('(max-width: 767px)');

		const syncViewportMode = () => {
			const wasMobile = isMobileViewport;
			isMobileViewport = mobileMediaQuery.matches;

			if (!hasInitializedZoom) {
				zoomLevel = isMobileViewport ? INITIAL_ZOOM_MOBILE : INITIAL_ZOOM_DESKTOP;
				hasInitializedZoom = true;
			} else {
				zoomLevel = clampZoom(zoomLevel);
			}

			if (wasMobile !== isMobileViewport) {
				requestAnimationFrame(() => {
					centerTreeViewport();
				});
			}
		};

		syncViewportMode();

		const handleViewportChange = () => {
			syncViewportMode();
		};

		if (typeof mobileMediaQuery.addEventListener === 'function') {
			mobileMediaQuery.addEventListener('change', handleViewportChange);
		} else {
			mobileMediaQuery.addListener(handleViewportChange);
		}

		requestAnimationFrame(() => {
			centerTreeViewport();
		});

		return () => {
			if (typeof mobileMediaQuery.removeEventListener === 'function') {
				mobileMediaQuery.removeEventListener('change', handleViewportChange);
			} else {
				mobileMediaQuery.removeListener(handleViewportChange);
			}
		};
	});

	function coupleBlockWidth(couple: Couple) {
		const parentWidth = couple.person2 ? 368 : 176;
		const childrenWidth =
			couple.children.length > 0
				? couple.children.length * 160 + (couple.children.length - 1) * 32
				: 0;

		return Math.max(parentWidth, childrenWidth, 220) + 24;
	}

	function branchCouplesWidth(couplesInBranch: Couple[]) {
		if (couplesInBranch.length === 0) return 460;

		const totalCoupleWidth = couplesInBranch.reduce(
			(accumulator, couple) => accumulator + coupleBlockWidth(couple),
			0
		);
		return totalCoupleWidth + coupleGapPx() * (couplesInBranch.length - 1);
	}

	function branchWidth(branch: Branch) {
		return `${Math.max(460, branchCouplesWidth(branch.couples))}px`;
	}

	function branchWidthValue(branch: Branch) {
		return Math.max(460, branchCouplesWidth(branch.couples));
	}

	function allBranchesWidth() {
		if (branches.length === 0) return 0;
		const totalBranchWidth = branches.reduce(
			(accumulator, branch) => accumulator + branchWidthValue(branch),
			0
		);
		return totalBranchWidth + branchGapPx() * (branches.length - 1);
	}

	function rootChildrenConnectorWidth() {
		if (branches.length <= 1) return '0px';
		return `${Math.max(180, allBranchesWidth() - ROOT_CONNECTOR_LEFT_TRIM_PX - ROOT_CONNECTOR_RIGHT_TRIM_PX)}px`;
	}

	function rootChildrenConnectorOffset() {
		return `${Math.round((ROOT_CONNECTOR_LEFT_TRIM_PX - ROOT_CONNECTOR_RIGHT_TRIM_PX) / 2)}px`;
	}

	function parentConnectorWidth(branch: Branch) {
		if (branch.couples.length === 0) return '0px';
		return `${Math.max(220, branchCouplesWidth(branch.couples) - 140)}px`;
	}

	function coupleWidth(couple: Couple) {
		return `${coupleBlockWidth(couple)}px`;
	}

	function clampZoom(value: number) {
		return Math.min(MAX_ZOOM, Math.max(currentMinZoom(), Number(value.toFixed(2))));
	}

	function zoomIn() {
		zoomLevel = clampZoom(zoomLevel + ZOOM_STEP);
	}

	function zoomOut() {
		zoomLevel = clampZoom(zoomLevel - ZOOM_STEP);
	}

	function handleZoomWheel(event: WheelEvent) {
		if (!event.ctrlKey && !event.metaKey) return;

		event.preventDefault();
		if (event.deltaY < 0) {
			zoomIn();
		} else {
			zoomOut();
		}
	}

	function profileLink(id: string) {
		return `/profile/${id}`;
	}

	function bornLabel(member: Member) {
		return member.born || 'Tanggal lahir belum tersedia';
	}

	function locationLabel(member: Member) {
		return member.residence || 'Domisili belum tersedia';
	}
</script>

<header
	class="fixed right-0 top-0 z-40 flex h-auto min-h-16 w-full md:w-[calc(100%-16rem)] flex-col items-start justify-center gap-1 border-b border-slate-100/10 bg-white/70 py-2.5 pl-16 pr-4 md:h-16 md:flex-row md:items-center md:justify-between md:gap-0 md:py-0 md:px-8 backdrop-blur-xl dark:bg-slate-950/70"
>
	<div class="flex flex-col gap-1 md:flex-row md:items-center md:gap-4">
		<span class="font-headline text-xl font-black text-emerald-900 dark:text-emerald-100"
			>The Living Archive</span
		>
		<div class="hidden h-4 w-px bg-outline-variant/30 md:block"></div>
		<span class="text-xs font-medium text-secondary md:text-sm">Interactive Lineage View</span>
	</div>
</header>

<div
	class="pointer-events-none absolute inset-0 opacity-[0.03]"
	style="
		background-image: radial-gradient(#012d1d 1px, transparent 1px);
		background-size: 32px 32px;
	"
></div>

<div class="relative px-4 pb-24 pt-24 md:hidden">
	<section class="rounded-3xl bg-surface-container-lowest p-4 shadow-[0_8px_28px_rgba(25,28,29,0.06)]">
		<p class="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Generasi 1</p>
		<div class="mt-3 grid grid-cols-1 gap-3">
			{#each generation1 as member}
				<a
					href={profileLink(member.id)}
					class="flex min-w-0 items-center gap-3 rounded-2xl bg-surface-container-low p-3"
				>
					<img
						class="h-14 w-14 shrink-0 rounded-xl border border-tertiary/20 object-cover"
						alt={`Foto ${member.name}`}
						src={member.image}
					/>
					<div class="min-w-0">
						<p class="truncate font-headline text-lg font-bold leading-tight text-primary">{member.name}</p>
						<p class="mt-1 text-xs font-semibold text-secondary">{bornLabel(member)}</p>
						<p class="mt-1 text-[11px] text-outline">{locationLabel(member)}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	{#if branches.length > 0}
		<section class="mt-5 space-y-4">
			<p class="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">Generasi 2 - 4</p>
			{#each branches as branch}
				<article class="rounded-3xl bg-surface-container-lowest p-4 shadow-[0_8px_28px_rgba(25,28,29,0.06)]">
					<div class="mb-3">
						<p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-outline">Cabang Keluarga</p>
						<p class="mt-1 text-sm font-bold text-primary">{branch.parents.map((parent) => parent.name).join(' & ')}</p>
					</div>

					<div class="grid grid-cols-1 gap-2">
						{#each branch.parents as member}
							<a
								href={profileLink(member.id)}
								class="flex min-w-0 items-center gap-3 rounded-2xl bg-surface-container-low p-3"
							>
								<img
									class="h-11 w-11 shrink-0 rounded-lg border border-tertiary/20 object-cover"
									alt={`Foto ${member.name}`}
									src={member.image}
								/>
								<div class="min-w-0">
									<p class="truncate text-sm font-bold text-primary">{member.name}</p>
									<p class="text-[11px] font-semibold text-secondary">{bornLabel(member)}</p>
								</div>
							</a>
						{/each}
					</div>

					{#if branch.couples.length > 0}
						<div class="mt-4 space-y-3">
							{#each branch.couples as couple}
								<div class="rounded-2xl bg-surface-container-low p-3">
									<div class={couple.person2 ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'}>
										<a
											href={profileLink(couple.person1.id)}
											class="flex min-w-0 flex-col items-center rounded-xl bg-surface-container-lowest p-3 text-center"
										>
											<img
												class="h-12 w-12 rounded-full border border-tertiary/20 object-cover"
												alt={`Foto ${couple.person1.name}`}
												src={couple.person1.image}
											/>
											<p class="mt-2 w-full truncate text-sm font-bold text-primary">{couple.person1.name}</p>
											<p class="text-[11px] font-semibold text-secondary">{bornLabel(couple.person1)}</p>
										</a>

										{#if couple.person2}
											<a
												href={profileLink(couple.person2.id)}
												class="flex min-w-0 flex-col items-center rounded-xl bg-surface-container-lowest p-3 text-center"
											>
												<img
													class="h-12 w-12 rounded-full border border-tertiary/20 object-cover"
													alt={`Foto ${couple.person2.name}`}
													src={couple.person2.image}
												/>
												<p class="mt-2 w-full truncate text-sm font-bold text-primary">{couple.person2.name}</p>
												<p class="text-[11px] font-semibold text-secondary">{bornLabel(couple.person2)}</p>
											</a>
										{/if}
									</div>

									{#if couple.children.length > 0}
										<div class="mt-3 rounded-xl bg-surface-container-lowest p-3">
											<p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-outline">Anak</p>
											<div class="grid grid-cols-2 gap-2">
												{#each couple.children as child}
													<a
														href={profileLink(child.id)}
														class="flex min-w-0 flex-col items-center rounded-lg bg-surface-container-low p-2.5 text-center"
													>
														<img
															class="h-10 w-10 rounded-full border border-tertiary/20 object-cover"
															alt={`Foto ${child.name}`}
															src={child.image}
														/>
														<p class="mt-2 w-full truncate text-xs font-bold text-primary">{child.name}</p>
														<p class="text-[10px] font-semibold text-secondary">{bornLabel(child)}</p>
													</a>
												{/each}
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</article>
			{/each}
		</section>
	{/if}
</div>

<div bind:this={treeViewport} class="relative hidden h-[calc(100vh-4rem)] w-full overflow-auto pb-0 pt-0 md:block" onwheel={handleZoomWheel}>
	<div class="origin-top-left" style={zoomLayerStyle}>
		<div class="flex w-max min-w-[1400px] flex-col items-center p-24 pt-32">
	<div class="relative mb-12 flex flex-wrap justify-center gap-16">
		{#each generation1 as member}
			<div class="flex flex-col items-center">
				<a
					href={profileLink(member.id)}
					class="node-hover flex w-56 cursor-pointer flex-col items-center rounded-xl border border-transparent bg-surface-container-lowest p-4 text-center transition-all duration-300"
				>
					<img
						class="mb-4 h-20 w-20 rounded-full border-2 border-tertiary/20 object-cover"
						alt={`Foto ${member.name}`}
						src={member.image}
					/>
					<h3 class="font-headline text-lg font-bold leading-tight text-primary">{member.name}</h3>
					<p class="mt-1 font-label text-xs font-semibold text-secondary">{bornLabel(member)}</p>
					<p class="mt-2 text-[10px] italic text-outline">{locationLabel(member)}</p>
				</a>
			</div>
		{/each}
	</div>

	{#if branches.length > 0}
		<div class="mb-24 flex w-max min-w-full flex-col items-center px-6">
			<div class="tree-line-v h-10"></div>
			{#if branches.length > 1}
				<div
					class="tree-line-h"
					style={`width: ${rootChildrenConnectorWidth()}; transform: translateX(${rootChildrenConnectorOffset()});`}
				></div>
			{/if}

			<div class="relative flex w-max min-w-full items-start justify-center gap-20">
				{#each branches as branch}
					<div class="flex flex-col items-center" style={`width: ${branchWidth(branch)}`}>
						<div class="tree-line-v h-10"></div>
						<div class="flex w-full flex-nowrap justify-center gap-4">
							{#each branch.parents as member}
								<a
									href={profileLink(member.id)}
									class="node-hover flex w-52 cursor-pointer flex-col items-center rounded-xl border border-transparent bg-surface-container-lowest p-4 text-center transition-all duration-300"
								>
									<img
										class="mb-3 h-16 w-16 rounded-full border-2 border-tertiary/20 object-cover"
										alt={`Foto ${member.name}`}
										src={member.image}
									/>
									<h4 class="text-md font-headline font-bold text-primary">{member.name}</h4>
									<p class="font-label text-[10px] font-semibold text-secondary">{bornLabel(member)}</p>
									<p class="mt-1 text-[10px] text-outline">{member.occupation || 'Anggota keluarga'}</p>
								</a>
							{/each}
						</div>

						{#if branch.couples.length > 0}
							<div class="tree-line-v h-10"></div>
							<div class="tree-line-h" style={`width: ${parentConnectorWidth(branch)}`}></div>

							<div class="flex w-full flex-nowrap items-start justify-center gap-20 pt-8">
								{#each branch.couples as couple}
									<div class="flex flex-col items-center" style={`width: ${coupleWidth(couple)}`}>
										<div class="tree-line-v h-10"></div>

										<div class="flex items-center gap-4">
											<div class="flex flex-col items-center">
												<a
													href={profileLink(couple.person1.id)}
													class="node-hover flex w-44 cursor-pointer flex-col items-center rounded-xl border border-transparent bg-surface-container-lowest p-4 text-center transition-all duration-300"
												>
													<img
														class="mb-3 h-14 w-14 rounded-full border-2 border-tertiary/20 object-cover"
														alt={`Foto ${couple.person1.name}`}
														src={couple.person1.image}
													/>
													<h5 class="font-headline text-sm font-bold text-primary">{couple.person1.name}</h5>
													<p class="font-label text-[9px] font-semibold text-secondary">{bornLabel(couple.person1)}</p>
												</a>
											</div>

											{#if couple.person2}
												<div class="h-px w-8 bg-primary/30"></div>
												<div class="flex flex-col items-center">
													<a
														href={profileLink(couple.person2.id)}
														class="node-hover flex w-44 cursor-pointer flex-col items-center rounded-xl border border-transparent bg-surface-container-lowest p-4 text-center transition-all duration-300"
													>
														<img
															class="mb-3 h-14 w-14 rounded-full border-2 border-tertiary/20 object-cover"
															alt={`Foto ${couple.person2.name}`}
															src={couple.person2.image}
														/>
														<h5 class="font-headline text-sm font-bold text-primary">{couple.person2.name}</h5>
														<p class="font-label text-[9px] font-semibold text-secondary">{bornLabel(couple.person2)}</p>
													</a>
												</div>
											{/if}
										</div>

										{#if couple.children.length > 0}
											<div class="tree-line-v h-8"></div>
											<div class="relative pt-5">
												{#if couple.children.length > 1}
													<div class="tree-line-h absolute left-[5rem] right-[5rem] top-0"></div>
												{/if}
												<div class="flex flex-nowrap justify-center gap-8">
													{#each couple.children as child}
														<div class="flex flex-col items-center">
															<div class="tree-line-v h-5"></div>
															<a
																href={profileLink(child.id)}
																class="node-hover flex w-40 cursor-pointer flex-col items-center rounded-xl border border-transparent bg-surface-container-lowest p-3 text-center transition-all duration-300"
															>
																<img
																	class="mb-2 h-12 w-12 rounded-full border-2 border-tertiary/20 object-cover"
																	alt={`Foto ${child.name}`}
																	src={child.image}
																/>
																<h6 class="font-headline text-xs font-bold text-primary">{child.name}</h6>
																<p class="font-label text-[8px] font-semibold text-secondary">{bornLabel(child)}</p>
															</a>
														</div>
													{/each}
												</div>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
		</div>
	</div>
</div>

<div class="fixed bottom-6 right-6 z-50 hidden md:block">
	<div
		class="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/90 shadow-lg backdrop-blur-sm"
	>
		<button
			type="button"
			onclick={zoomIn}
			disabled={zoomLevel >= MAX_ZOOM}
			aria-label="Zoom in"
			class="grid h-16 w-16 place-items-center text-primary transition-colors hover:bg-surface-container-highest/30 disabled:cursor-not-allowed disabled:opacity-40"
		>
			<span class="material-symbols-outlined text-[2.2rem]">zoom_in</span>
		</button>
		<div class="mx-3 h-px bg-outline-variant/30"></div>
		<button
			type="button"
			onclick={zoomOut}
			disabled={zoomLevel <= currentMinZoom()}
			aria-label="Zoom out"
			class="grid h-16 w-16 place-items-center text-primary transition-colors hover:bg-surface-container-highest/30 disabled:cursor-not-allowed disabled:opacity-40"
		>
			<span class="material-symbols-outlined text-[2.2rem]">zoom_out</span>
		</button>
	</div>
</div>

