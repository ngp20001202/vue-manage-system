import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useViewport() {
	const width = ref(window.innerWidth);

	const onResize = () => {
		width.value = window.innerWidth;
	};

	onMounted(() => {
		window.addEventListener('resize', onResize);
	});

	onUnmounted(() => {
		window.removeEventListener('resize', onResize);
	});

	return {
		width,
		isMobile: computed(() => width.value < 768),
		isTablet: computed(() => width.value >= 768 && width.value < 992),
		isDesktop: computed(() => width.value >= 992),
	};
}
