// https://vike.dev/pageContext#typescript
declare global {
  namespace Vike {
    interface PageContext {
      Page: () => React.ReactElement
      data?: {
        /** Value for <title> defined dynamically by /pages/some-page/+data.js */
        title: string | undefined
        /** Value for <meta name="description"> defined dynamically */
        description: string | undefined
      }
      config: {
        /** Value for <title> defined statically by /pages/some-page/+title.js (or by `export default { title }` in /pages/some-page/+config.js) */
        title?: string
        /** Value for <meta name="description"> defined statically */
        description?: string
      }
      /** https://vike.dev/render */
      abortReason?: string
    }
  }
}

// Tell TypeScript this file isn't an ambient module
export {}
