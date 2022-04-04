export const regExp = {
    email: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/,
    password: /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,16}$/,
    name: /^[a-zA-Z0-9-]{2,120}$/,
    walletAddress: /^0x[a-fA-F0-9]{40}$/g
}
