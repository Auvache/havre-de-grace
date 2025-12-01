<template>
	<div class="min-h-screen bg-black text-white">
		<!-- Hero Section - Strong Contrast & Alignment -->
		<section class="min-h-screen flex items-center justify-center px-6">
			<div class="max-w-4xl mx-auto text-center">
				<!-- Large Hero Text - Contrast -->
				<h1 class="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
					HAVRE DE GRACE
				</h1>

				<!-- Subheading - Proximity to title, lighter contrast -->
				<p class="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
					Solo music project exploring [your genre/style]
				</p>

				<!-- CTA Buttons - Repetition of style, proper spacing -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a
							href="#listen"
							class="px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
					>
						Listen Now
					</a>
					<a
							href="#about"
							class="px-8 py-4 border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-colors"
					>
						About
					</a>
				</div>
			</div>
		</section>

		<!-- Listen Section - Repetition & Alignment -->
		<section id="listen" class="py-24 px-6 bg-zinc-900">
			<div class="max-w-6xl mx-auto">
				<!-- Section Header - Consistent alignment -->
				<h2 class="text-4xl md:text-5xl font-bold mb-4">
					Listen
				</h2>
				<div class="w-24 h-1 bg-white mb-12"></div>

				<!-- Content Grid - Proximity grouping -->
				<div class="grid md:grid-cols-2 gap-8">
					<!-- Latest Release -->
					<div class="space-y-4">
						<h3 class="text-2xl font-semibold text-gray-300">Latest Release</h3>
						<div class="aspect-square bg-zinc-800 flex items-center justify-center">
							<!-- Replace with album art -->
							<span class="text-gray-600 text-sm">Album Art</span>
						</div>
						<div>
							<p class="text-xl font-semibold">Song Title</p>
							<p class="text-gray-400">Album Name • 2025</p>
						</div>
						<!-- Streaming Links - Repetition -->
						<div class="flex gap-4 pt-4">
							<a href="#" class="text-gray-400 hover:text-white transition-colors">Spotify</a>
							<a href="#" class="text-gray-400 hover:text-white transition-colors">Apple Music</a>
							<a href="#" class="text-gray-400 hover:text-white transition-colors">Bandcamp</a>
						</div>
					</div>

					<!-- Embedded Player or Second Release -->
					<div class="space-y-4">
						<h3 class="text-2xl font-semibold text-gray-300">Featured Track</h3>
						<div class="aspect-square bg-zinc-800 flex items-center justify-center">
							<!-- Embed Spotify/Bandcamp player here -->
							<span class="text-gray-600 text-sm">Embed Player</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- About Section - Contrast with background change -->
		<section id="about" class="py-24 px-6 bg-black">
			<div class="max-w-4xl mx-auto">
				<!-- Section Header - Repetition of style -->
				<h2 class="text-4xl md:text-5xl font-bold mb-4">
					About
				</h2>
				<div class="w-24 h-1 bg-white mb-12"></div>

				<!-- Content - Left-aligned for readability, proper line length -->
				<div class="space-y-6 text-lg text-gray-300 leading-relaxed">
					<p>
						Havre De Grace is the solo project of [Your Name], creating [describe your sound/style].
					</p>
					<p>
						[Add more about your musical journey, influences, or what drives your music]
					</p>
					<p>
						[Perhaps mention instruments, recording process, or what makes your music unique]
					</p>
				</div>
			</div>
		</section>

		<!-- Shows/Events Section - Repetition of layout pattern -->
		<section id="shows" class="py-24 px-6 bg-zinc-900">
			<div class="max-w-6xl mx-auto">
				<h2 class="text-4xl md:text-5xl font-bold mb-4">
					Shows
				</h2>
				<div class="w-24 h-1 bg-white mb-12"></div>

				<!-- Show listings - Alignment & Proximity -->
				<div class="space-y-6">
					<div class="border-l-4 border-white pl-6 py-4">
						<p class="text-sm text-gray-400 mb-1">January 15, 2025</p>
						<h3 class="text-2xl font-semibold mb-1">Venue Name</h3>
						<p class="text-gray-400">City, State</p>
					</div>

					<div class="border-l-4 border-white pl-6 py-4">
						<p class="text-sm text-gray-400 mb-1">February 20, 2025</p>
						<h3 class="text-2xl font-semibold mb-1">Another Venue</h3>
						<p class="text-gray-400">City, State</p>
					</div>

					<!-- Add more shows or "No upcoming shows" message -->
				</div>
			</div>
		</section>

		<!-- Contact/Social Section - Strong contrast footer -->
		<section class="py-24 px-6 bg-black border-t border-zinc-800">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-4xl md:text-5xl font-bold mb-4">
					Connect
				</h2>
				<div class="w-24 h-1 bg-white mb-12 mx-auto"></div>

				<!-- Social Links - Repetition of spacing -->
				<div class="flex flex-wrap justify-center gap-8 text-lg">
					<a href="#" class="text-gray-400 hover:text-white transition-colors">Instagram</a>
					<a href="#" class="text-gray-400 hover:text-white transition-colors">Spotify</a>
					<a href="#" class="text-gray-400 hover:text-white transition-colors">Bandcamp</a>
					<a href="#" class="text-gray-400 hover:text-white transition-colors">YouTube</a>
					<a href="mailto:contact@havredegracemusic.com" class="text-gray-400 hover:text-white transition-colors">Email</a>
				</div>
			</div>
		</section>

		<!-- Footer - Subtle, aligned -->
		<footer class="py-8 px-6 bg-black border-t border-zinc-900">
			<div class="max-w-6xl mx-auto text-center text-gray-600 text-sm">
				<p>&copy; 2025 Havre De Grace. All rights reserved.</p>
			</div>
		</footer>
	</div>
</template>

<script setup lang="ts">
useSeoMeta({
	title: 'Havre De Grace - Solo Music Project',
	description: 'Official website of Havre De Grace - Solo music project featuring original songs and recordings',
	ogTitle: 'Havre De Grace',
	ogDescription: 'Official website of Havre De Grace - Solo music project featuring original songs and recordings',
	ogImage: '/og-image.jpg', // Add an Open Graph image later
})
</script>