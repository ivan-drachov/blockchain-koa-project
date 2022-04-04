import cors from "koa-cors"
import koaBody from "koa-body"
import convert from "koa-convert"
import _debugger from "debug"
import Koa from "koa"
import router from "./src/router"
import * as fs from "fs"

const error = _debugger("ac_app:error")
const debug = _debugger("ac_app:debug")

const app = new Koa()

app
    .use(router.routes())
    .use(convert(cors({ origin: true })))
    .use(convert(koaBody({ jsonLimit: "30mb", multipart: true })))

fs.readdirSync(`${ __dirname }/src`).forEach((mod) => {

  try {
    if (mod === "router.js")
    return
    app.use(require(`${ __dirname }/src/${ mod }/router.js`).default)
    debug(`loaded: '${ mod }' module.`)
    console.log(`loaded: '${ mod }' module.`)
    
  }
  catch (e) {
    error(`Error, while loading ${ mod }`, e)
    console.error(`Error, while loading ${ mod }`, e)
  }
})
export { app }
