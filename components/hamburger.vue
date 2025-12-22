<template>
	<div>
		<!-- Hamburger Button - Fixed to top right -->
		<button
				@click="toggleMenu"
				class="fixed top-6 right-6 z-50 w-10 h-10 flex flex-col justify-center items-center gap-1.5 focus:outline-none group"
				aria-label="Toggle menu"
		>
			<!-- Top line -->
			<span
					class="w-7 h-0.5 bg-white transition-all duration-300 ease-in-out"
					:class="isOpen ? 'rotate-45 translate-y-2' : ''"
			></span>

			<!-- Middle line -->
			<span
					class="w-7 h-0.5 bg-white transition-all duration-300 ease-in-out"
					:class="isOpen ? 'opacity-0' : 'opacity-100'"
			></span>

			<!-- Bottom line -->
			<span
					class="w-7 h-0.5 bg-white transition-all duration-300 ease-in-out"
					:class="isOpen ? '-rotate-45 -translate-y-2' : ''"
			></span>
		</button>

		<!-- Overlay - Click to close -->
		<Transition
				enter-active-class="transition-opacity duration-300 ease-out"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="transition-opacity duration-300 ease-in"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
		>
			<div
					v-if="isOpen"
					@click="closeMenu"
					class="fixed inset-0 bg-black bg-opacity-50 z-40"
					aria-hidden="true"
			></div>
		</Transition>

		<!-- Sidebar Menu -->
		<Transition
				enter-active-class="transition-transform duration-300 ease-out"
				enter-from-class="-translate-x-full"
				enter-to-class="translate-x-0"
				leave-active-class="transition-transform duration-300 ease-in"
				leave-from-class="translate-x-0"
				leave-to-class="-translate-x-full"
		>
			<nav
					v-if="isOpen"
					class="fixed top-0 left-0 h-full w-64 forest-bg z-40 shadow-2xl overflow-y-auto"
			>
				<div class="flex flex-col h-full pt-24 px-8 pb-8">
					<!-- Menu Links -->
					<ul class="space-y-6">
						<li v-for="link in menuLinks" :key="link.path">
							<NuxtLink
									:to="link.path"
									@click="closeMenu"
									class="text-white text-xl font-semibold hover:text-slate-300 transition-colors block"
							>
								{{ link.name }}
							</NuxtLink>
						</li>
					</ul>
				</div>
			</nav>
		</Transition>
	</div>
</template>

<script setup lang="ts">
const menuLinks = [
	{ name: 'Home', path: '/' },
	{ name: 'Listen', path: '/#listen' },
	{ name: 'Live Performances', path: '/#live' },
	{ name: 'About', path: '/press' },
	{ name: 'Connect', path: '/#connect' },
]

const isOpen = ref(false)

const toggleMenu = () => {
	isOpen.value = !isOpen.value
}

const closeMenu = () => {
	isOpen.value = false
}

// Close menu on route change
const route = useRoute()
watch(() => route.path, () => {
	closeMenu()
})
</script>