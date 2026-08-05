<template>
	<div class="animated-characters" :style="{ width: '550px', height: '400px' }">
		<!-- Purple tall rectangle - Back layer -->
		<div
			ref="purpleRef"
			class="char char-purple"
			:style="{
				left: '70px',
				width: '180px',
				height: (isTyping || isHidingPassword) ? '440px' : '400px',
				backgroundColor: '#6C3FF5',
				borderRadius: '10px 10px 0 0',
				zIndex: 1,
				transform: (passwordLength > 0 && showPassword)
					? 'skewX(0deg)'
					: (isTyping || isHidingPassword)
						? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
						: `skewX(${purplePos.bodySkew || 0}deg)`,
			}"
		>
			<div
				class="eyes"
				:style="{
					left: (passwordLength > 0 && showPassword) ? '20px'
						: isLookingAtEachOther ? '55px'
						: `${45 + purplePos.faceX}px`,
					top: (passwordLength > 0 && showPassword) ? '35px'
						: isLookingAtEachOther ? '65px'
						: `${40 + purplePos.faceY}px`,
				}"
			>
				<div
					class="eyeball"
					:style="{
						width: '18px',
						height: isPurpleBlinking ? '2px' : '18px',
						backgroundColor: 'white',
					}"
				>
					<div
						v-if="!isPurpleBlinking"
						class="pupil"
						:style="{
							width: '7px',
							height: '7px',
							backgroundColor: '#2D2D2D',
							transform: `translate(${purpleLeftPupil.x}px, ${purpleLeftPupil.y}px)`,
						}"
					/>
				</div>
				<div
					class="eyeball"
					:style="{
						width: '18px',
						height: isPurpleBlinking ? '2px' : '18px',
						backgroundColor: 'white',
					}"
				>
					<div
						v-if="!isPurpleBlinking"
						class="pupil"
						:style="{
							width: '7px',
							height: '7px',
							backgroundColor: '#2D2D2D',
							transform: `translate(${purpleRightPupil.x}px, ${purpleRightPupil.y}px)`,
						}"
					/>
				</div>
			</div>
		</div>

		<!-- Black tall rectangle - Middle layer -->
		<div
			ref="blackRef"
			class="char char-black"
			:style="{
				left: '240px',
				width: '120px',
				height: '310px',
				backgroundColor: '#2D2D2D',
				borderRadius: '8px 8px 0 0',
				zIndex: 2,
				transform: (passwordLength > 0 && showPassword)
					? 'skewX(0deg)'
					: isLookingAtEachOther
						? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
						: (isTyping || isHidingPassword)
							? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
							: `skewX(${blackPos.bodySkew || 0}deg)`,
			}"
		>
			<div
				class="eyes"
				:style="{
					left: (passwordLength > 0 && showPassword) ? '10px'
						: isLookingAtEachOther ? '32px'
						: `${26 + blackPos.faceX}px`,
					top: (passwordLength > 0 && showPassword) ? '28px'
						: isLookingAtEachOther ? '12px'
						: `${32 + blackPos.faceY}px`,
				}"
			>
				<div
					class="eyeball"
					:style="{
						width: '16px',
						height: '16px',
						backgroundColor: 'white',
					}"
				>
					<div
						class="pupil"
						:style="{
							width: '6px',
							height: '6px',
							backgroundColor: '#2D2D2D',
							transform: `translate(${blackLeftPupil.x}px, ${blackLeftPupil.y}px)`,
						}"
					/>
				</div>
				<div
					class="eyeball"
					:style="{
						width: '16px',
						height: '16px',
						backgroundColor: 'white',
					}"
				>
					<div
						class="pupil"
						:style="{
							width: '6px',
							height: '6px',
							backgroundColor: '#2D2D2D',
							transform: `translate(${blackRightPupil.x}px, ${blackRightPupil.y}px)`,
						}"
					/>
				</div>
			</div>
		</div>

		<!-- Orange semi-circle - Front left -->
		<div
			ref="orangeRef"
			class="char char-orange"
			:style="{
				left: '0px',
				width: '240px',
				height: '200px',
				backgroundColor: '#FF9B6B',
				borderRadius: '120px 120px 0 0',
				zIndex: 3,
				transform: (passwordLength > 0 && showPassword)
					? 'skewX(0deg)'
					: `skewX(${orangePos.bodySkew || 0}deg)`,
			}"
		>
			<div
				class="eyes"
				:style="{
					left: (passwordLength > 0 && showPassword) ? '50px' : `${82 + (orangePos.faceX || 0)}px`,
					top: (passwordLength > 0 && showPassword) ? '85px' : `${90 + (orangePos.faceY || 0)}px`,
				}"
			>
				<div
					class="pupil-only"
					:style="{
						width: '12px',
						height: '12px',
						backgroundColor: '#2D2D2D',
						transform: `translate(${orangeLeftPupil.x}px, ${orangeLeftPupil.y}px)`,
					}"
				/>
				<div
					class="pupil-only"
					:style="{
						width: '12px',
						height: '12px',
						backgroundColor: '#2D2D2D',
						transform: `translate(${orangeRightPupil.x}px, ${orangeRightPupil.y}px)`,
					}"
				/>
			</div>
		</div>

		<!-- Yellow tall rectangle - Front right -->
		<div
			ref="yellowRef"
			class="char char-yellow"
			:style="{
				left: '310px',
				width: '140px',
				height: '230px',
				backgroundColor: '#E8D754',
				borderRadius: '70px 70px 0 0',
				zIndex: 4,
				transform: (passwordLength > 0 && showPassword)
					? 'skewX(0deg)'
					: `skewX(${yellowPos.bodySkew || 0}deg)`,
			}"
		>
			<div
				class="eyes"
				:style="{
					left: (passwordLength > 0 && showPassword) ? '20px' : `${52 + (yellowPos.faceX || 0)}px`,
					top: (passwordLength > 0 && showPassword) ? '35px' : `${40 + (yellowPos.faceY || 0)}px`,
				}"
			>
				<div
					class="pupil-only"
					:style="{
						width: '12px',
						height: '12px',
						backgroundColor: '#2D2D2D',
						transform: `translate(${yellowLeftPupil.x}px, ${yellowLeftPupil.y}px)`,
					}"
				/>
				<div
					class="pupil-only"
					:style="{
						width: '12px',
						height: '12px',
						backgroundColor: '#2D2D2D',
						transform: `translate(${yellowRightPupil.x}px, ${yellowRightPupil.y}px)`,
					}"
				/>
			</div>
			<div
				class="mouth"
				:style="{
					left: (passwordLength > 0 && showPassword) ? '10px' : `${40 + (yellowPos.faceX || 0)}px`,
					top: (passwordLength > 0 && showPassword) ? '88px' : `${88 + (yellowPos.faceY || 0)}px`,
				}"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = withDefaults(
	defineProps<{
		isTyping?: boolean;
		showPassword?: boolean;
		passwordLength?: number;
	}>(),
	{
		isTyping: false,
		showPassword: false,
		passwordLength: 0,
	}
);

