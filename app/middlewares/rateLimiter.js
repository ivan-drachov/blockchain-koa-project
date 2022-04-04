import * as RateLimitLib from "koa2-ratelimit";

RateLimitLib.RateLimit.defaultOptions({
    message: 'Sometimes You Just Have to Slow Down.',
    interval: {min: 1},
    max: 40,
});

export const BaseLimiter = RateLimitLib.RateLimit.middleware({
    prefixKey: 'all/BaseLimiter',
    max: 100,
    interval: { min: 1 }
});

export const LoginLimiter = RateLimitLib.RateLimit.middleware({
    prefixKey: 'post/adminAuth/login',
    max: 5,
    interval: { min: 1 }
});

export const ForgotLimiter = RateLimitLib.RateLimit.middleware({
    prefixKey: 'post/adminAuth/forgot',
    max: 1,
    interval: { min: 1 }
});

export const WithdrawalLimiter = RateLimitLib.RateLimit.middleware({
    prefixKey: 'post/withdrawal/toAddress',
    max: 5,
    interval: { min: 1 }
});
