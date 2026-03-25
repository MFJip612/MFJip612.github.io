function fixInvalidJson(jsonText: string) {
  try {
    return JSON.parse(jsonText)
  } catch {
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

    return { pageContext: { pageProps: { friends } } }
  } catch (err) {
    console.error('onBeforeRender friends fetch failed', err)
    return { pageContext: { pageProps: { friends: [] } } }
  }
}