const mouseX = ref(0);
const mouseY = ref(0);
const isPurpleBlinking = ref(false);
const isBlackBlinking = ref(false);
const isLookingAtEachOther = ref(false);
const isPurplePeeking = ref(false);

const purpleRef = ref<HTMLDivElement | null>(null);
const blackRef = ref<HTMLDivElement | null>(null);
const yellowRef = ref<HTMLDivElement | null>(null);
const orangeRef = ref<HTMLDivElement | null>(null);

const isHidingPassword = computed(() => (props.passwordLength ?? 0) > 0 && !props.showPassword);

const onMouseMove = (e: MouseEvent) => {
	mouseX.value = e.clientX;
	mouseY.value = e.clientY;
};

onMounted(() => {
	window.addEventListener('mousemove', onMouseMove);
});

onBeforeUnmount(() => {
	window.removeEventListener('mousemove', onMouseMove);
});

// Random blinking - purple
let purpleBlinkTimeout: ReturnType<typeof setTimeout> | null = null;
const schedulePurpleBlink = () => {
	purpleBlinkTimeout = setTimeout(() => {
		isPurpleBlinking.value = true;
		setTimeout(() => {
			isPurpleBlinking.value = false;
			schedulePurpleBlink();
		}, 150);
	}, Math.random() * 4000 + 3000);
};

let blackBlinkTimeout: ReturnType<typeof setTimeout> | null = null;
const scheduleBlackBlink = () => {
	blackBlinkTimeout = setTimeout(() => {
		isBlackBlinking.value = true;
		setTimeout(() => {
			isBlackBlinking.value = false;
			scheduleBlackBlink();
		}, 150);
	}, Math.random() * 4000 + 3000);
};

onMounted(() => {
	schedulePurpleBlink();
	scheduleBlackBlink();
});

onBeforeUnmount(() => {
	if (purpleBlinkTimeout) clearTimeout(purpleBlinkTimeout);
	if (blackBlinkTimeout) clearTimeout(blackBlinkTimeout);
});

// Looking at each other when typing
let lookingTimeout: ReturnType<typeof setTimeout> | null = null;
watch(() => props.isTyping, (val) => {
	if (lookingTimeout) {
		clearTimeout(lookingTimeout);
		lookingTimeout = null;
	}
	if (val) {
		isLookingAtEachOther.value = true;
		lookingTimeout = setTimeout(() => {
			isLookingAtEachOther.value = false;
		}, 800);
	} else {
		isLookingAtEachOther.value = false;
	}
});

// Purple peeking when password visible
let peekTimeout: ReturnType<typeof setTimeout> | null = null;
watch(
	() => [props.passwordLength, props.showPassword] as const,
	([len, show]) => {
		if (peekTimeout) {
			clearTimeout(peekTimeout);
			peekTimeout = null;
		}
		if ((len ?? 0) > 0 && show) {
			peekTimeout = setTimeout(() => {
				isPurplePeeking.value = true;
				setTimeout(() => {
					isPurplePeeking.value = false;
				}, 800);
			}, Math.random() * 3000 + 2000);
		} else {
			isPurplePeeking.value = false;
		}
	}
);

