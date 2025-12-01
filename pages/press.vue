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
					Quick Bio
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>
				<p class="text-lg text-gray-300 leading-relaxed">
					Havre De Grace is the independent singer-songwriter project of Portland-based artist Stefan Auvache Bradley. Influenced by artists like Bob Dylan, Jack White, Led Zeppelin, John Mayer, and The Tallest Man on Earth, Stefan delivers a raw, energetic, in-the-moment performance with nothing but a guitar and his vocal cords. Above all, Havre De Grace is about telling stories. Debut release - "I Want to Be Yours and Other Songs" was released in summer 2025.
				</p>
			</div>
		</section>

		<!-- Press Photos -->
<!--		<section class="py-16 px-6 bg-black">-->
<!--			<div class="max-w-6xl mx-auto">-->
<!--				<h2 class="text-3xl md:text-4xl font-bold mb-4">-->
<!--					Press Photos-->
<!--				</h2>-->
<!--				<div class="w-24 h-1 bg-white mb-8"></div>-->
<!--				<p class="text-gray-400 mb-8">-->
<!--					High-resolution photos for promotional use. Right-click to download or use the download button below each image.-->
<!--				</p>-->

<!--				&lt;!&ndash; Photo Grid &ndash;&gt;-->
<!--				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">-->
<!--					&lt;!&ndash; Photo 1 &ndash;&gt;-->
<!--					<div class="space-y-3">-->
<!--						<div class="aspect-square bg-zinc-800 flex items-center justify-center">-->
<!--							&lt;!&ndash; Replace with actual image &ndash;&gt;-->
<!--							<img src="/press/photo-1.jpg" alt="Havre De Grace press photo 1" class="w-full h-full object-cover" />-->
<!--							&lt;!&ndash; Placeholder if no image yet &ndash;&gt;-->
<!--							&lt;!&ndash; <span class="text-gray-600">Press Photo 1</span> &ndash;&gt;-->
<!--						</div>-->
<!--						<div class="text-sm">-->
<!--							<p class="text-gray-400">Photo by [Photographer Name]</p>-->
<!--							<a href="/press/photo-1-highres.jpg" download class="text-white hover:text-gray-300 underline">-->
<!--								Download High-Res-->
<!--							</a>-->
<!--						</div>-->
<!--					</div>-->

<!--					&lt;!&ndash; Photo 2 &ndash;&gt;-->
<!--					<div class="space-y-3">-->
<!--						<div class="aspect-square bg-zinc-800 flex items-center justify-center">-->
<!--							<img src="/press/photo-2.jpg" alt="Havre De Grace press photo 2" class="w-full h-full object-cover" />-->
<!--							&lt;!&ndash; <span class="text-gray-600">Press Photo 2</span> &ndash;&gt;-->
<!--						</div>-->
<!--						<div class="text-sm">-->
<!--							<p class="text-gray-400">Photo by [Photographer Name]</p>-->
<!--							<a href="/press/photo-2-highres.jpg" download class="text-white hover:text-gray-300 underline">-->
<!--								Download High-Res-->
<!--							</a>-->
<!--						</div>-->
<!--					</div>-->

<!--					&lt;!&ndash; Photo 3 &ndash;&gt;-->
<!--					<div class="space-y-3">-->
<!--						<div class="aspect-square bg-zinc-800 flex items-center justify-center">-->
<!--							<img src="/press/photo-3.jpg" alt="Havre De Grace press photo 3" class="w-full h-full object-cover" />-->
<!--							&lt;!&ndash; <span class="text-gray-600">Press Photo 3</span> &ndash;&gt;-->
<!--						</div>-->
<!--						<div class="text-sm">-->
<!--							<p class="text-gray-400">Photo by [Photographer Name]</p>-->
<!--							<a href="/press/photo-3-highres.jpg" download class="text-white hover:text-gray-300 underline">-->
<!--								Download High-Res-->
<!--							</a>-->
<!--						</div>-->
<!--					</div>-->
<!--				</div>-->

