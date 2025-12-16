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
					Music by Stefan Auvache Bradley
				</p>

				<!-- CTA Buttons - Repetition of style, proper spacing -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<a
							href="#listen"
							class="px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
					>
						Listen Now
					</a>
				</div>
			</div>
		</section>

		<section id="listen" class="py-24 px-6 bg-zinc-900">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-4xl md:text-5xl font-bold mb-4">
					Music
				</h2>
				<div class="w-24 h-1 bg-white mb-12 mx-auto"></div>

				<div>
					<div class="space-y-4">
						<div class="mb-4">
							<div class="abg-zinc-800 flex items-center justify-center mb-4">
								<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/4Jnsd2fzJvuRdIAU4wRK1e?utm_source=generator&theme=0" width="100%" height="700" frameBorder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
							</div>
							<p class="text-sm text-gray-400">
								Latest Release: I Want to Be Yours and Other Songs • Released July 2025
							</p>
						</div>
						<div class="flex gap-4 align-middle justify-center text-sm">
							<a href="https://open.spotify.com/album/5eKwmWSEEHLnJ8vkiuajYi?si=AsSUN9OuQEitWor2eZoZYg" target="_blank" class="text-gray-400 hover:text-white transition-colors">Spotify</a>
							<a href="https://music.apple.com/us/album/i-want-to-be-yours-and-other-songs/1825329218" target="_blank" class="text-gray-400 hover:text-white transition-colors">Apple Music</a>
							<!--							<a href="#" class="text-gray-400 hover:text-white transition-colors">Bandcamp</a>-->
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Shows/Events Section - Repetition of layout pattern -->
<!--		<section id="shows" class="py-24 px-6 bg-zinc-900">-->
<!--			<div class="max-w-6xl mx-auto">-->
<!--				<h2 class="text-4xl md:text-5xl font-bold mb-4">-->
<!--					Shows-->
<!--				</h2>-->
<!--				<div class="w-24 h-1 bg-white mb-12"></div>-->

<!--				&lt;!&ndash; Show listings - Alignment & Proximity &ndash;&gt;-->
<!--				<div class="space-y-6">-->
<!--					<div class="border-l-4 border-white pl-6 py-4">-->
<!--						<p class="text-sm text-gray-400 mb-1">January 15, 2025</p>-->
<!--						<h3 class="text-2xl font-semibold mb-1">Venue Name</h3>-->
<!--						<p class="text-gray-400">City, State</p>-->
<!--					</div>-->

<!--					<div class="border-l-4 border-white pl-6 py-4">-->
<!--						<p class="text-sm text-gray-400 mb-1">February 20, 2025</p>-->
<!--						<h3 class="text-2xl font-semibold mb-1">Another Venue</h3>-->
<!--						<p class="text-gray-400">City, State</p>-->
<!--					</div>-->

<!--					&lt;!&ndash; Add more shows or "No upcoming shows" message &ndash;&gt;-->
<!--				</div>-->
<!--			</div>-->
<!--		</section>-->

		<!-- Contact/Social Section - Strong contrast footer -->
		<section class="py-24 px-6 bg-black border-t border-zinc-800">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="text-4xl md:text-5xl font-bold mb-4">
					Connect
				</h2>
				<div class="w-24 h-1 bg-white mb-12 mx-auto"></div>

				<!-- Social Links - Repetition of spacing -->
				<div class="flex flex-wrap justify-center gap-8 text-lg">
<!--					<a href="#" class="text-gray-400 hover:text-white transition-colors">Instagram</a>-->
					<a href="https://open.spotify.com/artist/4Jnsd2fzJvuRdIAU4wRK1e?si=nBcKfpp2TUeM3tBRmyCUDA" target="_blank" class="text-gray-400 hover:text-white transition-colors">Spotify</a>
<!--					<a href="#" class="text-gray-400 hover:text-white transition-colors">Bandcamp</a>-->
<!--					<a href="#" class="text-gray-400 hover:text-white transition-colors">YouTube</a>-->
					<a href="mailto:booking@havredegracemusic.com" class="text-gray-400 hover:text-white transition-colors">Email</a>
					<NuxtLink to="/press" class="text-gray-400 hover:text-white transition-colors">Press Kit</NuxtLink>
				</div>
			</div>
		</section>
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