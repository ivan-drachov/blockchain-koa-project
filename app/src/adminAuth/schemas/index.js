export const swaggerRegisterSchema = {
    name: { type: "string", required: true, example: "admin" },
    email: { type: "string", required: true, example: "admin@gmail.com" },
}
export const swaggerLoginSchema = {
    password: { type: 'string', required: true, example: 'admin' },
    email: { type: 'string', required: true, example: 'admin@gmail.com' },
    code: { type: 'string', example: '111111' }
}
export const swaggerCheckEmailSchema = {
    email: { type: 'string', required: true, example: 'admin@gmail.com' },
}
export const swaggerPasswordSchema = {
    oldPassword: { type: 'string', required: true, example: 'admin' },
    password: { type: 'string', required: true, example: 'admin' },
    confirmPassword: { type: 'string', required: true, example: 'admin' }
}