<!--				&lt;!&ndash; Download All Photos Button &ndash;&gt;-->
<!--				<div class="text-center">-->
<!--					<a-->
<!--							href="/press/havre-de-grace-press-photos.zip"-->
<!--							download-->
<!--							class="inline-block px-8 py-4 bg-white text-black font-semibold hover:bg-gray-200 transition-colors"-->
<!--					>-->
<!--						Download All Photos-->
<!--					</a>-->
<!--				</div>-->
<!--			</div>-->
<!--		</section>-->

		<!-- Music Player -->
		<section class="py-16 px-6 bg-zinc-900">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Music
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<!-- Embedded Player -->
				<div class="mb-8">
					<div class="abg-zinc-800 flex items-center justify-center mb-4">
						<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/artist/4Jnsd2fzJvuRdIAU4wRK1e?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
					</div>
					<p class="text-sm text-gray-400">
						Latest Release: I Want to Be Yours and Other Songs • Released July 2025
					</p>
				</div>

				<!-- Downloadable Tracks -->
<!--				<div class="space-y-4">-->
<!--					<h3 class="text-xl font-semibold mb-4">Download Tracks</h3>-->

<!--					<div class="border-l-4 border-white pl-4 py-2 flex justify-between items-center">-->
<!--						<div>-->
<!--							<p class="font-semibold">[Track Name 1]</p>-->
<!--							<p class="text-sm text-gray-400">[Album Name] • [Year]</p>-->
<!--						</div>-->
<!--						<a href="/press/audio/track-1.mp3" download class="text-white hover:text-gray-300 underline text-sm">-->
<!--							Download MP3-->
<!--						</a>-->
<!--					</div>-->

<!--					<div class="border-l-4 border-white pl-4 py-2 flex justify-between items-center">-->
<!--						<div>-->
<!--							<p class="font-semibold">[Track Name 2]</p>-->
<!--							<p class="text-sm text-gray-400">[Album Name] • [Year]</p>-->
<!--						</div>-->
<!--						<a href="/press/audio/track-2.mp3" download class="text-white hover:text-gray-300 underline text-sm">-->
<!--							Download MP3-->
<!--						</a>-->
<!--					</div>-->

<!--					<div class="border-l-4 border-white pl-4 py-2 flex justify-between items-center">-->
<!--						<div>-->
<!--							<p class="font-semibold">[Track Name 3]</p>-->
<!--							<p class="text-sm text-gray-400">[Album Name] • [Year]</p>-->
<!--						</div>-->
<!--						<a href="/press/audio/track-3.mp3" download class="text-white hover:text-gray-300 underline text-sm">-->
<!--							Download MP3-->
<!--						</a>-->
<!--					</div>-->
<!--				</div>-->
			</div>
		</section>

		<!-- Videos -->
		<section class="py-16 px-6 bg-black">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Videos
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<div class="space-y-8">
					<!-- Video 1 -->
					<div>
						<div class="aspect-video bg-zinc-800 flex items-center justify-center mb-3">
							<!-- Replace with actual YouTube/Vimeo embed -->
							<span class="text-gray-600">[Embed YouTube/Vimeo video]</span>
						</div>
						<p class="text-lg font-semibold">[Video Title/Song Name]</p>
						<p class="text-sm text-gray-400">[Year] • [Description]</p>
					</div>

					<!-- Video 2 -->
					<div>
						<div class="aspect-video bg-zinc-800 flex items-center justify-center mb-3">
							<span class="text-gray-600">[Embed YouTube/Vimeo video]</span>
						</div>
						<p class="text-lg font-semibold">[Video Title/Song Name]</p>
						<p class="text-sm text-gray-400">[Year] • [Description]</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Full Bio -->
		<section class="py-16 px-6 bg-zinc-900">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Full Biography
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<div class="mb-8">
					<div class="space-y-4 text-gray-300 leading-relaxed">
						<p>
							Havre De Grace is the independent singer-songwriter project of Portland, Oregon-based artist Stefan Auvache Bradley. Self-taught on guitar and driven by a passion for stories, Stefan creates music with a simple approach: channel as much emotion as possible into recordings featuring nothing but guitar and raw vocals.
						</p>
						<p>
							Drawing from influences spanning folk icons like Bob Dylan and The Tallest Man on Earth to rock legends like Led Zeppelin, Heart, and Queen, Havre De Grace occupies a space between intimate storytelling and unfiltered emotional expression. The songs explore complex themes—desire, creativity, fame—while other times simply tell stories that have resonated throughout Stefan's life.
						</p>
						<p>
							Music doesn't need to be perfect to connect with people. Havre De Grace captures performances largely as live takes with minimal overdubbing. It's about preserving the energy and immediacy and authenticity of the moment. The project's debut release, "I Want to Be Yours and Other Songs," compiles these home recordings for a summer 2025 release.
						</p>
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

				<div class="grid md:grid-cols-2 gap-6">
					<div>
						<p class="text-sm text-gray-400 mb-1">Genre</p>
						<p class="text-lg font-semibold">Independent Singer-Songwriter</p>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-1">Based In</p>
						<p class="text-lg font-semibold">Vancouver, Washington</p>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-1">Active Since</p>
						<p class="text-lg font-semibold">2025</p>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-1">Members</p>
						<p class="text-lg font-semibold">Solo Project / Stefan Auvache Bradley</p>
					</div>

