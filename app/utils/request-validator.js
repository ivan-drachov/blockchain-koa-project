import Ajv from "ajv"

export default function (schema) {

  return function (target, key, descriptor) {

    if (!schema) return descriptor

    const ajv = new Ajv()

    descriptor.value = new Proxy(target[key], {
      apply: async function (method, self, [ctx, next, ...args]) {

        const valid = ajv.validate(schema, ctx.request.body)

        if (valid) return method.call(self, ctx, next, ...args)

        ctx.body = { success: false, message: "Validation error.", data: ajv.errors  }
        ctx.status = 400
        return ctx
      },
    })

    return descriptor
  }
}
