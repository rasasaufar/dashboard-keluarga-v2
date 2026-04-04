<script lang="ts">
	type Event = { memberId: string, name: string, fullName: string, month: number, day: number, birthYear: number, bg: string, text: string, photo: string };
	import members from '$lib/data/members.json';
	import MemberSearch from '$lib/components/MemberSearch.svelte';

	type Member = {
		id: string;
		name: string;
		image: string;
		birthdate?: string;
	};

	const allMembers = members as Member[];

	let currentDate = $state(new Date());

	let currentYear = $derived(currentDate.getFullYear());
	let currentMonth = $derived(currentDate.getMonth()); // 0-11

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function prevMonth() {
		currentDate = new Date(currentYear, currentMonth - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(currentYear, currentMonth + 1, 1);
	}

	function getAgeIndicator(birthYear: number, eventYear: number) {
		const age = eventYear - birthYear;
		const lastDigit = age % 10;
		const lastTwo = age % 100;
		let suffix = 'th';
		if (lastDigit === 1 && lastTwo !== 11) suffix = 'st';
		if (lastDigit === 2 && lastTwo !== 12) suffix = 'nd';
		if (lastDigit === 3 && lastTwo !== 13) suffix = 'rd';
		return age > 0 ? `${age}${suffix}` : 'Born';
	}

	let calendarDays = $derived(() => {
		const days = [];
		const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

		const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

		for (let i = firstDayOfMonth - 1; i >= 0; i--) {
			days.push({ day: prevMonthDays - i, isCurrentMonth: false, month: currentMonth - 1 });
		}

		for (let i = 1; i <= daysInMonth; i++) {
			days.push({ day: i, isCurrentMonth: true, month: currentMonth });
		}

		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			days.push({ day: i, isCurrentMonth: false, month: currentMonth + 1 });
		}

		return days;
	});

	let events = $derived(() => {
		let evts: Event[] = [];
		allMembers.forEach((member) => {
			if (member.birthdate) {
				const [y, m, d] = member.birthdate.split('-');
				evts.push({
					memberId: member.id,
					name: member.name.split(' ')[0], // Base name or first name for calendar
					fullName: member.name,
					month: parseInt(m) - 1,
					day: parseInt(d),
					birthYear: parseInt(y),
					bg: 'tertiary-container',
					text: 'tertiary',
					photo: member.image
				});
			}
		});
		return evts;
	});

	let currentMonthEvents = $derived(
		events()
			.filter((e) => e.month === currentMonth)
			.sort((a, b) => a.day - b.day)
	);

	// Get events on a specific day of the month being rendered (handling prev/next month logic optionally if needed, but keeping it simple: just matching current rendering month)
	function getEventsForDay(dayObj: { month: number, day: number }) {
		let m = dayObj.month;
		if (m < 0) m = 11;
		if (m > 11) m = 0;
		return events().filter((e) => e.month === m && e.day === dayObj.day);
	}
</script>

<!-- TopNavBar (Shared Component) -->
<header
	class="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl h-16 flex justify-between items-center pl-16 pr-4 md:px-8 border-b border-slate-100/10"
>
	<div class="flex-1 max-w-xl">
		<MemberSearch
			placeholder="Search members..."
			wrapperClass="relative w-full"
			inputClass="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-tertiary"
			iconClass="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
		/>
	</div>
</header>
<!-- Main Content Canvas -->

