import type {PageContextServer} from 'vike/types'

function onBeforeRoute(pageContext: PageContextServer) {

  return {
    pageContext: {}
  }
}

export { onBeforeRoute }
