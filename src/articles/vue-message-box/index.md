# 实现通用弹窗功能：从组件到函数式调用

弹窗作为一种通用型UI组件，在各类应用场景中频繁出现。由于其“一次开发，多次使用”的特点，我们应重点优化它的使用体验，降低调用成本。

## 组件式实现：开发简单但使用繁琐

首先，我们创建一个基础的弹窗组件 `MessageBox.vue`：

```vue
<template>
    <div class="modal">
        <div class="box">
            <div class="text">{{ msg }}</div>
            <Button @click="emit('click')"></Button>
        </div>
    </div>
</template>

<script setup>
import Button from "~/components/Button.vue";

const emit = defineEmits(['click']);

defineProps({
    msg: {
        type: String,
        required: true
    }
});
</script>

<style scoped>
.modal { /* 样式代码 */ }
.box { /* 样式代码 */ }
.text { /* 样式代码 */ }
</style>
```

组件开发相对简单，但在使用时却比较繁琐：

```vue
<!-- App.vue -->
<template>
    <div>
        <Button @click="clickHandler">显示弹窗</Button>
        <MessageBox v-if="showMsg" :msg="msg" @click="clickHandler"></MessageBox>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from "~/components/Button.vue";
import MessageBox from "~/components/MessageBox.vue";

const showMsg = ref(false);
const msg = ref('提示消息');

const clickHandler = () => {
    showMsg.value = !showMsg.value;
};
</script>
```

每次使用都需要导入组件、维护状态变量，确实不够便捷。

## 函数式调用：优化使用体验

能否实现无需导入组件，直接通过函数调用的方式使用弹窗呢？答案是肯定的。

理想中的使用方式如下：

```vue
<!-- App.vue -->
<script setup>
import Button from "~/components/Button.vue";
import showMsg from "~/commons/showMsg";

const clickHandler = () => {
    showMsg('欲显示的消息', (close) => {
        console.log('点击了确定按钮');
        close(); // 关闭弹窗
    });
};
</script>
```

这种方式明显更加简洁。接下来我们实现这个 `showMsg` 函数。

## 实现函数式弹窗

### 1. 创建基础函数框架

首先创建 `showMsg.js` 文件：

```javascript
// ~/commons/showMsg.js
function showMsg(msg, clickHandler) {
    // 实现弹窗逻辑
}

export default showMsg;
```

### 2. 动态渲染组件

我们需要在函数中动态创建并渲染弹窗组件：

```javascript
// ~/commons/showMsg.js
import { createApp } from 'vue';
import MessageBox from "~/components/MessageBox.vue";

function showMsg(msg, clickHandler) {
    // 创建容器元素
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // 创建Vue应用实例并挂载
    const app = createApp(MessageBox, {
        msg,
        onClick() {
            if (clickHandler) {
                // 执行回调并传递关闭函数
                clickHandler(() => {
                    app.unmount();   // 卸载应用
                    container.remove(); // 移除DOM元素
                });
            }
        }
    });
    
    app.mount(container);
}

export default showMsg;
```

### 3. 整合组件定义

为了减少文件依赖，我们可以将组件定义整合到同一个文件中：

```javascript
// ~/commons/showMsg.js
import { createApp } from 'vue';
import Button from "~/components/Button.vue";

// 定义MessageBox组件
const MessageBox = {
    props: {
        msg: {
            type: String,
            required: true,
        },
    },
    render(ctx) {
        const { $props, $emit } = ctx;
        return (
            <div class="modal">
                <div class="box">
                    <div class="text">{$props.msg}</div>
                    <Button click={$emit('onClick')}></Button>
                </div>
            </div>
        );
    }
};

function showMsg(msg, clickHandler) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const app = createApp(MessageBox, {
        msg,
        onClick() {
            if (clickHandler) {
                clickHandler(() => {
                    app.unmount();
                    container.remove();
                });
            }
        }
    });
    
    app.mount(container);
}

export default showMsg;
```

### 4. 添加样式支持

使用 `@styils/vue` 库来管理样式：

```bash
# 安装依赖
npm install @styils/vue
```

整合样式到组件中：

```javascript
// ~/commons/showMsg.js
import { createApp } from 'vue';
import { styled } from "@styils/vue";
import Button from "~/components/Button.vue";

// 使用styled组件定义样式
const Modal = styled('div', {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
});

const Box = styled('div', {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '300px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
});

const Text = styled('div', {
    marginBottom: '15px',
    fontSize: '16px',
    color: '#333'
});

// 定义MessageBox组件
const MessageBox = {
    props: {
        msg: {
            type: String,
            required: true,
        },
    },
    render(ctx) {
        const { $props, $emit } = ctx;
        return (
            <Modal>
                <Box>
                    <Text>{$props.msg}</Text>
                    <Button onClick={$emit('onClick')}>确定</Button>
                </Box>
            </Modal>
        );
    }
};

// 导出showMsg函数
function showMsg(msg, clickHandler) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const app = createApp(MessageBox, {
        msg,
        onClick() {
            if (clickHandler) {
                clickHandler(() => {
                    app.unmount();
                    container.remove();
                });
            }
        }
    });
    
    app.mount(container);
}

export default showMsg;
```