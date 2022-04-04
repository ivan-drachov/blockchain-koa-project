import Router from "koa-router"
import {BaseLimiter} from "../../middlewares"
import PublicController from "./public.controller";
const router = new Router({ prefix: "/public" })

router
    .get('/chains', BaseLimiter, PublicController.getActiveChains)
    .get('/tokens', BaseLimiter, PublicController.getActiveTokens)
    .get('/networks', BaseLimiter, PublicController.getTokensByNetwork)

export default router.routes()
