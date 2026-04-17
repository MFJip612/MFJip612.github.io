## 浏览器的进程模型

### 什么是进程？

进程是程序运行的实例，它拥有独立的内存空间。  
每个应用至少有一个进程，进程之间相互隔离。如果进程之间需要通信，必须通过特定的机制，并且需要双方同意。

### 什么是线程？

线程是进程中执行代码的基本单元。  
一个进程至少包含一个线程，称为**主线程**。当程序需要并行执行多段代码时，主线程可以创建更多线程，因此一个进程中可以存在多个线程。

### 浏览器包含哪些进程和线程？

浏览器是一个**多进程多线程**的应用程序。  
由于其内部架构复杂，为了避免相互干扰并提高稳定性，浏览器启动时会创建多个独立的进程。

> 提示：可以通过浏览器自带的任务管理器查看当前运行的所有进程。

主要的进程包括：

1. **浏览器进程**  
   负责界面显示、用户交互、子进程管理等。它内部会启动多个线程来处理不同任务。
2. **网络进程**  
   负责网络资源加载。内部通过多个线程处理不同的网络请求。
3. **渲染进程**  
   每个标签页通常对应一个独立的渲染进程，以确保页面之间相互隔离。  
   渲染进程启动后会创建一个**渲染主线程**，负责执行 HTML、CSS 和 JavaScript 代码。

> 注意：未来浏览器可能会调整这一默认机制，详见 [Chromium 进程模型与站点隔离说明](https://chromium.googlesource.com/chromium/src/+/main/docs/process_model_and_site_isolation.md#Modes-and-Availability)。
> Chromium assigns a ProcessLock to some or all RenderProcessHosts, to restrict which sites are allowed to load in the process and which data the process has access to. A RenderProcessHost is an object in the browser process that represents a given renderer process, though it can be reused if that renderer process crashes and is restarted. Some ProcessLock cases are used on all platforms (e.g., chrome:// URLs are never allowed to share a process with other sites), while other cases may depend on the mode (e.g., Full Site Isolation requires all processes to be locked, once content has been loaded in the process).
> ProcessLocks may have varying granularity, such as a single site (e.g., https://example.com), a single origin (e.g., https://accounts.example.com), an entire scheme (e.g., file://), or a special “allow-any-site” value for processes allowed to host multiple sites (which may have other restrictions, such as whether they are crossOriginIsolated). RenderProcessHosts begin with an “invalid” or unlocked ProcessLock before one is assigned.
> ProcessLocks are always assigned before any content is loaded in a renderer process, either at the start of a navigation or at OnResponseStarted time, just before a navigation commits. Note that a process may initially receive an “allow-any-site” lock for some empty document schemes (e.g., about:blank), which may later be refined to a site-specific lock when the first actual content commits. Once a site-specific lock is assigned, it remains constant for the lifetime of the RenderProcessHost, even if the renderer process itself exits and is recreated.
> Note that content may be allowed in a locked process based on its origin (e.g., an about:blank page with an inherited https://example.com origin is allowed in a process locked to https://example.com). Also, some opaque origin cases are allowed into a locked process as well, such as data: URLs created within that process.

## 渲染主线程是如何工作的？

渲染主线程是浏览器中最核心、最繁忙的线程，其工作包括但不限于：
-   解析 HTML 和 CSS
-   计算样式和布局
-   处理图层合成
-   执行 JavaScript 代码
-   响应事件处理函数
-   执行定时器回调
-   以每秒 60 帧的频率重绘页面

> 思考：为什么渲染进程不采用多线程来分担这些工作？

面对如此繁多的任务，渲染主线程需要高效的调度机制。常见问题包括：
-   执行 JavaScript 时，用户点击了按钮，是否应该立即响应？
-   同样在执行 JavaScript 时，定时器到期了，是否应该中断当前任务？
-   如果多个任务同时到达（如用户操作和定时器回调），应该如何处理？

为了解决这些问题，渲染主线程采用了**事件循环（Event Loop）**机制：
1. 渲染主线程启动一个无限循环。
2. 每次循环检查消息队列是否有任务。若有，取出第一个任务执行；若无，则进入休眠。
3. 其他线程（包括其他进程的线程）可以向消息队列末尾添加任务。如果主线程正在休眠，则唤醒它继续处理。

通过这一机制，所有任务都能有序、非阻塞地执行。

## 核心概念解析

### 什么是异步？

在编程中，有些任务无法立即完成，例如：
-   定时器回调（`setTimeout`、`setInterval`）
-   网络请求回调（`XHR`、`Fetch`）
-   用户交互事件（`addEventListener`）

如果让渲染主线程等待这些任务完成，会导致主线程**阻塞**，造成页面卡顿甚至无响应。
> 渲染主线程必须保持高响应性，**绝不允许被阻塞**。

因此，浏览器采用**异步**机制：将耗时任务交给其他线程处理，待完成后将回调函数加入消息队列，由主线程在适当的时候执行。这样既完成了任务，又保证了页面的流畅性。

### 为什么 JavaScript 会阻塞渲染？

看以下示例：

```html
<h1>Awesome!</h1>
<button>change</button>
<script>
    var h1 = document.querySelector("h1");
    var btn = document.querySelector("button");

    // 模拟耗时操作
    function delay(duration) {
        var start = Date.now();
        while (Date.now() - start < duration) {}
    }

    btn.onclick = function () {
        h1.textContent = "Hello World!"; // 修改 DOM
        delay(3000); // 阻塞主线程 3 秒
    };
</script>
```

点击按钮后，虽然文本内容已修改，但由于主线程被 `delay(3000)` 阻塞，渲染任务无法执行，因此页面不会立即更新。

### 任务是否有优先级？

**单个任务没有优先级**，消息队列遵循先进先出（FIFO）原则。  
但**浏览器维护了多个具有不同优先级的消息队列**。
根据 W3C 规范：
-   任务按类型分组，同类型任务位于同一队列，不同类型可分配不同队列。事件循环中，浏览器可根据实际情况从不同队列选取任务执行。
-   浏览器必须提供一个**微队列（microtask queue）**，其中的任务**优先于所有其他任务执行**。
-   参考：[HTML 规范 - 执行微任务检查点](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint)

在 Chrome 的实现中，至少包含以下队列：
-   **延时队列**：存放定时器回调，优先级**中**
-   **交互队列**：存放用户操作触发的事件任务，优先级**高**
-   **微队列**：存放需立即执行的任务，优先级**最高**

> 将任务加入微队列的常用方法：
> -   `Promise.resolve().then(callback)`
> -   `MutationObserver`

> 浏览器还包括其他专用队列（如网络请求、渲染相关队列），此处仅列举与前端开发密切相关的部分。
