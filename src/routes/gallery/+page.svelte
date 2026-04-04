<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { galleryMoments, type GalleryMoment } from '$lib/data/gallery';
    import MemberSearch from '$lib/components/MemberSearch.svelte';

    type GalleryFilter = 'All' | 'Weddings' | 'Holidays' | 'Reunion';

    const filters: GalleryFilter[] = ['All', 'Weddings', 'Holidays', 'Reunion'];
    const sortedMoments = [...galleryMoments].sort((a, b) => Number(b.year) - Number(a.year));
    const imageAspects = ['aspect-[4/5]', 'aspect-[3/2]', 'aspect-[1/1]', 'aspect-[4/3]', 'aspect-[9/16]'];

    let activeFilter = $state<GalleryFilter>('All');
    let selectedMoment = $state<GalleryMoment | null>(null);

    function getVisibleMoments(): GalleryMoment[] {
        if (activeFilter === 'All') return sortedMoments;
        return sortedMoments.filter((moment) => moment.category === activeFilter);
    }

    function cardAspectClass(index: number) {
        return imageAspects[index % imageAspects.length];
    }

    function formatCategoryLabel(category: string) {
        return category.toUpperCase();
    }

    // Distribute into 2 columns for md
    let columnsMd = $derived(() => {
        const cols: GalleryMoment[][] = [[], []];
        const heights = [0, 0];
        const moments = getVisibleMoments();
        
        moments.forEach((moment, i) => {
            const aspectString = cardAspectClass(i);
            let h = 1;
            if (aspectString.includes('4/5')) h = 1.25;
            else if (aspectString.includes('3/2')) h = 0.66;
            else if (aspectString.includes('1/1')) h = 1;
            else if (aspectString.includes('4/3')) h = 0.75;
            else if (aspectString.includes('9/16')) h = 1.77;
            
            const shortestCol = heights[0] <= heights[1] ? 0 : 1;
            cols[shortestCol].push(moment);
            heights[shortestCol] += h;
        });
        
        return cols;
    });

    // Distribute into 3 columns for xl
    let columnsXl = $derived(() => {
        const cols: GalleryMoment[][] = [[], [], []];
        const heights = [0, 0, 0];
        const moments = getVisibleMoments();
        
        moments.forEach((moment, i) => {
            const aspectString = cardAspectClass(i);
            let h = 1;
            if (aspectString.includes('4/5')) h = 1.25;
            else if (aspectString.includes('3/2')) h = 0.66;
            else if (aspectString.includes('1/1')) h = 1;
            else if (aspectString.includes('4/3')) h = 0.75;
            else if (aspectString.includes('9/16')) h = 1.77;
            
            const shortestCol = heights.indexOf(Math.min(...heights));
            cols[shortestCol].push(moment);
            heights[shortestCol] += h;
        });
        
        return cols;
    });

    function getOriginalIndex(moment: GalleryMoment): number {
        return getVisibleMoments().findIndex(m => m.id === moment.id);
    }

    const totalMoments = sortedMoments.length;
</script>

<!-- TopNavBar -->
<header
    class="fixed top-0 right-0 z-40 flex h-16 w-full md:w-[calc(100%-16rem)] items-center justify-between border-b border-slate-100/10 bg-white/70 pl-16 pr-4 md:px-8 shadow-sm backdrop-blur-xl dark:bg-slate-950/70"
>
    <div class="flex items-center gap-4">
        <span class="font-headline text-xl font-black tracking-tight text-emerald-900 dark:text-emerald-100"
            >Gallery Archive</span
        >
    </div>
    <div class="flex items-center gap-6">
        <MemberSearch
            placeholder="Search members..."
            wrapperClass="relative hidden w-64 lg:block"
            inputClass="w-full rounded-full border-none bg-surface-container-low py-1.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-tertiary"
            iconClass="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
        />
    </div>
</header>

<!-- Main Content -->
<div class="pt-24 pb-12 px-4 md:px-12 min-h-[calc(100vh-4rem)] bg-surface text-on-surface">

