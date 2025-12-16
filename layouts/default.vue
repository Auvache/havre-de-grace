<template>
	<div>
		<hamburger />
		<main>
			<slot />
		</main>
		<footer class="py-8 px-6 bg-black border-t border-zinc-900">
			<div class="max-w-6xl mx-auto text-center text-white text-sm">
				<p>&copy; 2025 Havre De Grace. All rights reserved.</p>
			</div>
		</footer>
	</div>
</template>
<script setup lang="ts">
</script>