<!--					<div>-->
<!--						<p class="text-sm text-gray-400 mb-1">Notable Achievement</p>-->
<!--						<p class="text-lg font-semibold">[e.g., "10K+ streams on Spotify"]</p>-->
<!--					</div>-->

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

		<!-- Press Coverage (Optional - remove if you don't have any yet) -->
<!--		<section class="py-16 px-6 bg-black">-->
<!--			<div class="max-w-4xl mx-auto">-->
<!--				<h2 class="text-3xl md:text-4xl font-bold mb-4">-->
<!--					Press Coverage-->
<!--				</h2>-->
<!--				<div class="w-24 h-1 bg-white mb-8"></div>-->

<!--				<div class="space-y-8">-->
<!--					&lt;!&ndash; Quote 1 &ndash;&gt;-->
<!--					<div class="border-l-4 border-white pl-6 py-4">-->
<!--						<blockquote class="text-lg text-gray-300 italic mb-3">-->
<!--							"[Pull quote from review or article]"-->
<!--						</blockquote>-->
<!--						<p class="text-sm text-gray-400">-->
<!--							— [Publication Name], [Month Year]-->
<!--						</p>-->
<!--						<a href="#" class="text-white hover:text-gray-300 underline text-sm">Read full article →</a>-->
<!--					</div>-->

<!--					&lt;!&ndash; Quote 2 &ndash;&gt;-->
<!--					<div class="border-l-4 border-white pl-6 py-4">-->
<!--						<blockquote class="text-lg text-gray-300 italic mb-3">-->
<!--							"[Pull quote from review or article]"-->
<!--						</blockquote>-->
<!--						<p class="text-sm text-gray-400">-->
<!--							— [Publication Name], [Month Year]-->
<!--						</p>-->
<!--						<a href="#" class="text-white hover:text-gray-300 underline text-sm">Read full article →</a>-->
<!--					</div>-->
<!--				</div>-->
<!--			</div>-->
<!--		</section>-->

		<!-- Contact Information -->
		<section class="py-16 px-6 bg-black">
			<div class="max-w-4xl mx-auto">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">
					Contact
				</h2>
				<div class="w-24 h-1 bg-white mb-8"></div>

				<div class="space-y-6">

					<div>
						<p class="text-sm text-gray-400 mb-1">General Inquiries</p>
						<a href="mailto:contact@havredegracemusic.com" class="text-xl text-white hover:text-gray-300">
							contact@havredegracemusic.com
						</a>
						<a href="mailto:contact@havredegracemusic.com" class="text-xl text-white hover:text-gray-300">
							contact@havredegracemusic.com
						</a>
					</div>

					<div>
						<p class="text-sm text-gray-400 mb-2">Social Media</p>
						<div class="flex gap-6 text-lg">
							<a href="#" class="text-white hover:text-gray-300">Instagram</a>
							<a href="#" class="text-white hover:text-gray-300">Spotify</a>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Download Full Press Kit -->
<!--		<section class="py-16 px-6 bg-black border-t border-zinc-800">-->
<!--			<div class="max-w-4xl mx-auto text-center">-->
<!--				<h2 class="text-3xl md:text-4xl font-bold mb-4">-->
<!--					Download Complete Press Kit-->
<!--				</h2>-->
<!--				<div class="w-24 h-1 bg-white mb-8 mx-auto"></div>-->
<!--				<p class="text-gray-400 mb-8">-->
<!--					Get all press materials in one convenient package (photos, bios, fact sheet, audio)-->
<!--				</p>-->
<!--				<a-->
<!--						href="/press/havre-de-grace-press-kit-complete.zip"-->
<!--						download-->
<!--						class="inline-block px-12 py-5 bg-white text-black text-lg font-semibold hover:bg-gray-200 transition-colors"-->
<!--				>-->
<!--					Download Press Kit (.zip)-->
<!--				</a>-->
<!--			</div>-->
<!--		</section>-->
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