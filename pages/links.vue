<template>
	<div class="min-h-screen bg-black text-white">
		<!-- Hero Section -->
		<section class="pt-4 md:pt-16 pb-0 px-6">
			<div class="max-w-2xl mx-auto text-center">
				<img class="max-w-[125px] md:max-w-[200px] mx-auto mt-4" src="@/assets/images/logo-white.png" alt="Havre De Grace">
			</div>
		</section>

		<!-- Links Section -->
		<section class="py-8 px-6">
			<div class="max-w-2xl mx-auto space-y-4">

				<!-- Spotify -->
				<a :href="links.spotify.artist" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/spotify.png" alt="Spotify" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Spotify</span>
				</a>

				<!-- Apple Music -->
				<a :href="links.appleMusic.artist" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/apple-music.png" alt="Apple Music" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Apple Music</span>
				</a>

				<!-- YouTube Music -->
				<a :href="links.youtubeMusic.artist" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/youtube-music.png" alt="YouTube Music" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">YouTube Music</span>
				</a>

				<!-- Amazon Music -->
				<a :href="links.amazonMusic.artist" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="/assets/images/amazon-music.png" alt="Amazon Music" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Amazon Music</span>
				</a>

				<!-- Bandcamp -->
				<a :href="links.bandcamp.artist" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/bandcamp.png" alt="Bandcamp" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Bandcamp</span>
				</a>

				<!-- Soundcloud -->
				<a :href="links.soundcloud.artist" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/soundcloud.png" alt="Soundcloud" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Soundcloud</span>
				</a>

				<!-- YouTube -->
				<a :href="links.youtube" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/youtube.png" alt="YouTube Channel" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">YouTube</span>
				</a>

				<!-- Instagram -->
				<a :href="links.instagram" target="_blank" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<img src="@/assets/images/instagram.png" alt="Instagram" class="h-6 w-6 flex-shrink-0">
					<span class="text-lg font-semibold">Instagram</span>
				</a>

				<!-- Homepage -->
				<NuxtLink to="/" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
					<svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
						<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
					</svg>
					<span class="text-lg font-semibold">Official Website</span>
				</NuxtLink>

				<!-- Email -->
				<a :href="`mailto:${links.email}`" class="flex items-center gap-4 p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
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
import links from "~/assets/links.json"

const config = useRuntimeConfig()

useSeoMeta({
	title: 'Links | Havre De Grace Music',
	description: 'All links for Havre De Grace music - Stream on Spotify, Apple Music, YouTube Music, Amazon Music, and Bandcamp. Official website, social media, and booking contact for independent singer-songwriter.',
	ogTitle: 'Links - Havre De Grace Music',
	ogDescription: 'Find all music streaming links and contact information for independent singer-songwriter Havre De Grace.',
	ogImage: `${config.public.siteUrl}/images/media-pic-square.jpg`,
	keywords: 'Havre De Grace links, Havre De Grace music links, Havre De Grace social media, Havre De Grace music streaming, stream Havre De Grace, Havre De Grace Spotify, Havre De Grace Apple Music',
	author: 'Havre De Grace',
	twitterCard: 'summary_large_image',
	twitterTitle: 'Links - Havre De Grace Music',
	twitterDescription: 'All links for Havre De Grace music streaming and contact',
	twitterImage: `${config.public.siteUrl}/images/media-pic-square.jpg`,
	robots: 'index, follow',
	canonical: `${config.public.siteUrl}/links`,
})
</script>