<template>
	<div class="min-h-screen bg-black text-white">
		<!-- Hero Section -->
		<section class="pt-4 md:pt-16 pb-0 px-6">
			<div class="max-w-2xl mx-auto text-center">
				<img class="max-w-[125px] md:max-w-[200px] mx-auto mt-4" src="@/assets/images/logo-white.png" alt="">
			</div>
		</section>

		<!-- Links Section -->
		<section class="py-8 px-6">
			<div class="max-w-2xl mx-auto space-y-4">

				<!-- Homepage -->
				<NuxtLink to="/" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
					</svg>
					<span class="text-lg font-semibold">Official Website</span>
				</NuxtLink>

				<!-- Spotify -->
				<a href="https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb?si=el1o7QJyR2eZnKN0PkVXhQ" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/spotify.png" alt="Spotify" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Spotify</span>
				</a>

				<!-- Apple Music -->
				<a href="https://music.apple.com/us/album/i-want-to-be-yours-and-other-songs/1825329218" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/apple-music.png" alt="Apple Music" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Apple Music</span>
				</a>

				<!-- YouTube Music -->
				<a href="https://music.youtube.com/channel/UCn7MTFvOrltNAAeHCmAYnNQ?si=tJUeZJT26fu0nkpI" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/youtube-music.png" alt="YouTube Music" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">YouTube Music</span>
				</a>

				<!-- Amazon Music -->
				<a href="https://music.amazon.com/artists/B0G83WZY27/havre-de-grace?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_oB5r6h4YdnltmJnf90rPuppKD" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/amazon-music.png" alt="Amazon Music" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Amazon Music</span>
				</a>

				<!-- Bandcamp -->
				<a href="https://havredegrace.bandcamp.com/" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/bandcamp.png" alt="Bandcamp" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Bandcamp</span>
				</a>

				<!-- Soundcloud -->
				<a href="https://soundcloud.com/havredegracemusic" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/soundcloud.png" alt="Soundcloud" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Soundcloud</span>
				</a>

				<!-- YouTube -->
				<a href="https://youtube.com/@havredegracemusic?si=h8No7fUu70yMH7Bp" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/youtube.png" alt="YouTube Channel" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">YouTube</span>
				</a>

				<!-- Instagram -->
				<a href="https://instagram.com/havredegracemusic" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/instagram.png" alt="Instagram" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Instagram</span>
				</a>

				<!-- Email -->
				<a href="mailto:booking@havredegracemusic.com" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
						<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
					</svg>
					<span class="text-lg font-semibold">Email</span>
				</a>

			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
useSeoMeta({
	title: 'Links | Havre De Grace',
	description: 'All links for Havre De Grace - Stream music on Spotify, Apple Music, YouTube Music, Amazon Music, and Bandcamp. Official website and booking contact.',
	ogTitle: 'Links - Havre De Grace',
	ogDescription: 'Find all music streaming links and contact information for independent singer-songwriter Havre De Grace.',
	ogImage: '/images/media-pic-square.jpg',
	keywords: 'Havre De Grace links, Havre De Grace social media, Havre De Grace music links, stream Havre De Grace',
	author: 'Havre De Grace',
	twitterCard: 'summary_large_image',
	twitterTitle: 'Links - Havre De Grace',
	twitterDescription: 'All links for Havre De Grace music and contact',
	twitterImage: '/images/media-pic-square.jpg',
})
</script>