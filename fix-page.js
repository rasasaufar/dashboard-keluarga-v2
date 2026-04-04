const fs = require('fs');

let page = fs.readFileSync('src/routes/profile/[id]/+page.svelte', 'utf8');

// 1. Add script tag at the beginning
if (!page.includes('export let data;')) {
	page = '<script>\n\texport let data;\n\t$: member = data.member;\n</script>\n\n' + page;
}

// Replace names
page = page.replace(/>Ahmad Arisandi<\/h1>/g, '>{member.name}</h1>');
page = page.replace(/1st Generation - Grandparent/g, '{member.generation}');
page = page.replace(
	/A master of structural elegance and cultural preservation\. Dedicating four decades to Indonesian architecture, shaping the skylines of Bandung with a focus on heritage integration\./g,
	'{member.description}'
);
page = page.replace(/1945, Bandung/g, '{member.born}');
page = page.replace(/>Architect<\/p>/g, '>{member.occupation}</p>');
page = page.replace(/>Dago, West Java<\/p>/g, '>{member.residence}</p>');
page = page.replace(/Member Since 2021/g, 'Member Since {member.memberSince}');

// Replacing the main portrait
page = page.replace(
	/src="https:\/\/lh3.googleusercontent.com\/aida-public\/AB6AXuDXE5NDIiyYr30HtGo-7uuEPBOCg4Idjtl5k2u6qmU3gBeguBSJXWZdmZTL3l-aSZyeNBrGZ81r7tJfa44U0OdQM3XQ1jOeCfigx7viYnNpR1QcISIcMbMORgH8FnV63mew9nEyfsNMyH1LD03c31sueAu_Ruu4j6PL7v_DFCz0zd2JvORemImbj6xDJRk76ehkJkSrsnehk0dRQ4-2SyK628S1q7r5eskPzwsP41qTCOt2NRYqYDik8MshVaYNtDGaynzMAGMFiwA"/g,
	'src={member.image}'
);

// For Timeline, it's a bit complex with Regex.
// I'll replace the section manually using a Svelte #each block
let timelineStart = page.indexOf(
	'<div class="relative ml-4 pl-12 border-l-2 border-emerald-900/10 space-y-12">'
);
if (timelineStart > -1) {
	let timelineEnd = page.indexOf('</section>', timelineStart);
	let beforeTimeline = page.substring(
		0,
		timelineStart +
			'<div class="relative ml-4 pl-12 border-l-2 border-emerald-900/10 space-y-12">'.length
	);
	let afterTimeline = page.substring(timelineEnd);

	let injectedTimeline = `\n{#each member.timeline as event}\n<div class="relative">\n<div class="absolute -left-[57px] top-0 w-11 h-11 bg-white rounded-full border-4 border-emerald-900 flex items-center justify-center text-emerald-900 shadow-xl">\n<span class="material-symbols-outlined text-lg" data-icon="{event.icon}">{event.icon}</span>\n</div>\n<div class="space-y-1">\n<span class="text-xs font-bold text-emerald-900 uppercase tracking-widest">{event.year}</span>\n<h3 class="text-lg font-bold">{event.title}</h3>\n<p class="text-secondary text-sm max-w-lg leading-relaxed">{event.description}</p>\n</div>\n</div>\n{/each}\n</div>\n`;
	page = beforeTimeline + injectedTimeline + afterTimeline;
}

// For Family
let familyStart = page.indexOf('<div class="grid grid-cols-2 md:grid-cols-4 gap-4">');
if (familyStart > -1) {
	let familyEnd = page.indexOf('</section>', familyStart);
	let beforeFamily = page.substring(
		0,
		familyStart + '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">'.length
	);
	let afterFamily = page.substring(familyEnd);

	let injectedFamily = `\n{#each member.family as relative}\n<div class="group cursor-pointer bg-surface-container-low p-4 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-md">\n<div class="w-12 h-12 rounded-full overflow-hidden mb-3 grayscale group-hover:grayscale-0 transition-all duration-500">\n<img class="w-full h-full object-cover" src="{relative.image}"/>\n</div>\n<p class="text-[10px] text-secondary font-bold uppercase tracking-widest mb-1">{relative.relation}</p>\n<p class="text-sm font-bold text-primary group-hover:text-emerald-700">{relative.name}</p>\n</div>\n{/each}\n</div>\n`;
	page = beforeFamily + injectedFamily + afterFamily;
}

// For Gallery
let galleryStart = page.lastIndexOf('<div class="grid grid-cols-2 md:grid-cols-3 gap-4">');
if (galleryStart > -1) {
	let galleryEnd = page.indexOf('</section>', galleryStart);
	let beforeGallery = page.substring(
		0,
		galleryStart + '<div class="grid grid-cols-2 md:grid-cols-3 gap-4">'.length
	);
	let afterGallery = page.substring(galleryEnd);

	let injectedGallery = `\n{#each member.photos.slice(0, 5) as photo}\n<div class="aspect-square rounded-2xl overflow-hidden group cursor-zoom-in">\n<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="{photo}"/>\n</div>\n{/each}\n{#if member.photos.length > 5}\n<div class="aspect-square rounded-2xl overflow-hidden group cursor-zoom-in bg-primary flex items-center justify-center relative">\n<div class="text-center z-10">\n<span class="material-symbols-outlined text-white text-3xl mb-1" data-icon="grid_view">grid_view</span>\n<p class="text-white text-[10px] font-bold uppercase tracking-widest">+{member.photos.length - 5} More</p>\n</div>\n<div class="absolute inset-0 bg-primary opacity-80"></div>\n<img class="w-full h-full object-cover" src="{member.photos[5]}"/>\n</div>\n{/if}\n</div>\n`;
	page = beforeGallery + injectedGallery + afterGallery;
}

// Write back
fs.writeFileSync('src/routes/profile/[id]/+page.svelte', page);
