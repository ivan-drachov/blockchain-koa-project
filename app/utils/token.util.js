import jwt from "jsonwebtoken"
import { VERIFY_EMAIL_TOKEN_CONFIG, TOKEN_CONFIG } from "../../config/token.config"

export default class TokenUtil {

  /**
   * Generate token from data
   * @param data - data
   * @param access {boolean}
   * @returns {string} - encoded value, token
   */

  static generate(data, access = false) {

    return jwt.sign(data, TOKEN_CONFIG.KEY, {
      expiresIn: TOKEN_CONFIG.expires,
      algorithm: TOKEN_CONFIG.alg,
    })
  }

  static createVerifyToken = function (data, access = false) {

    return jwt.sign(data, VERIFY_EMAIL_TOKEN_CONFIG.KEY, {
      expiresIn: VERIFY_EMAIL_TOKEN_CONFIG.expires,
      algorithm: VERIFY_EMAIL_TOKEN_CONFIG.alg,
    })
  }

  /**
   * Decode given payload (usually, authorization field from request header)
   * @param payload - string with token to decode
   * @param access {boolean}
   * @returns {object|null} - object with users data
   */

  static decode(payload, access = false) {

    try {
      return jwt.verify(payload, TOKEN_CONFIG.KEY)
    } catch (e) {
      return null
    }
  }
}
