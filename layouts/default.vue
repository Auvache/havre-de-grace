<template>
	<div>
		<header class="bg-white shadow">
			<nav class="container mx-auto px-4 py-4">
				<NuxtLink to="/" class="text-xl font-bold text-gray-900">
					My Site
				</NuxtLink>
			</nav>
		</header>

		<main>
			<slot />
		</main>

		<footer class="bg-gray-800 text-white py-8 mt-16">
			<div class="container mx-auto px-4 text-center">
				<p>&copy; 2024 Your Site Name</p>
			</div>
		</footer>
	</div>
</template>