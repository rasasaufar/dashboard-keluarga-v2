import members from '$lib/data/members.json';

export function load({ params }) {
	const member = members.find((m) => m.id === params.id) || members[0]; // fallback to first member if not found for demo purposes
	return { member, members };
}
