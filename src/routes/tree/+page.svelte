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

	const COUPLE_GAP_PX = 80;
	const BRANCH_GAP_PX = 80;
	const MIN_ZOOM = 0.6;
	const MAX_ZOOM = 2;
	const ZOOM_STEP = 0.1;
	const INITIAL_ZOOM = MIN_ZOOM;
	const ROOT_CONNECTOR_LEFT_TRIM_PX = 620;
	const ROOT_CONNECTOR_RIGHT_TRIM_PX = 260;

	let zoomLevel = $state(INITIAL_ZOOM);
	let treeViewport: HTMLDivElement | null = null;

	onMount(() => {
		requestAnimationFrame(() => {
			if (!treeViewport) return;

			treeViewport.scrollTop = 0;
			treeViewport.scrollLeft = Math.max(
				0,
				Math.round((treeViewport.scrollWidth - treeViewport.clientWidth) / 2)
			);
		});
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
		return totalCoupleWidth + COUPLE_GAP_PX * (couplesInBranch.length - 1);
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
		return totalBranchWidth + BRANCH_GAP_PX * (branches.length - 1);
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
		return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
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
	class="fixed right-0 top-0 z-40 flex h-16 w-full md:w-[calc(100%-16rem)] items-center justify-between border-b border-slate-100/10 bg-white/70 pl-16 pr-4 md:px-8 backdrop-blur-xl dark:bg-slate-950/70"
>
	<div class="flex items-center gap-4">
		<span class="font-headline text-xl font-black text-emerald-900 dark:text-emerald-100"
			>The Living Archive</span
		>
		<div class="h-4 w-px bg-outline-variant/30"></div>
		<span class="text-sm font-medium text-secondary">Interactive Lineage View</span>
	</div>
</header>

<div
	class="pointer-events-none absolute inset-0 opacity-[0.03]"
	style="
		background-image: radial-gradient(#012d1d 1px, transparent 1px);
		background-size: 32px 32px;
	"
></div>

<div bind:this={treeViewport} class="relative w-full overflow-auto pt-16 h-[calc(100vh-4rem)] md:h-full md:pt-0 pb-16 md:pb-0" onwheel={handleZoomWheel}>
	<div class="origin-top-left" style={`zoom: ${zoomLevel};`}>
		<div class="flex w-max min-w-[1400px] flex-col items-center p-8 md:p-24 pt-24 md:pt-32">
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

<div class="fixed bottom-6 right-6 z-50">
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
			disabled={zoomLevel <= MIN_ZOOM}
			aria-label="Zoom out"
			class="grid h-16 w-16 place-items-center text-primary transition-colors hover:bg-surface-container-highest/30 disabled:cursor-not-allowed disabled:opacity-40"
		>
			<span class="material-symbols-outlined text-[2.2rem]">zoom_out</span>
		</button>
	</div>
</div>

