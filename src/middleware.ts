import { MiddlewareHandler } from 'hono'
import { getContentFromKVAsset } from 'hono/utils/cloudflare'
import { getFilePath } from 'hono/utils/filepath'
import { getMimeType } from 'hono/utils/mime'
import { bufferToString } from 'hono/utils/buffer'

import { marked } from 'marked'

// @ts-ignore
import manifest from '__STATIC_CONTENT_MANIFEST'

type Option = {
  wrapper?: (content: string) => string
  root?: string
}

export const blog = (option: Option): MiddlewareHandler => {
  return async (c, next) => {
    const filename = c.req.path + '.md'

    const path = getFilePath({
      filename: filename,
      root: option.root ?? './contents',
    })

    const content = await getContentFromKVAsset(path, {
      namespace: c.env.__STATIC_CONTENT,
      manifest: manifest,
    })
    if (content) {
      const mimeType = getMimeType(path)
      if (mimeType) {
        c.header('Content-Type', mimeType)
      }
    }

    if (content && /\.md$/.test(path)) {
      const text = bufferToString(content)
      let body = marked(text)
      if (option?.wrapper) {
        body = option?.wrapper(body)
      }
      return c.html(body)
    }
    await next()
  }
}
