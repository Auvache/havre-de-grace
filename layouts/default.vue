<template>
	<div>
		<hamburger />
		<main>
			<slot />
		</main>
		<footer class="py-8 px-6 bg-black border-t border-zinc-900">
			<div class="max-w-6xl mx-auto text-center text-white text-sm">
				<p>&copy; 2025 Havre De Grace Music. All rights reserved.</p>
			</div>
		</footer>
	</div>
</template>
<script setup lang="ts">
// Add global organization schema to footer (appears on all pages)
const organizationSchema = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: 'Havre De Grace',
	url: 'https://havredegracemusic.com',
	logo: 'https://havredegracemusic.com/og-image.jpg',
	description: 'Independent singer-songwriter music',
	sameAs: [
		'https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb',
		'https://music.apple.com/us/artist/havre-de-grace/1756040766',
		'https://www.youtube.com/@havredegracemusic',
		'https://www.instagram.com/havredegracemusic/',
	],
	contactPoint: {
		'@type': 'ContactPoint',
		email: 'booking@havredegracemusic.com',
		contactType: 'Booking',
	},
}

useSchemaOrg([organizationSchema])
</script>