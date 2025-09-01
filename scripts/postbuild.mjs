import rss from './rss.mjs'
import notifyNewPosts from './notifyNewPosts.mjs'

async function postbuild() {
  await rss()
  await notifyNewPosts()
}

postbuild()
