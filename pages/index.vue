<template>
	<div class="min-h-screen bg-gray-50">
		<div class="container mx-auto px-4 py-16">
			<h1 class="text-4xl font-bold text-center text-gray-900 mb-8">
				Welcome to My Nuxt Site
			</h1>
			<p class="text-xl text-center text-gray-600">
				Your SSG site is ready to go!
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
useSeoMeta({
	title: 'Home - My Nuxt Site',
	description: 'Welcome to my statically generated Nuxt site',
	ogTitle: 'Home - My Nuxt Site',
	ogDescription: 'Welcome to my statically generated Nuxt site',
})
</script>