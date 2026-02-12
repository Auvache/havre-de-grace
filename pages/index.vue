<template>
	<div class="min-h-screen bg-black text-white">
		<section class="bg-textured-forest relative min-h-screen flex items-center justify-center px-6 overflow-hidden ">
			<div class="relative z-10 max-w-4xl mx-auto text-center">
				<!-- Large Hero Text - Contrast -->
			<h1 class="sr-only">
				HAVRE DE GRACE
			</h1>
			<img class="w-[90%] max-w-[300px] mb-12 mx-auto" src="@/assets/images/logo-white.png" alt="Havre De Grace">

				<div class="flex flex-wrap justify-center gap-6 mb-12 max-w-2xl mx-auto">
					<a :href="links.spotify.artist" target="_blank">
						<img src="/assets/images/spotify.png" alt="Listen on Spotify" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.appleMusic.artist" target="_blank">
						<img src="/assets/images/apple-music.png" alt="Listen on Apple Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.amazonMusic.artist" target="_blank">
						<img src="/assets/images/amazon-music.png" alt="Listen on Amazon Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.youtubeMusic.artist" target="_blank">
						<img src="/assets/images/youtube-music.png" alt="Listen on YouTube Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.bandcamp.artist" target="_blank">
						<img src="/assets/images/bandcamp.png" alt="Listen on Bandcamp" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>
				</div>

				<!-- CTA Buttons - Repetition of style, proper spacing -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center">

					<a href="#listen"
					class="px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
					>
					Listen Now
					</a>
				</div>
			</div>
		</section>

		<section id="listen" class="pt-12 px-6 bg-zinc-900">
			<div class="max-w-4xl mx-auto text-center">
			<h2 class="text-4xl md:text-3xl font-bold mb-8">I Want to Be Yours and Other Songs</h2>
			<img style="width: 500px; max-width: 100%;" class="mx-auto mb-6" src="/assets/images/i-want-to-be-yours-and-other-songs-album-cover.jpg" alt="I Want to Be Yours and Other Songs album cover by Havre De Grace">
				<p class="mb-6">Listen anywhere you stream music</p>
				<div class="flex flex-wrap justify-center gap-6 mb-12 max-w-2xl mx-auto">
					<a :href="links.spotify.iWantToBeYoursAndOtherSongs" target="_blank">
						<img src="/assets/images/spotify.png" alt="Listen on Spotify" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.appleMusic.iWantToBeYoursAndOtherSongs" target="_blank">
						<img src="/assets/images/apple-music.png" alt="Listen on Apple Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.amazonMusic.iWantToBeYoursAndOtherSongs" target="_blank">
						<img src="/assets/images/amazon-music.png" alt="Listen on Amazon Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.youtubeMusic.iWantToBeYoursAndOtherSongs" target="_blank">
						<img src="/assets/images/youtube-music.png" alt="Listen on YouTube Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.bandcamp.iWantToBeYoursAndOtherSongs" target="_blank">
						<img src="/assets/images/bandcamp.png" alt="Listen on Bandcamp" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>
				</div>
			</div>

			<div class="space-y-4 mt-24">
				<div class="abg-zinc-800 flex items-center justify-center max-w-4xl mx-auto">
					<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/5Lyc79cqw6P44FeVTRlBLb?utm_source=generator" width="100%" height="700" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
				</div>
			</div>
		</section>



		<section id="live" class="py-12 px-6 bg-zinc-900">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-4xl md:text-3xl font-bold mb-8">Live</h2>
				<div>
					<div class="space-y-4">
						<div class="py-3">
							<iframe width="100%" height="400" src="https://www.youtube.com/embed/3ro2I9rvQj8?si=w533QpFQK6WmQVjb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
						</div>
						<div class="py-3">
							<iframe width="100%" height="400" src="https://www.youtube.com/embed/kZckptQidYk?si=OIKBZF0Ytl93oL7S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
						</div>
						<div class="py-3">
							<iframe width="100%" height="400" src="https://www.youtube.com/embed/0JF4Pm_-mPs?si=Xybe8lcC7zaKnOvF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Contact/Social Section - Strong contrast footer -->
		<section id="connect" class="py-24 px-6 bg-black border-t border-zinc-800">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-4xl md:text-5xl font-bold mb-4">
					Connect
				</h2>
				<div class="w-24 h-1 bg-white mb-12 mx-auto"></div>
				<div class="flex flex-wrap justify-center gap-8 text-lg">
					<a :href="links.spotify.artist" target="_blank">
						<img src="/assets/images/spotify.png" alt="Listen on Spotify" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.appleMusic.artist" target="_blank">
						<img src="/assets/images/apple-music.png" alt="Listen on Apple Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.amazonMusic.artist" target="_blank">
						<img src="/assets/images/amazon-music.png" alt="Listen on Amazon Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.youtubeMusic.artist" target="_blank">
						<img src="/assets/images/youtube-music.png" alt="Listen on YouTube Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.bandcamp.artist" target="_blank">
						<img src="/assets/images/bandcamp.png" alt="Listen on Bandcamp" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.soundcloud.artist" target="_blank">
						<img src="/assets/images/soundcloud.png" alt="Listen on Soundcloud" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.youtube" target="_blank">
						<img src="/assets/images/youtube.png" alt="YouTube Channel" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="links.instagram" target="_blank">
						<img src="/assets/images/instagram.png" alt="Instagram" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a :href="`mailto:${links.email}`">
						<svg aria-label="Email" class="h-12 w-auto hover:opacity-80 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
							<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
							<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
						</svg>
					</a>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import links from '~/assets/links.json'

const config = useRuntimeConfig()

useSeoMeta({
	title: 'Havre De Grace | Official Music',
	description: 'Official website of Havre De Grace - Independent singer-songwriter music by Stefan Auvache Bradley. Stream the debut album "I Want to Be Yours and Other Songs" on Spotify, Apple Music, YouTube, and more.',
	ogTitle: 'Havre De Grace | Official Music',
	ogDescription: 'Independent singer-songwriter music from Vancouver, WA. Listen to the debut album "I Want to Be Yours and Other Songs".',
	ogImage: `${config.public.siteUrl}/images/media-pic-square.jpg`,
	keywords: 'Havre De Grace, Havre De Grace music, Havre De Grace artist, Havre De Grace musician, Stefan Auvache Bradley, Stefan Auvache Bradley music, independent singer-songwriter, independent singer-songwriter music, acoustic music, singer songwriter, Vancouver Washington music',
	author: 'Havre De Grace',
	twitterCard: 'summary_large_image',
	twitterTitle: 'Havre De Grace | Official Music',
	twitterDescription: 'Independent singer-songwriter music from Vancouver, WA. Stream "I Want to Be Yours and Other Songs".',
	twitterImage: `${config.public.siteUrl}/images/media-pic-wide.jpg`,
	robots: 'index, follow',
	canonical: `${config.public.siteUrl}/`,
})

// Add Schema.org structured data
const musicGroupSchema = useMusicGroupSchema()
const albumSchema = useMusicAlbumSchema()

useSchemaOrg([
	musicGroupSchema,
	albumSchema,
])
</script>