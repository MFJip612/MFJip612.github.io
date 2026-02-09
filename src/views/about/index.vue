<template>
    <div class="container">
        <div
            class="left-panel bg-gray-900 text-white dark:bg-gray-1000 p-6 rounded-lg shadow-lg m-4 flex-1 overflow-y-auto">
            <div class="my-profile-info">
                <section class="bio-section">
                    <div class="profile-header gap-4">
                        <div class="avatar">
                            <img v-bind:src="Logo" alt="Avatar" />
                        </div>
                        <div class="name-container">
                            <h1 class="antialiased text-3xl">MFJip</h1>
                            <p class="name-desc text-gray-400 antialiased">Nobody can beat me unless I don't want to
                                win.</p>
                        </div>
                    </div>
                    <div class="bio-text">
                        <p>MFJip，曾用名Sgss。业余无线电台<code
                                class="radio-call-sign font-bold">BG7MXJ</code>，常驻广东广州。就读计算机网络专业，喜欢轨道交通。欢迎联系/通联。</p>
                        <p>更多信息请点击下面折叠菜单。</p>
                    </div>
                    <div class="social-links">
                        <a href="https://github.com/MFJip612" target="_blank" title="GitHub" class="social-icon"><span
                                class="icon"><svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor"
                                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
                                    </path>
                                </svg></span></a>
                        <a href="https://twitter.com/mfjip612" target="_blank" title="Twitter" class="social-icon"><span
                                class="icon"><svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor"
                                        d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z">
                                    </path>
                                </svg></span></a>
                        <a href="https://t.me/mfjip612" target="_blank" title="Telegram" class="social-icon"><span
                                class="icon"><svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor"
                                        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z">
                                    </path>
                                </svg></span></a>
                    </div>
                </section>
                <section class="menus-section">
                    <details class="menu-item">
                        <summary class="font-bold">换卡/业余无线电</summary>
                        <div class="menu-context">
                            <p>我的业余无线电台呼号是 <strong>BG7MXJ</strong><br />操作技术能力等级 <strong>A</strong></p>
                            <p>信箱地址：待完善</p>
                        </div>
                    </details>
                    <details class="menu-item">
                        <summary class="font-bold">Github Status</summary>
                        <div class="item-context"></div>
                    </details>

                </section>
                <section class="counter-section">
                    <img src="https://count.getloli.com/@MFJip?name=MFJip&theme=booru-mjg&padding=7&offset=0&align=top&scale=1&pixelated=1&darkmode=auto"
                        alt="">

                </section>
            </div>
        </div>
        <div class="right-panel">
            <section>暂无内容</section>
            <section></section>
            <section></section>
            <section></section>
        </div>
    </div>
</template>
<style scoped>
.container {
    display: flex;
    align-items: center;
    min-height: var(--container-height);
}

.left-panel {
    flex: 1;
    margin: 0;
    padding: 25px auto 20px 15px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.left-panel,
.right-panel {
    overflow-y: auto;
    border-radius: 10px;
    margin: 0;
}

.my-profile-info {
    height: auto;
}

.bio-section {
    margin-bottom: 1.9rem;
    padding-bottom: .9rem;
    border-bottom: 1px solid #333;
}

.profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    overflow-y: hidden;
}

.avatar {
    flex-shrink: 1;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    z-index: 99;
}

.avatar img {
    min-width: 64px;
    min-height: 64px;
    width: 64px;
    height: 64px;
    border-radius: calc(infinity * 1px);
    border: 2px solid #e5b2d3;
    object-fit: cover;
    transition: all .3s ease;
    z-index: 100;
}

.avatar img:hover {
    border: 2px solid #add8fb;
    transform: scale(1.1) rotate(20deg);
}

.bio-text {
    margin-bottom: 1.5rem;
}

.bio-text p {
    text-indent: 2rem;
}

.radio-call-sign {
    font-family: 'Courier New', Courier, monospace;
}

.social-links {
    display: flex;
    gap: .5rem;
    justify-content: flex-start;
}

.menu-item {
    margin-bottom: .99rem;
    overflow: hidden;
    transition: all .5s ease-in-out;
}

summary {
    padding: .99rem 0;
    cursor: pointer;
    outline: none;
    display: flex;
    flex-direction: column;
    position: relative;
    list-style: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}

.menu-context {
    animation: fakeIn .3s ease;
}

@keyframes fakeIn {

    0% {
        opacity: 0;
        transform: translateY(-10px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);


    }
}

.counter-section {
    display: flex;
    justify-content: center;
    margin: 1.8rem 0;
    width: 100%;
}

.right-panel {
    flex: 1.6;
}
</style>
<script setup>
import Logo from "@/assets/images/logo.jpg";
</script>
