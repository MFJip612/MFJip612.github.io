<template>
	<div id="mse"></div>
	<Dialog class="window">
		<template v-slot:title>
			<p class="text-red-500 text-center"><span class="material-symbols-outlined">
					error
				</span></p>
		</template>
		<p>您似乎使用了广告拦截器。播放器无法加载。</p>
	</Dialog>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Dialog from '@/components/Dialog.vue';

// xgplayer and its plugins are large - load them lazily on the client in onMounted

const props = defineProps({
	url: {
		type: String,
		required: false
	},
	srt: {
		type: String,
		required: false
	}
});
let player = null;
const adbIsEnabled = ref(true);
let showMessageTimer = null;

let loadVideo = null;

onMounted(() => {
	adbIsEnabled.value = false;

	// 延迟并在客户端懒加载播放器及其插件
	(async () => {
		try {
			const [xgplayerMod, StartMod, PCMod, ProgressMod, TimeMod, PlayMod, ErrorMod, TrackMod, VolumeMod, CssFullScreenMod, FullscreenMod] = await Promise.all([
				import('xgplayer'),
				import('xgplayer/es/plugins/start'),
				import('xgplayer/es/plugins/pc'),
				import('xgplayer/es/plugins/progress'),
				import('xgplayer/es/plugins/time'),
				import('xgplayer/es/plugins/play'),
				import('xgplayer/es/plugins/error'),
				import('xgplayer/es/plugins/track'),
				import('xgplayer/es/plugins/volume'),
				import('xgplayer/es/plugins/cssFullScreen'),
				import('xgplayer/es/plugins/fullscreen'),
			]);
			// 动态注入样式
			try { await import('xgplayer/dist/index.min.css'); } catch (e) { /* ignore */ }

			const SimplePlayer = xgplayerMod.default || xgplayerMod;
			const Start = StartMod.default || StartMod;
			const PC = PCMod.default || PCMod;
			const Progress = ProgressMod.default || ProgressMod;
			const Time = TimeMod.default || TimeMod;
			const Play = PlayMod.default || PlayMod;
			const ErrorP = ErrorMod.default || ErrorMod;
			const TextTrack = TrackMod.default || TrackMod;
			const Volume = VolumeMod.default || VolumeMod;
			const CssFullScreen = CssFullScreenMod.default || CssFullScreenMod;
			const Fullscreen = FullscreenMod.default || FullscreenMod;

			const playerConfig = {
				id: "mse",
				url: props.url ? props.url : '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4',
				width: 1080,
				height: 720,
				plugins: [Start, PC, Progress, Play, Time, ErrorP, TextTrack, Volume, CssFullScreen, Fullscreen],
				texttrack: props.srt ?
					[{
						src: props.srt,
						id: "subtitles",
						label: "中文",
						language: "zh-cn",
						default: true
					}] : [],
				textTrackStyle: { color: "#000" },
				controls: { mode: 'normal', autoHide: true },
				keyShortcut: "on",
				keyboard: { 'space': { code: 32, action: 'playPause', disable: false } }
			};

			loadVideo = () => { player = new SimplePlayer(playerConfig); };

			window.setTimeout(() => {
				loadVideo?.();
			}, 1000);
		} catch (e) {
			console.warn('播放器加载失败或被拦截', e);
		}
	})();

	showMessageTimer = window.setInterval(() => {
		if (adbIsEnabled.value === true) {
			const dialogEl = document.querySelector('.window');
			dialogEl?.showModal?.();
			clearInterval(showMessageTimer);
			showMessageTimer = null;
		}
	}, 2000);

})

onUnmounted(() => {
	// 组件卸载时销毁播放器
	if (player) {
		player.destroy();
	}
	if (showMessageTimer) {
		clearInterval(showMessageTimer);
		showMessageTimer = null;
	}
});

</script>
<style scoped>
#mse {
	width: 100%;
	height: 100%;
	min-height: 300px;
}
</style>