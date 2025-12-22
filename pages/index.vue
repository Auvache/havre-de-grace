<template>
	<div class="min-h-screen bg-black text-white">
		<section class="textured-forest-bg relative min-h-screen flex items-center justify-center px-6 overflow-hidden ">
			<div class="relative z-10 max-w-4xl mx-auto text-center">
				<!-- Large Hero Text - Contrast -->
				<h1 class="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
					HAVRE DE GRACE
				</h1>

				<div class="flex flex-wrap justify-center gap-6 mb-12">
					<a href="https://open.spotify.com/album/5eKwmWSEEHLnJ8vkiuajYi?si=HCP8CVs0QnmP-Kg63nbWWw" target="_blank">
						<img src="/assets/images/spotify.png" alt="Listen on Spotify" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a href="https://music.apple.com/us/album/i-want-to-be-yours-and-other-songs/1825329218" target="_blank">
						<img src="/assets/images/apple-music.png" alt="Listen on Apple Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a href="https://music.youtube.com/channel/UCn7MTFvOrltNAAeHCmAYnNQ?si=tJUeZJT26fu0nkpI" target="_blank">
						<img src="/assets/images/youtube-music.png" alt="Listen on YouTube Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a href="https://music.amazon.com/artists/B0G83WZY27/havre-de-grace?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_oB5r6h4YdnltmJnf90rPuppKD" target="_blank">
						<img src="/assets/images/amazon-music.png" alt="Listen on Amazon Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
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
				<img style="max-width: 500px" class="mx-auto mb-6" src="/assets/images/i-want-to-be-yours-and-other-songs-album-cover.jpg" alt="">
				<p class="mb-6">Listen anywhere you stream music</p>
				<div class="flex flex-wrap justify-center gap-6 mb-12">
					<a href="https://open.spotify.com/album/5eKwmWSEEHLnJ8vkiuajYi?si=dJ1MjraKSTCVCW3wY9fPkg" target="_blank">
						<img src="/assets/images/spotify.png" alt="Listen on Spotify" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a href="https://music.apple.com/us/album/i-want-to-be-yours-and-other-songs/1825329218" target="_blank">
						<img src="/assets/images/apple-music.png" alt="Listen on Apple Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a href="https://music.youtube.com/playlist?list=OLAK5uy_nUM_0UgLmueqyFZWiRh4DhLUf3POgcAK0&si=_o2GSs1OSzAeBN3-" target="_blank">
						<img src="/assets/images/youtube-music.png" alt="Listen on YouTube Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
					</a>

					<a href="https://music.amazon.com/albums/B0FH1WG69X?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_SyUnTtEEhS2hYZ3KM06muQPpK" target="_blank">
						<img src="/assets/images/amazon-music.png" alt="Listen on Amazon Music" class="h-12 w-auto hover:opacity-80 transition-opacity">
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

				<!-- Social Links - Repetition of spacing -->
				<div class="flex flex-wrap justify-center gap-8 text-lg">
<!--					<a href="#" class="text-gray-400 hover:text-white transition-colors">Instagram</a>-->
					<a href="https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb?si=el1o7QJyR2eZnKN0PkVXhQ" target="_blank" class="text-gray-400 hover:text-white transition-colors">Spotify</a>
<!--					<a href="#" class="text-gray-400 hover:text-white transition-colors">Bandcamp</a>-->
					<a href="https://youtube.com/@havredegracemusic?si=h8No7fUu70yMH7Bp" target="_blank" class="text-gray-400 hover:text-white transition-colors">YouTube</a>
					<a href="mailto:booking@havredegracemusic.com" class="text-gray-400 hover:text-white transition-colors">Email</a>
					<NuxtLink to="/press" class="text-gray-400 hover:text-white transition-colors">Press Kit</NuxtLink>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
useSeoMeta({
	title: 'Havre De Grace | Official Music',
	description: 'Official website of Havre De Grace - Independent singer-songwriter Stefan Auvache Bradley. Listen to "I Want to Be Yours and Other Songs" on Spotify, Apple Music, and YouTube.',
	ogTitle: 'Havre De Grace | Official Music',
	ogDescription: 'Independent singer-songwriter from Vancouver, WA. Listen to the debut album "I Want to Be Yours and Other Songs".',
	ogImage: '/images/media-pic-square.jpg',
	keywords: 'Havre De Grace, Havre De Grace music, Stefan Auvache Bradley, Stefan Auvache Bradley music, independent singer-songwriter, acoustic music, Vancouver Washington music',
	author: 'Havre De Grace',
	twitterCard: 'summary_large_image',
	twitterTitle: 'Havre De Grace | Official Music',
	twitterDescription: 'Independent singer-songwriter from Vancouver, WA. Stream "I Want to Be Yours and Other Songs".',
	twitterImage: '/images/media-pic-wide.jpg',
})
</script>