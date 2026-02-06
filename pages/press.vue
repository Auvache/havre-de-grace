<template>
	<div class="min-h-screen bg-black text-white">
		<!-- Hero Section -->
		<section class="pt-32 pb-16 px-6">
			<div class="max-w-4xl mx-auto text-center">
				<h1 class="text-5xl md:text-7xl font-bold mb-6">
					Press Kit
				</h1>
				<p class="text-xl text-gray-400">
					HAVRE DE GRACE
				</p>
			</div>
		</section>

		<!-- Quick Bio -->
		<section class="py-16 px-6 bg-zinc-900">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Bio
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>
				<div class="flex flex-col sm:flex-row sm:items-center gap-6">
					<img
							src="/images/media-pic-square.jpg"
							alt="Havre De Grace"
							class="w-full sm:w-auto sm:max-w-[300px]"
					>
					<div class="text-lg text-gray-300 leading-relaxed">
						<p class="pb-3">Havre De Grace is the independent singer-songwriter project of Stefan Auvache Bradley.</p>
						<p class="pb-3">Influenced by artists like Bob Dylan, Led Zeppelin, Jack White, John Mayer, and The Tallest Man on Earth, Stefan aims to deliver an energetic, in-the-moment performance with nothing but his guitar and his voice.</p>
						<p>Stefan's debut release - "I Want to Be Yours and Other Songs" came out in summer 2025.</p>
					</div>
				</div>
				

			</div>
		</section>

		<!-- Key Facts -->
		<section class="py-16 px-6 bg-black">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Key Facts
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<div class="grid md:grid-cols-1 gap-6">

					<div>
						<p class="text-sm text-gray-400 mb-1">Based In</p>
						<p class="text-lg font-semibold">Vancouver, Washington</p>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-1">Active Since</p>
						<p class="text-lg font-semibold">2025</p>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-1">Genre</p>
						<p class="text-lg font-semibold">Independent Singer-Songwriter</p>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-1">Latest Release</p>
						<p class="text-lg font-semibold">I Want to Be Yours and Other Songs (2025)</p>
					</div>

				</div>
			</div>
		</section>

		<!-- Discography -->
		<section class="py-16 px-6 bg-zinc-900">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Discography
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<div class="space-y-6">
					<!-- I Want to Be Yours and Other Songs-->
					<div class="py-4">
						<div class="flex flex-col sm:flex-row gap-6 sm:items-center">
							<img src="/assets/images/i-want-to-be-yours-and-other-songs-album-cover.jpg" alt="I Want to Be Yours and Other Songs album cover" class="w-full sm:w-auto sm:max-w-[150px] flex-shrink-0">
							<div class="text-center sm:text-left">
								<h3 class="text-2xl font-semibold mb-1">I Want to Be Yours and Other Songs</h3>
								<p class="text-gray-400 mb-3">Album • July 2025 </p>
								<div class="flex flex-wrap justify-start gap-4 text-lg">
									<a :href="links.spotify.iWantToBeYoursAndOtherSongs" target="_blank">
										<img src="/assets/images/spotify.png" alt="Listen on Spotify" class="h-8 w-auto hover:opacity-80 transition-opacity">
									</a>

									<a :href="links.appleMusic.iWantToBeYoursAndOtherSongs" target="_blank">
										<img src="/assets/images/apple-music.png" alt="Listen on Apple Music" class="h-8 w-auto hover:opacity-80 transition-opacity">
									</a>

									<a :href="links.amazonMusic.iWantToBeYoursAndOtherSongs" target="_blank">
										<img src="/assets/images/amazon-music.png" alt="Listen on Amazon Music" class="h-8 w-auto hover:opacity-80 transition-opacity">
									</a>

									<a :href="links.youtubeMusic.iWantToBeYoursAndOtherSongs" target="_blank">
										<img src="/assets/images/youtube-music.png" alt="Listen on YouTube Music" class="h-8 w-auto hover:opacity-80 transition-opacity">
									</a>

									<a :href="links.bandcamp.iWantToBeYoursAndOtherSongs" target="_blank">
										<img src="/assets/images/bandcamp.png" alt="Listen on Bandcamp" class="h-8 w-auto hover:opacity-80 transition-opacity">
									</a>

									<a :href="links.soundcloud.iWantToBeYoursAndOtherSongs" target="_blank">
										<img src="/assets/images/soundcloud.png" alt="Listen on Soundcloud" class="h-8 w-auto hover:opacity-80 transition-opacity">
									</a>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>
		</section>

		<section class="py-16 px-6 bg-black">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Booking
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<div class="space-y-6">

					<div>
						<p class="text-sm text-gray-400 mb-1">Booking and Other Inquires</p>
						<a :href="`mailto:${links.email}`" class="text-lg text-white hover:text-gray-300">
							{{links.email}}
						</a>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-1">Press Photos</p>
						<div></div>
						<div class="flex gap-4 pt-2">
							<a
									href="/images/media-pic-square.jpg"
									download="havre-de-grace-press-photo-square.jpg"
									class="text-blue-400 hover:text-blue-300 underline"
							>
								Download Press Photo (Square)
							</a>
							<a
									href="/images/media-pic-wide.jpg"
									download="havre-de-grace-press-photo-wide.jpg"
									class="text-blue-400 hover:text-blue-300 underline"
							>
								Download Press Photo (Wide)
							</a>
						</div>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-2">Social Media</p>
						<div class="flex flex-wrap justify-start gap-4 text-lg mt-3">
							<a :href="links.instagram" target="_blank">
								<img src="/assets/images/instagram.png" alt="Instagram" class="h-8 w-auto hover:opacity-80 transition-opacity">
							</a>

							<a :href="links.youtube" target="_blank">
								<img src="/assets/images/youtube.png" alt="YouTube Channel" class="h-8 w-auto hover:opacity-80 transition-opacity">
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import links from "~/assets/links.json";

useSeoMeta({
	title: 'Press Kit | Havre De Grace',
	description: 'Official press kit for Havre De Grace (Stefan Auvache Bradley) - Independent singer-songwriter from Vancouver, WA. Bio, photos, music, and booking information for media inquiries.',
	ogTitle: 'Press Kit | Havre De Grace',
	ogDescription: 'Official press kit including bio, press photos, discography, and contact information for Havre De Grace.',
	ogImage: '/images/media-pic-square.jpg',
	keywords: 'Havre De Grace press kit, Stefan Auvache Bradley, Havre De Grace bio, Havre De Grace booking, independent artist press kit, music press photos',
	author: 'Havre De Grace',
	twitterCard: 'summary_large_image',
	twitterTitle: 'Press Kit - Havre De Grace',
	twitterDescription: 'Official press kit for independent singer-songwriter Havre De Grace',
	twitterImage: '/images/media-pic-wide.jpg',
})
</script>