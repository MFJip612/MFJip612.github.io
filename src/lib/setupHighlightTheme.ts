import hljsLightThemeUrl from 'highlight.js/styles/github.css?url'
import hljsDarkThemeUrl from 'highlight.js/styles/github-dark.css?url'

const HIGHLIGHT_THEME_LINK_ID = 'hljs-theme-link'

function getOrCreateThemeLink(): HTMLLinkElement {
  let link = document.getElementById(HIGHLIGHT_THEME_LINK_ID) as HTMLLinkElement | null

  if (!link) {
    link = document.createElement('link')
    link.id = HIGHLIGHT_THEME_LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  return link
}

function applyHighlightTheme(link: HTMLLinkElement): void {
  const isDark = document.documentElement.classList.contains('dark')
  const nextTheme = isDark ? hljsDarkThemeUrl : hljsLightThemeUrl

  if (link.href !== nextTheme) {
    link.href = nextTheme
  }
}

export function setupHighlightTheme(): void {
  const link = getOrCreateThemeLink()
  applyHighlightTheme(link)

  const observer = new MutationObserver((mutations) => {
    const classChanged = mutations.some(
      (mutation) => mutation.type === 'attributes' && mutation.attributeName === 'class',
    )

    if (classChanged) {
      applyHighlightTheme(link)
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}
