<script lang="ts">
	import members from '$lib/data/members.json';
	import { galleryMoments } from '$lib/data/gallery';
	import MemberSearch from '$lib/components/MemberSearch.svelte';
	import heroBg from '$lib/assets/rumah-pekajangan.png';

	type Member = {
		id: string;
		name: string;
		generation: string;
		birthdate?: string;
		memberSince?: string;
		image?: string;
		photos?: string[];
	};

	type UpcomingBirthday = {
		memberId: string;
		name: string;
		image: string;
		nextBirthday: Date;
		turningAge: number;
	};

	const allMembers = members as Member[];
	const now = new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth();

	const generationCount = new Set(
		allMembers.map((member) => member.generation.split(' - ')[0])
	).size;
	const totalMembers = allMembers.length;

	function parseBirthdate(birthdate?: string) {
		if (!birthdate) return null;
		const [yearText, monthText, dayText] = birthdate.split('-');
		const year = Number(yearText);
		const month = Number(monthText);
		const day = Number(dayText);

		if (!year || !month || !day) return null;
		return { year, month: month - 1, day };
	}

	function getNextBirthdayDate(month: number, day: number) {
		const candidate = new Date(currentYear, month, day);
		const today = new Date(currentYear, now.getMonth(), now.getDate());
		if (candidate < today) {
			candidate.setFullYear(currentYear + 1);
		}
		return candidate;
	}

	const birthdayEvents: UpcomingBirthday[] = allMembers
		.map((member) => {
			const parsed = parseBirthdate(member.birthdate);
			if (!parsed || !member.image) return null;

			const nextBirthday = getNextBirthdayDate(parsed.month, parsed.day);
			return {
				memberId: member.id,
				name: member.name,
				image: member.image,
				nextBirthday,
				turningAge: nextBirthday.getFullYear() - parsed.year
			};
		})
		.filter((event): event is UpcomingBirthday => Boolean(event))
		.sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());

	const birthdaysThisMonth = birthdayEvents.filter(
		(event) => event.nextBirthday.getFullYear() === currentYear && event.nextBirthday.getMonth() === currentMonth
	).length;

	const upcomingBirthdays = birthdayEvents.slice(0, 3);

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric'
	});

	const recentGalleryImages = galleryMoments.map((moment) => moment.image).slice(0, 4);
	const remainingGalleryCount = Math.max(galleryMoments.length - 4, 0);
</script>

<!-- Main Canvas -->

<!-- TopNavBar (Shared Component) -->
<header
	class="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex justify-between items-center h-16 pl-16 pr-4 md:px-8 border-b border-slate-100/10"
>
	<div class="flex items-center gap-4">
		<h2 class="text-xl font-black text-emerald-900 dark:text-emerald-100 font-headline">
			Dashboard
		</h2>
	</div>
	<div class="flex items-center gap-6">
		<MemberSearch
			placeholder="Search members..."
			wrapperClass="relative w-64"
			inputClass="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm focus:ring-1 focus:ring-tertiary w-full"
			iconClass="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg"
		/>
	</div>
