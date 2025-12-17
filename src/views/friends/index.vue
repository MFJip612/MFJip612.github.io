<template>
    <div class="friends-container">
        <h1>Friends Link</h1>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else class="friends-list">
            <a
                v-for="friend in friends"
                :key="friend.name"
                :href="friend.uri"
                target="_blank"
                rel="noopener noreferrer"
                class="friend-card"
                :style="{ '--theme-hue': friend.hue || 360 }">
                <div class="card-header">
                    <div class="avatar-container">
                        <!-- 头像内容 -->
                        <div class="avatar-content">
                            <!-- 自定义头像 -->
                            <img
                                v-if="friend.avatar"
                                :src="friend.avatar"
                                :alt="`${friend.name}的头像`"
                                class="avatar"
                                loading="lazy"
                            />
                            <!-- 网站favicon或首字符 -->
                            <div v-else class="favicon-placeholder">
                                <!-- 尝试加载favicon -->
                                <img
                                    :src="friend.favicon"
                                    :alt="`${friend.name}的网站图标`"
                                    class="avatar favicon"
                                    loading="lazy"
                                    @error="friend.useInitial = true"
                                />
                                <!-- 如果favicon加载失败或useInitial为true，显示首字符 -->
                                <div v-if="friend.useInitial" class="avatar initial-avatar">
                                    {{ friend.name.charAt(0).toUpperCase() }}
                                </div>
                                <!-- 初始状态显示首字符 -->
                                <div v-else class="avatar initial-avatar placeholder">
                                    {{ friend.name.charAt(0).toUpperCase() }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <h3 class="friend-name">{{ friend.name }}</h3>
                </div>
                <p class="friend-url">{{ friend.uri }}</p>
                <p v-if="friend.description" class="friend-description">{{ friend.description }}</p>
            </a>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const friends = ref([]);
const loading = ref(true);
const error = ref('');

// 修复JSON格式，处理无效的JSON结构
const fixInvalidJson = (jsonText) => {
    try {
        // 首先尝试直接解析
        return JSON.parse(jsonText);
    } catch (e) {
        console.error('直接解析失败，尝试修复格式:', e);
        // 修复格式：移除多余的外层花括号，用方括号包裹
        let fixedText = jsonText.trim();
        // 移除外层花括号
        if (fixedText.startsWith('{') && fixedText.endsWith('}')) {
            fixedText = fixedText.substring(1, fixedText.length - 1).trim();
        }
        // 用方括号包裹，使其成为数组
        fixedText = `[${fixedText}]`;
        // 替换可能存在的多余逗号
        fixedText = fixedText.replace(/,\s*}/g, '}');
        fixedText = fixedText.replace(/,\s*]/g, ']');
        return JSON.parse(fixedText);
    }
};

// 获取网站favicon URL
const getFaviconUrl = (uri) => {
    try {
        const url = new URL(uri);
        return `${url.protocol}//${url.hostname}/favicon.ico`;
    } catch (e) {
        return '';
    }
};

// 从远程URL获取友情链接数据
const fetchFriends = async () => {
    try {
        loading.value = true;
        error.value = '';
        
        const response = await fetch('https://raw.githubusercontent.com/MFJip612/Friend-Links/refs/heads/main/main.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('原始数据:', text);
        
        // 修复并解析JSON数据
        const data = fixInvalidJson(text);
        
        if (Array.isArray(data)) {
            // 处理友情链接数据，添加favicon和useInitial属性
            friends.value = data.map(friend => ({
                ...friend,
                favicon: getFaviconUrl(friend.uri),
                useInitial: false
            }));
        } else {
            console.error('解析后的数据不是数组:', data);
            friends.value = [];
        }
        
        error.value = '';
    } catch (err) {
        console.error('获取友情链接失败:', err);
        error.value = `加载友情链接失败: ${err.message}`;
        // 使用本地备用数据
        friends.value = [
            {
                "name":"王小美的家",
                "description":"我只希望在那一刻，回望生命中的无数段故事时，能够问心无愧地告诉自己，我不后悔自己曾做出的每一个选择。",
                "uri": "https://ganyu.rocks"
            },
            {
                "name":"380AM-0204",
                "description":"交通强国，铁路先行",
                "uri": "https://blog.zhengxian.top/"
            }
        ].map(friend => ({
            ...friend,
            favicon: getFaviconUrl(friend.uri),
            useInitial: false
        }));
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchFriends();
});
</script>

<style scoped>
.friends-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: var(--color-heading);
}

.friends-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    justify-items: center;
}

.friend-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1.5rem;
    background-color: var(--color-background);
    border-radius: 12px;
    box-shadow: 0 4px 12px var(--color-shadow);
    transition: all 0.3s ease;
    text-decoration: none;
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.friend-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px var(--color-shadow);
    border-color: hsla(var(--theme-hue), 100%, 50%, 0.5);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.avatar-container {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--color-background-soft);
}

.avatar-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
}

.avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.5s ease;
    background-color: transparent;
}

.avatar[loading="lazy"] {
    opacity: 0;
}

.avatar[loading="lazy"]:loaded {
    opacity: 1;
}

.avatar.favicon {
    object-fit: contain;
    padding: 6px;
    background-color: white;
    box-sizing: border-box;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    background-color: white;
    border: 1px solid var(--color-border);
}

.favicon-placeholder {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.initial-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-heading);
    background-color: hsla(var(--theme-hue), 100%, 50%, 0.1);
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 0;
}

.initial-avatar.placeholder {
    z-index: 0;
}

.friend-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-heading);
}

.friend-url {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--color-text);
    opacity: 0.7;
    word-break: break-all;
}

.friend-description {
    margin: 0.5rem 0 0 0;
    font-size: 0.85rem;
    color: var(--color-text);
    opacity: 0.8;
    line-height: 1.4;
}

.loading,
.error {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: var(--color-text);
}

.error {
    color: var(--color-error);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .friends-container {
        padding: 1rem;
    }

    .friends-list {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }

    .friend-card {
        padding: 1.2rem;
    }

    .avatar-container {
        width: 40px;
        height: 40px;
    }

    .initial-avatar {
        font-size: 1.2rem;
    }

    .friend-name {
        font-size: 1rem;
    }
}
</style>