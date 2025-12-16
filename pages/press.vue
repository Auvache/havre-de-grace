<template>
	<div class="min-h-screen bg-black text-white">
		<!-- Hero Section -->
		<section class="pt-32 pb-16 px-6">
			<div class="max-w-4xl mx-auto text-center">
				<h1 class="text-5xl md:text-7xl font-bold mb-6">
					About
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
					Quick Bio
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>
				<div class="flex flex-col sm:flex-row sm:items-center gap-6">
					<img
							src="/images/media-pic-square.jpg"
							alt="Stefan Auvache Bradley"
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
					<!-- Release 1 -->
					<div class="border-l-4 border-white pl-6 py-4">
						<p class="text-sm text-gray-400 mb-1">July 2025</p>
						<h3 class="text-2xl font-semibold mb-1">I Want to Be Yours and Other Songs</h3>
						<p class="text-gray-400 mb-3">Album • 9 tracks</p>
						<div class="flex gap-4 text-sm">
							<a href="https://open.spotify.com/album/5eKwmWSEEHLnJ8vkiuajYi?si=cWuel9X8SyCsaR9G1NfFmQ" target="_blank" class="text-white hover:text-gray-300 underline">Spotify</a>
							<a href="https://music.apple.com/us/album/i-want-to-be-yours-and-other-songs/1825329218" target="_blank" class="text-white hover:text-gray-300 underline">Apple Music</a>
						</div>

					</div>

					<!-- Release 2 -->
<!--					<div class="border-l-4 border-white pl-6 py-4">-->
<!--						<p class="text-sm text-gray-400 mb-1">[Month Year]</p>-->
<!--						<h3 class="text-2xl font-semibold mb-1">[Album/EP/Single Name]</h3>-->
<!--						<p class="text-gray-400 mb-3">[EP/Album/Single] • [Number] tracks</p>-->
<!--						<div class="flex gap-4 text-sm">-->
<!--							<a href="#" class="text-white hover:text-gray-300 underline">Spotify</a>-->
<!--							<a href="#" class="text-white hover:text-gray-300 underline">Apple Music</a>-->
<!--						</div>-->
<!--					</div>-->

				</div>
			</div>
		</section>

		<!-- Contact Information -->
		<section class="py-16 px-6 bg-black">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Booking
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<div class="space-y-6">

					<div>
						<p class="text-sm text-gray-400 mb-1">Booking and Other Inquiries</p>
						<a href="mailto:booking@havredegracemusic.com" class="text-xl text-white hover:text-gray-300">
							booking@havredegracemusic.com
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

<!--					<div>-->
<!--						<p class="text-sm text-gray-400 mb-2">Social Media</p>-->
<!--						<div class="flex gap-6 text-lg">-->
<!--							<a href="#" class="text-white hover:text-gray-300">Instagram</a>-->
<!--							<a href="#" class="text-white hover:text-gray-300">Spotify</a>-->
<!--						</div>-->
<!--					</div>-->
				</div>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
useSeoMeta({
	title: 'Press Kit - Havre De Grace',
	description: 'Official press kit for Havre De Grace including bio, photos, music, and contact information for media and booking inquiries',
	ogTitle: 'Press Kit - Havre De Grace',
	ogDescription: 'Official press kit for Havre De Grace including bio, photos, music, and contact information',
})
</script>