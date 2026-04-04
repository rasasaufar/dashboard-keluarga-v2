export type GalleryMoment = {
	id: string;
	image: string;
	alt: string;
	year: string;
	title: string;
	category: string;
	location?: string;
};

export const galleryMoments: GalleryMoment[] = [
	{
		id: '1',
		image:
			'/gallery/wedding-melvin.jpeg',
		alt: 'wedding melvin',
		year: '2025',
		title: 'Acara Pernikahan Melvin & Hernanda',
		category: 'Weddings',
		location: 'Kajen, Pekalongan'
	},
	{
		id: '2',
		image:'/gallery/reuni-pekalongan-2024.jpeg',
		alt: 'kumpul keluarga pekalongan 2024',
		year: '2024',
		title: 'Kumpul Keluarga Pekalongan 2024',
		category: 'Reunion',
		location: 'Pekalongan'
	},
	{
		id: '3',
		image:
			'/gallery/halal-bihalal-1446.jpeg',
		alt: 'Halal Bihalal',
		year: '2026',
		title: "Halal Bihalal Idul Fitri 1447 H",
		category: 'Reunion',
		location: 'Condet, Jakarta'
	},
	{
		id: '4',
		image: '/gallery/halal-bihalal-1445.jpeg',
		alt: 'Halal Bihalal 1445 H',
		year: '2025',
		title: 'Halal Bihalal Idul Fitri 1446 H',
		category: 'Reunion',
		location: 'Cibubur, Jakarta'
	},
	{
		id: '5',
		image: '/gallery/reuni-2011.jpeg',
		alt: 'Reuni 2011',
		year: '2011',
		title: 'Reuni Keluarga 2011',
		category: 'Reunion',
		location: 'Pekajangan, Pekalongan'
	}
];
