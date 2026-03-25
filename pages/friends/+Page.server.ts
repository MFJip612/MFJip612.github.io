import Page from './+Page.vue'
export { Page }

function fixInvalidJson(jsonText: string) {
  try { return JSON.parse(jsonText) } catch (e) {
    let fixedText = jsonText.trim()
    if (fixedText.startsWith('{') && fixedText.endsWith('}')) {
      fixedText = fixedText.substring(1, fixedText.length - 1).trim()
    }
    fixedText = `[${fixedText}]`
    fixedText = fixedText.replace(/,\s*}/g, '}')
    fixedText = fixedText.replace(/,\s*]/g, ']')
    return JSON.parse(fixedText)
  }
}

export async function onBeforeRender() {
  try {
    const resp = await fetch('https://friends.im-a.gay')
    const text = await resp.text()
    const data = fixInvalidJson(text)
    const friends = Array.isArray(data)
      ? data.map((friend: any) => ({
          ...friend,
          favicon: friend.avatar_uri || (friend.uri ? new URL(friend.uri).origin + '/favicon.ico' : ''),
        }))
      : []

    console.log('onBeforeRender: fetched friends count', friends.length)
    // Vike expects data to be provided under `pageProps` to be available
    // to the page component and serialized to the client. Put friends
    // into pageContext.pageProps.
    return { pageContext: { pageProps: { friends } } }
  } catch (err) {
    console.error('onBeforeRender friends fetch failed', err)
    return { pageContext: { pageProps: { friends: [] } } }
  }
}
