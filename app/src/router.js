import Router from 'koa-router'
import { wrapper } from 'koa-swagger-decorator'

const router = new Router()

wrapper(router)
router.swagger({
  title: 'AlphaCarbon',
  description: 'API DOC',
  version: '1.0.0',
})

export default router
