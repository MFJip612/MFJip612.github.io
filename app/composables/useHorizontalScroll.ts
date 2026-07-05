import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * 可配置的 GSAP 水平滚动动画参数
 */
export interface HorizontalScrollOptions {
  /** 外层视口/触发器元素的选择器 */
  containerSelector: string
  /** 实际水平移动的内容轨道元素的选择器 */
  trackSelector: string
  /** 滚动触发起始位置（GSAP ScrollTrigger start 语法） */
  start?: string
  /** 滚动触发结束位置（GSAP ScrollTrigger end 语法） */
  end?: string
  /** scrub 系数：true 表示直接绑定滚动进度；数字表示 scrub 平滑度 */
  scrub?: boolean | number
  /** 缓动函数，仅在非 scrub 模式下生效 */
  ease?: string
  /** 是否固定（pin）容器以模拟水平滚动 */
  pin?: boolean
  /** 是否 anticipate pin，减少 pin 时的抖动 */
  anticipatePin?: number
  /** 调试标记 */
  markers?: boolean
  /** 是否在每个卡片进入视口时触发入场动画 */
  enableCardReveal?: boolean
}

/**
 * 使用 GSAP ScrollTrigger 实现垂直滚动驱动的水平滚动效果。
 *
 * 设计思路：
 * 1. 只在客户端执行，避免 SSR 访问 window/document 报错。
 * 2. 通过动态导入 gsap，确保服务端不会打包运行时代码。
 * 3. 计算轨道总宽度与视口宽度的差值，作为水平位移距离。
 * 4. 监听窗口 resize，使用 ScrollTrigger.refresh 自动重新计算边界。
 * 5. 提供错误处理：元素不存在、GSAP 加载失败时静默降级。
 */
export function useHorizontalScroll(options: HorizontalScrollOptions) {
  const isReady: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  let ctx: { revert: () => void } | null = null

  onMounted(async () => {
    // eslint-disable-next-line no-console
    console.log('[useHorizontalScroll] onMounted called')
    
    // 仅在客户端运行
    if (typeof window === 'undefined') {
      // eslint-disable-next-line no-console
      console.log('[useHorizontalScroll] SSR detected, skipping')
      return
    }

    // eslint-disable-next-line no-console
    console.log('[useHorizontalScroll] client-side detected')
    
    // 尊重用户的减少动画偏好，提供可访问性降级
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      // eslint-disable-next-line no-console
      console.log('[useHorizontalScroll] prefers-reduced-motion detected, skipping')
      isReady.value = true
      return
    }

    try {
      // 动态导入 GSAP 与 ScrollTrigger，避免 SSR 问题
      const [gsapModule, ScrollTriggerModule] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])

      // 将 gsap 挂载到 window，方便调试
      // @ts-ignore
      window.gsap = gsapModule.default || gsapModule

      // 获取 gsap 实例
      const gsap = gsapModule.default || gsapModule

      // 将 ScrollTrigger 也挂载到 window，方便后续访问
      // @ts-ignore
      ;(window as any).__ScrollTriggerModule__ = ScrollTriggerModule

      // 注册 ScrollTrigger 插件（只需一次，多次注册会被 GSAP 自动忽略）
      gsap.registerPlugin(ScrollTriggerModule.default || ScrollTriggerModule)

      const container = document.querySelector(options.containerSelector)
      const track = document.querySelector(options.trackSelector)

      if (!container || !track) {
        error.value = `未找到目标元素：container=${options.containerSelector}, track=${options.trackSelector}`
        return
      }

      // 使用 GSAP context 管理动画实例，便于组件卸载时统一清理
      ctx = gsap.context(() => {
        // 计算需要水平移动的距离：轨道总宽度 - 容器宽度
        const calculateDistance = () => Math.max(0, track.scrollWidth - container.clientWidth)

        // 主时间轴：将垂直滚动进度映射为水平位移
        // 使用函数式值（() => ...），ScrollTrigger 在刷新时会重新计算位移
        gsap.fromTo(
          track,
          { x: 0 },
          {
            x: () => -calculateDistance(),
            ease: options.ease ?? 'none',
            scrollTrigger: {
              trigger: container,
              start: options.start ?? 'top 20%',
              // 当 end 为函数时也动态根据当前宽度计算滚动距离
              end: () => `+=${calculateDistance()}`,
              scrub: options.scrub ?? 1,
              pin: options.pin ?? true,
              anticipatePin: options.anticipatePin ?? 1,
              markers: options.markers ?? false,
              invalidateOnRefresh: true,
            },
          }
        )

        // 可选：为每个卡片添加错落入场动画
        if (options.enableCardReveal) {
          const cards = track.querySelectorAll(':scope > *')
          gsap.fromTo(
            cards,
            { opacity: 0.6, y: 24 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: container,
                start: options.start ?? 'top 60%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      }, container as Element)

      isReady.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      // eslint-disable-next-line no-console
      console.error('[useHorizontalScroll] 初始化失败:', error.value)
    }
  })

  onUnmounted(() => {
    // 组件卸载时撤销 GSAP context，释放 ScrollTrigger 与动画实例
    ctx?.revert()
    ctx = null
  })

  return { isReady, error }
}
