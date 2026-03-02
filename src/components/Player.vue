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
import { SimplePlayer } from 'xgplayer';
import Start from 'xgplayer/es/plugins/start'
import PC from 'xgplayer/es/plugins/pc'
// import Mobile from 'xgplayer/es/plugins/mobile';
import Progress from 'xgplayer/es/plugins/progress'
import Time from 'xgplayer/es/plugins/time'
import Play from 'xgplayer/es/plugins/play'
import Error from 'xgplayer/es/plugins/error'
import TextTrack from 'xgplayer/es/plugins/track'
import Volume from 'xgplayer/es/plugins/volume';
import CssFullScreen from 'xgplayer/es/plugins/cssFullScreen';
import Fullscreen from 'xgplayer/es/plugins/fullscreen';
import Loading from 'xgplayer';
import 'xgplayer/dist/index.min.css'

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
let playerHasBeenBlocked = false;
const adbIsEnabled = ref(true);

const playerConfig = {
	id: "mse",
	url: props.url ? props.url : '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4',
	width: 1080,
	height: 720,
	plugins: [Start, PC, Progress, Play, Time, Error, TextTrack, Volume, CssFullScreen, Fullscreen, Loading],
	texttrack: props.srt ?
		[{
			src: props.srt,
			id: "subtitles",
			label: "中文",
			language: "zh-cn",
			default: true
		}] : [],
	textTrackStyle: {
		color: "#000"
	},
	controls: {
		mode: 'normal',
		autoHide: true
	},
	keyShortcut: "on",
	keyboard: {
		'space': {              //空格键，播放/暂停切换
			code: 32,             //对应快捷键索引
			action: 'playPause',  //具体触发的业务操作，如果为字符串，则执行keyborad对应接口
			disable: false        // 是否禁用
		}
	}
};

function loadVideo() {
	player = new SimplePlayer(playerConfig);
}

onMounted(() => {
	adbIsEnabled.value = false;
	setTimeout(loadVideo(), 1000);
})

onUnmounted(() => {
	// 组件卸载时销毁播放器
	if (player) {
		player.destroy();
	}
});


const showMessage = setInterval(() => {
	if (adbIsEnabled.value === true) {
		document.querySelector(".window").showModal();
		clearInterval(showMessage);
	}
}, 2000);

</script>
<style scoped>
#mse {
	width: 100%;
	height: 100%;
	min-height: 300px;
}
</style>