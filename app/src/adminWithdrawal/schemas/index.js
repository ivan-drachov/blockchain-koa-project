export const swaggerAdminWithdrawalSchema = {
    type: {type: 'string', required: true, example: 'to_address'},
    userWithdrawalId: {type: 'number', required: true, example: 2},
    approvedBy: {type: 'string', example: 'admin'},
    tokenCode: { type: 'string', required: true, example: 'TACT' },
    address: { type: 'string', required: true, example: '0x235a1d497307dfd7dfdce1fb798553f0345b8f98' },
    chainId: { type: 'string', required: true, example: '3' },
    value: { type: 'number', example: '12' }
}