</header>
<!-- Content Area -->
<div class="pt-24 pb-16 px-4 md:px-12 max-w-7xl mx-auto">
	<!-- Hero Section -->
	<section class="mb-8 md:mb-12 relative">
		<div
			class="relative overflow-hidden rounded-[2rem] p-8 md:p-12 text-white min-h-[320px] flex flex-col justify-center bg-cover bg-center shadow-2xl transition-transform hover:scale-[1.01] duration-700 ease-out"
			style="background-image: linear-gradient(to right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0.5) 75%, rgba(0, 0, 0, 0.1) 100%), url('{heroBg}')"
		>
			<div class="relative z-10 max-w-2xl">
				<span
					class="inline-block px-5 py-1.5 bg-tertiary-fixed/90 backdrop-blur-sm shadow-md text-on-tertiary-fixed rounded-full text-xs font-black mb-6 tracking-[0.2em] uppercase ring-1 ring-white/20"
					>Est. 1950</span>
				<h1 class="text-3xl md:text-5xl font-extrabold font-headline leading-tight tracking-tight mb-5 drop-shadow-md">
					Welcome to the <br /> <span class="text-tertiary-fixed brightness-110">Aliesyahbana Family</span> Legacy
				</h1>
				<p class="text-white/90 text-lg md:text-xl font-medium leading-relaxed max-w-xl drop-shadow-sm">
					Discover the intricate threads of our history, from Pekalongan, Central Java to the bustling streets of the modern world.
				</p>
			</div>
			<!-- Subtle glow effect -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
			<!-- Decorative leaf symbol instead of huge text -->
			<div class="absolute right-[-2%] bottom-[-10%] opacity-[0.03] text-white pointer-events-none mix-blend-overlay">
				<span
					class="material-symbols-outlined text-[350px]"
					data-icon="nest_eco_leaf"
					style="font-variation-settings: 'FILL' 1;">nest_eco_leaf</span
				>
			</div>
		</div>
	</section>
	<!-- Dashboard Bento Grid -->
	<div class="grid grid-cols-12 gap-8">
		<!-- Widget 1: Family Summary (Left Column - Asymmetric) -->
		<div class="col-span-12 lg:col-span-4 space-y-8">
			<div class="bg-surface-container-low rounded-[2rem] p-8">
				<h3
					class="text-primary font-headline text-xl font-bold mb-8 flex items-center justify-between"
				>
					Family Summary
					<span class="material-symbols-outlined text-tertiary" data-icon="analytics"
						>analytics</span
					>
				</h3>
				<div class="space-y-6">
					<div
						class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl"
					>
						<div>
							<p class="text-secondary text-xs uppercase tracking-wider font-bold mb-1">
								Generations
							</p>
							<p class="text-3xl font-headline font-black text-primary">{generationCount
								.toString()
								.padStart(2, '0')}</p>
						</div>
						<div
							class="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary"
						>
							<span class="material-symbols-outlined" data-icon="layers">layers</span>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl"
					>
						<div>
							<p class="text-secondary text-xs uppercase tracking-wider font-bold mb-1">
								Total Members
							</p>
							<p class="text-3xl font-headline font-black text-primary">{totalMembers}</p>
						</div>
						<div
							class="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary"
						>
							<span class="material-symbols-outlined" data-icon="groups">groups</span>
						</div>
					</div>
					<div
						class="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border-l-4 border-tertiary"
					>
						<div>
							<p class="text-secondary text-xs uppercase tracking-wider font-bold mb-1">
								Birthdays This Month
							</p>
							<p class="text-3xl font-headline font-black text-primary">+{birthdaysThisMonth}</p>
						</div>
						<div
							class="w-12 h-12 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary"
						>
							<span class="material-symbols-outlined" data-icon="person_add">person_add</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Widget 2: Birthdays (Right Top) -->
		<div class="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
			<!-- Upcoming Birthdays -->
			<div class="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm">
				<div class="flex items-center justify-between mb-8">
					<h3 class="text-primary font-headline text-xl font-bold">
						Birthdays &amp; Anniversaries
					</h3>
					<a href="/calendar" class="text-tertiary hover:underline text-xs font-bold uppercase tracking-tighter"
						>View Calendar</a
					>
				</div>
				<div class="space-y-6">
					{#if upcomingBirthdays.length === 0}
						<p class="text-sm text-secondary">No birthday data available yet.</p>
					{:else}
						{#each upcomingBirthdays as event}
							<a href={`/profile/${event.memberId}`} class="flex items-center gap-4 hover:opacity-80 transition-opacity">
								<img
									alt={`Portrait of ${event.name}`}
									class="w-12 h-12 rounded-full object-cover"
									src={event.image}
								/>
								<div class="flex-1">
									<h4 class="text-on-surface font-bold text-sm">{event.name}</h4>
									<p class="text-secondary text-xs">Turns {event.turningAge} • {dateFormatter.format(event.nextBirthday)}</p>
								</div>
								<div class="bg-primary/5 p-2 rounded-lg">
									<span class="material-symbols-outlined text-primary text-sm" data-icon="cake"
										>cake</span
									>
								</div>
							</a>
						{/each}
					{/if}
				</div>
			</div>
			<!-- Widget 3: Recently Added Photos -->
			<div class="bg-surface-container-low rounded-[2rem] p-8">
				<div class="flex items-center justify-between mb-8">
					<h3 class="text-primary font-headline text-xl font-bold">Recent Gallery</h3>
					<a href="/gallery" class="text-tertiary hover:underline text-xs font-bold uppercase tracking-tighter"
						>Open Archive</a
					>
				</div>
				<div class="grid grid-cols-2 gap-4">
					{#if recentGalleryImages.length === 0}
						<p class="text-sm text-secondary col-span-2">No gallery images available.</p>
					{:else}
						{#each recentGalleryImages as image, index}
							<div class="aspect-square rounded-2xl overflow-hidden group relative">
								<img
									alt={`Family gallery item ${index + 1}`}
									class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
									src={image}
								/>
								{#if index === 3 && remainingGalleryCount > 0}
									<div
										class="absolute inset-0 bg-primary/40 flex items-center justify-center backdrop-blur-sm group-hover:bg-primary/20 transition-all"
									>
										<span class="text-white font-bold text-sm">+{remainingGalleryCount}</span>
									</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>


<!-- FAB Suppression Rule: On Dashboard/Home, we show the FAB for primary action -->