<div class="max-w-[1400px] mx-auto p-4 md:p-10 pt-24">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6 md:gap-0">
		<div class="space-y-2">
			<h2 class="text-3xl md:text-5xl font-extrabold text-primary tracking-tighter leading-none">
				Family Almanac
			</h2>
			<p class="text-secondary max-w-md font-body leading-relaxed">
				Tracing the rhythm of our history through birthdays, anniversaries, and shared milestones.
			</p>
		</div>
		<div class="flex items-center gap-4 bg-surface-container-low p-1.5 rounded-full">
			<button onclick={prevMonth} class="p-2 hover:bg-white rounded-full transition-all group">
				<span
					class="material-symbols-outlined text-secondary group-hover:text-primary"
					data-icon="chevron_left">chevron_left</span
				>
			</button>
			<span
				class="font-headline font-bold text-lg px-4 text-primary tracking-tight w-40 text-center"
				>{monthNames[currentMonth]} {currentYear}</span
			>
			<button onclick={nextMonth} class="p-2 hover:bg-white rounded-full transition-all group">
				<span
					class="material-symbols-outlined text-secondary group-hover:text-primary"
					data-icon="chevron_right">chevron_right</span
				>
			</button>
		</div>
	</div>

	<div class="flex flex-col lg:flex-row gap-8 lg:gap-10 overflow-x-auto">
		<!-- Calendar Grid Container -->
		<div class="flex-1 min-w-[700px]">
			<div
				class="grid grid-cols-7 gap-px bg-outline-variant/10 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(25,28,29,0.04)] bg-white"
			>
				<!-- Day Headers -->
				{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
					<div class="bg-surface-container-low py-4 text-center border-b border-outline-variant/20">
						<span class="font-headline text-xs font-bold uppercase tracking-[0.2em] text-secondary"
							>{day}</span
						>
					</div>
				{/each}

				<!-- Rows (6 weeks x 7 days) -->
				{#each calendarDays() as dayObj}
					{#if !dayObj.isCurrentMonth}
						<div
							class="min-h-[120px] p-4 bg-slate-50 text-outline/30 border-l border-outline-variant/10"
						>
							<span class="text-sm font-medium">{dayObj.day}</span>

							<!-- Dimmed events in overflow days if desired -->
							{#each getEventsForDay(dayObj) as ev}
								<div class="mt-4 px-2 py-1 bg-slate-200/50 rounded-lg">
									<p class="text-[10px] font-bold text-outline truncate">
										{ev.name}'s {getAgeIndicator(
											ev.birthYear,
											currentMonth === 0 && dayObj.month === 11
												? currentYear - 1
												: currentMonth === 11 && dayObj.month === 0
													? currentYear + 1
													: currentYear
										)}
									</p>
								</div>
							{/each}
						</div>
					{:else}
						<div
							class="min-h-[120px] p-4 bg-white hover:bg-surface-container-lowest transition-colors border-l border-outline-variant/10"
						>
							<div class="flex justify-between items-start">
								<span class="text-sm font-bold text-on-surface">{dayObj.day}</span>
								{#if getEventsForDay(dayObj).length > 0}
									<div
										class="w-1.5 h-1.5 rounded-full bg-tertiary-container shadow-[0_0_8px_rgba(203,167,47,0.5)]"
									></div>
								{/if}
							</div>

							{#each getEventsForDay(dayObj) as ev}
								<a
									href="/profile/{ev.memberId}"
									class="block mt-4 px-2 py-1 bg-tertiary-container/30 hover:bg-tertiary-container/50 rounded-lg transition-colors cursor-pointer"
								>
									<p class="text-[10px] font-bold text-tertiary truncate">
										{ev.name}'s {getAgeIndicator(ev.birthYear, currentYear)}
									</p>
								</a>
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Side Panel (Events) -->
		<aside class="w-80 space-y-8">
			<section>
				<div class="flex justify-between items-center mb-6">
					<h3
						class="font-headline font-bold text-sm tracking-widest uppercase text-secondary flex items-center gap-2"
					>
						Upcoming this month
					</h3>
					<span class="text-[10px] bg-surface-container-low px-2 py-0.5 rounded-full font-bold"
						>{currentMonthEvents.length} Events</span
					>
				</div>

				<div class="space-y-6">
					{#if currentMonthEvents.length === 0}
						<p class="text-xs text-outline italic">No milestones this month.</p>
					{/if}
					{#each currentMonthEvents as ev}
						<!-- Event Mini Card -->
						<div class="flex items-start gap-4">
							<div class="text-center min-w-[3rem]">
								<p class="text-xs font-bold text-secondary-fixed-dim uppercase tracking-tighter">
									{monthNames[currentMonth].substring(0, 3)}
								</p>
								<p class="text-2xl font-black text-primary leading-none">{ev.day}</p>
							</div>
							<div
								class="flex-1 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10"
							>
								<span
									class="text-[9px] font-black uppercase tracking-[0.15em] text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded text-left"
									>Birthday</span
								>
								<div class="flex items-center gap-3 mt-3">
									<img
										src={ev.photo}
										class="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
										alt={ev.name}
									/>
									<div>
										<p class="text-sm font-bold text-primary leading-tight">{ev.fullName}</p>
										<p class="text-xs text-secondary mt-0.5">
											Turns {getAgeIndicator(ev.birthYear, currentYear)}
										</p>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<button
				class="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-low hover:bg-white border hover:border-primary/20 hover:text-primary hover:shadow-md transition-all rounded-xl text-sm font-bold text-secondary"
			>
				<span class="material-symbols-outlined text-sm" data-icon="add">add</span>
				Add Event
			</button>
		</aside>
	</div>

	<!-- Legends -->
	<div class="mt-12 flex items-center gap-8 py-6 border-t border-outline-variant/10">
		<p class="text-[10px] font-bold tracking-widest text-secondary uppercase">Key markers:</p>
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full bg-tertiary-container"></div>
			<span class="text-[11px] font-semibold text-secondary">Birthdays</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full bg-primary-container"></div>
			<span class="text-[11px] font-semibold text-secondary">Anniversaries</span>
		</div>
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 rounded-full bg-secondary-container"></div>
			<span class="text-[11px] font-semibold text-secondary">Gatherings</span>
		</div>
	</div>
</div>