<!-- Editorial Header -->
    <section class="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div class="max-w-2xl">
            <h2 class="mb-4 font-headline text-3xl md:text-5xl font-extrabold tracking-tighter text-primary">
                A Century in Moments
            </h2>
            <p class="max-w-lg font-body text-lg leading-relaxed text-secondary">
                Visual narratives across generations. Every photograph is a portal to a story that defined our lineage.
            </p>
        </div>
        <div class="flex flex-wrap items-center gap-2 rounded-full bg-surface-container-low p-1.5">
            {#each filters as filter}
                <button
                    type="button"
                    onclick={() => (activeFilter = filter)}
                    class={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 ${
                        activeFilter === filter
                            ? 'bg-primary font-semibold text-on-primary'
                            : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                >
                    {filter}
                </button>
            {/each}
        </div>
    </section>

    <!-- Custom Masonry Gallery (Handles true responsive height balancing) -->
    
    <!-- Mobile: 1 Column -->
    <div class="flex flex-col gap-6 md:hidden">
        {#each getVisibleMoments() as moment, i (moment.id)}
            <button 
                type="button" 
                class="w-full text-left group relative cursor-zoom-in overflow-hidden rounded-xl bg-surface-container-low transition-shadow duration-300 hover:shadow-xl shrink-0"
                onclick={() => (selectedMoment = moment)}
                aria-label={`View full image for ${moment.title}`}
            >
                <div class={`relative overflow-hidden ${cardAspectClass(i)}`}>
                    <img
                        class="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                        src={moment.image}
                        alt={moment.title}
                        data-alt={moment.alt}
                    />
                    <div
                        class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/80 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                        <span class="mb-1 font-headline text-xl font-bold text-tertiary-fixed">{moment.year}</span>
                        <p class="text-sm font-medium tracking-tight text-white/90">{moment.title}</p>
                        {#if moment.location}
                            <div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white/80">
                                <span class="material-symbols-outlined text-sm">location_on</span>
                                {moment.location}
                            </div>
                        {/if}
                    </div>
                </div>
                <div class="flex items-center justify-between p-4">
                    <span
                        class="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary-container"
                    >
                        {formatCategoryLabel(moment.category)}
                    </span>
                    <span class="material-symbols-outlined text-outline text-sm">photo_camera</span>
                </div>
            </button>
        {/each}
    </div>

    <!-- Tablet: 2 Columns -->
    <div class="hidden md:flex xl:hidden gap-6 items-start">
        {#each columnsMd() as colMoments}
            <div class="flex-1 flex flex-col gap-6">
                {#each colMoments as moment (moment.id)}
                    {@const origIndex = getOriginalIndex(moment)}
                    <button 
                        type="button" 
                        class="w-full text-left group relative cursor-zoom-in overflow-hidden rounded-xl bg-surface-container-low transition-shadow duration-300 hover:shadow-xl shrink-0"
                        onclick={() => (selectedMoment = moment)}
                        aria-label={`View full image for ${moment.title}`}
                    >
                        <div class={`relative overflow-hidden ${cardAspectClass(origIndex)}`}>
                            <img
                                class="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                src={moment.image}
                                alt={moment.title}
                                data-alt={moment.alt}
                            />
                            <div
                                class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/80 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            >
                                <span class="mb-1 font-headline text-xl font-bold text-tertiary-fixed">{moment.year}</span>
                                <p class="text-sm font-medium tracking-tight text-white/90">{moment.title}</p>
                                {#if moment.location}
                                    <div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white/80">
                                        <span class="material-symbols-outlined text-sm">location_on</span>
                                        {moment.location}
                                    </div>
                                {/if}
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-4">
                            <span
                                class="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary-container"
                            >
                                {formatCategoryLabel(moment.category)}
                            </span>
                            <span class="material-symbols-outlined text-outline text-sm">photo_camera</span>
                        </div>
                    </button>
                {/each}
            </div>
        {/each}
    </div>

    <!-- Desktop: 3 Columns -->
    <div class="hidden xl:flex gap-6 items-start">
        {#each columnsXl() as colMoments}
            <div class="flex-1 flex flex-col gap-6">
                {#each colMoments as moment (moment.id)}
                    {@const origIndex = getOriginalIndex(moment)}
                    <button 
                        type="button" 
                        class="w-full text-left group relative cursor-zoom-in overflow-hidden rounded-xl bg-surface-container-low transition-shadow duration-300 hover:shadow-xl shrink-0"
                        onclick={() => (selectedMoment = moment)}
                        aria-label={`View full image for ${moment.title}`}
                    >
                        <div class={`relative overflow-hidden ${cardAspectClass(origIndex)}`}>
                            <img
                                class="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                                src={moment.image}
                                alt={moment.title}
                                data-alt={moment.alt}
                            />
                            <div
                                class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary/80 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            >
                                <span class="mb-1 font-headline text-xl font-bold text-tertiary-fixed">{moment.year}</span>
                                <p class="text-sm font-medium tracking-tight text-white/90">{moment.title}</p>
                                {#if moment.location}
                                    <div class="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white/80">
                                        <span class="material-symbols-outlined text-sm">location_on</span>
                                        {moment.location}
                                    </div>
                                {/if}
                            </div>
                        </div>
                        <div class="flex items-center justify-between p-4">
                            <span
                                class="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-primary-container"
                            >
                                {formatCategoryLabel(moment.category)}
                            </span>
                            <span class="material-symbols-outlined text-outline text-sm">photo_camera</span>
                        </div>
                    </button>
                {/each}
            </div>
        {/each}
    </div>

    {#if getVisibleMoments().length === 0}
        <div class="mt-10 rounded-2xl border border-outline-variant/30 bg-surface-container-low px-6 py-10 text-center">
            <p class="text-base font-semibold text-primary">Tidak ada foto untuk kategori ini.</p>
            <p class="mt-2 text-sm text-secondary">Coba pilih kategori lain.</p>
        </div>
    {/if}

    <!-- Footer Info -->
    <div class="mt-16 flex flex-col items-center gap-4">
        <button
            type="button"
            class="flex items-center gap-3 rounded-full bg-surface-container-low px-10 py-4 font-bold text-primary transition-colors hover:bg-surface-container-high"
        >
            <span class="material-symbols-outlined">expand_more</span>
            Explore More History
        </button>
        <p class="font-label text-xs uppercase tracking-widest text-slate-400">
            Showing {getVisibleMoments().length} of {totalMoments} archived moments
        </p>
    </div>
</div>

<svelte:window onkeydown={(e) => selectedMoment && e.key === 'Escape' && (selectedMoment = null)} />

<!-- Fullscreen Image Modal / Lightbox -->
{#if selectedMoment}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md md:p-10"
        transition:fade={{ duration: 250 }}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        onclick={() => (selectedMoment = null)}
    >

        <!-- Close Button -->
        <button
            class="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-2.5 text-white transition-all hover:bg-white/20 hover:scale-110 active:scale-95"
            aria-label="Close"
            onclick={(e) => {
                e.stopPropagation();
                selectedMoment = null;
            }}
        >
            <span class="material-symbols-outlined block text-2xl leading-none">close</span>
        </button>

        <!-- Modal Content -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
            class="relative flex max-h-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10"
            transition:scale={{ duration: 350, start: 0.95, opacity: 0 }}
            onclick={(e) => e.stopPropagation()}
        >
            <div class="relative flex items-center justify-center overflow-hidden">
                <img
                    src={selectedMoment.image}
                    alt={selectedMoment.alt}
                    class="h-auto max-h-[75vh] w-auto max-w-full object-contain"
                />
            </div>
            
            <div class="bg-slate-950 p-6 sm:px-8 border-t border-white/10">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <div class="mb-2 flex items-center gap-3">
                            <span class="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-fixed">
                                {formatCategoryLabel(selectedMoment.category)}
                            </span>
                            <span class="text-sm font-medium tracking-wide text-white/60">{selectedMoment.year}</span>
                            {#if selectedMoment.location}
                                <span class="flex items-center gap-1 text-sm font-medium tracking-wide text-white/60">
                                    <span class="material-symbols-outlined text-[16px]">location_on</span>
                                    {selectedMoment.location}
                                </span>
                            {/if}
                        </div>
                        <h3 class="font-headline text-2xl font-bold tracking-tight text-white lg:text-3xl">
                            {selectedMoment.title}
                        </h3>
                        {#if selectedMoment.alt}
                            <p class="mt-3 max-w-3xl font-body text-sm leading-relaxed text-white/70">
                                {selectedMoment.alt}
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .masonry-grid {
        column-count: 1;
        column-gap: 1.5rem;
    }

    @media (min-width: 768px) {
        .masonry-grid {
            column-count: 2;
        }
    }

    @media (min-width: 1280px) {
        .masonry-grid {
            column-count: 3;
        }
    }

    .masonry-item {
        break-inside: avoid;
        margin-bottom: 1.5rem;
    }
</style>