interface CharPos {
	faceX: number;
	faceY: number;
	bodySkew: number;
}

const calcPosition = (ref: HTMLDivElement | null): CharPos => {
	if (!ref) return { faceX: 0, faceY: 0, bodySkew: 0 };
	const rect = ref.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 3;
	const deltaX = mouseX.value - centerX;
	const deltaY = mouseY.value - centerY;
	const faceX = Math.max(-15, Math.min(15, deltaX / 20));
	const faceY = Math.max(-10, Math.min(10, deltaY / 30));
	const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
	return { faceX, faceY, bodySkew };
};

const purplePos = computed(() => calcPosition(purpleRef.value));
const blackPos = computed(() => calcPosition(blackRef.value));
const yellowPos = computed(() => calcPosition(yellowRef.value));
const orangePos = computed(() => calcPosition(orangeRef.value));

// Helper that produces forced coordinates when characters are reacting
const forcedPupilXY = (
	base: { x: number; y: number },
	forceX: number | undefined,
	forceY: number | undefined
) => {
	if (forceX !== undefined && forceY !== undefined) {
		return { x: forceX, y: forceY };
	}
	return base;
};

const calcPupilPos = (
	ref: HTMLDivElement | null,
	maxDistance: number,
	forceX?: number,
	forceY?: number
) => {
	if (forceX !== undefined && forceY !== undefined) {
		return { x: forceX, y: forceY };
	}
	if (!ref) return { x: 0, y: 0 };
	const rect = ref.getBoundingClientRect();
	const centerX = rect.left + rect.width / 2;
	const centerY = rect.top + rect.height / 2;
	const deltaX = mouseX.value - centerX;
	const deltaY = mouseY.value - centerY;
	const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
	const angle = Math.atan2(deltaY, deltaX);
	return {
		x: Math.cos(angle) * distance,
		y: Math.sin(angle) * distance,
	};
};

const purpleHit = (props.passwordLength ?? 0) > 0 && props.showPassword;
const purplePeek = isPurplePeeking.value;
const purpleForceX = purpleHit ? (purplePeek ? 4 : -4) : isLookingAtEachOther.value ? 3 : undefined;
const purpleForceY = purpleHit ? (purplePeek ? 5 : -4) : isLookingAtEachOther.value ? 4 : undefined;

const blackHit = (props.passwordLength ?? 0) > 0 && props.showPassword;
const blackForceX = blackHit ? -4 : isLookingAtEachOther.value ? 0 : undefined;
const blackForceY = blackHit ? -4 : isLookingAtEachOther.value ? -4 : undefined;

const orangeHit = (props.passwordLength ?? 0) > 0 && props.showPassword;
const orangeForceX = orangeHit ? -5 : undefined;
const orangeForceY = orangeHit ? -4 : undefined;

const yellowHit = (props.passwordLength ?? 0) > 0 && props.showPassword;
const yellowForceX = yellowHit ? -5 : undefined;
const yellowForceY = yellowHit ? -4 : undefined;

const purpleLeftPupil = computed(() => calcPupilPos(purpleRef.value, 5, purpleForceX, purpleForceY));
const purpleRightPupil = computed(() => calcPupilPos(purpleRef.value, 5, purpleForceX, purpleForceY));
const blackLeftPupil = computed(() => calcPupilPos(blackRef.value, 4, blackForceX, blackForceY));
const blackRightPupil = computed(() => calcPupilPos(blackRef.value, 4, blackForceX, blackForceY));
const orangeLeftPupil = computed(() => calcPupilPos(orangeRef.value, 5, orangeForceX, orangeForceY));
const orangeRightPupil = computed(() => calcPupilPos(orangeRef.value, 5, orangeForceX, orangeForceY));
const yellowLeftPupil = computed(() => calcPupilPos(yellowRef.value, 5, yellowForceX, yellowForceY));
const yellowRightPupil = computed(() => calcPupilPos(yellowRef.value, 5, yellowForceX, yellowForceY));
</script>

<style lang="scss" scoped>
.animated-characters {
	position: relative;
}

.char {
	position: absolute;
	bottom: 0;
	transition: transform 0.7s ease-in-out, height 0.7s ease-in-out;
	transform-origin: bottom center;
}

.eyes {
	position: absolute;
	display: flex;
	gap: 24px;
	transition: left 0.7s ease-in-out, top 0.7s ease-in-out;
}

.eyeball {
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	transition: all 0.15s ease;
}

.pupil {
	border-radius: 50%;
	transition: transform 0.1s ease-out;
}

.pupil-only {
	border-radius: 50%;
	transition: transform 0.1s ease-out;
}

.mouth {
	position: absolute;
	width: 80px;
	height: 4px;
	background-color: #2D2D2D;
	border-radius: 999px;
	transition: left 0.2s ease-out, top 0.2s ease-out;
}
</style>
