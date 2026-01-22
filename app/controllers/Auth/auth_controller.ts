import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/User'
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '#validators/auth'
import * as ResponseData from '#helpers/ResponseHelper'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Registrasi user baru
   */
  async register(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(registerValidator)
      const user = await User.create(data)

      const serializedUser = user.serialize({ fields: { omit: ['password'] } })
      return ResponseData.created(ctx, 'Registrasi berhasil!', serializedUser)
    } catch (error) {
      return ResponseData.serverError(ctx, error.message)
    }
  }

  /**
   * Login user dan generate token
   */
  async login(ctx: HttpContext) {
    const { username, password } = await ctx.request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(username, password)

    // Preload roles agar ikut ter-serialize
    await user.load('roles')

    const token = await User.accessTokens.create(user, ['*'], { expiresIn: '30 days' })

    const payload = {
      user: user.serialize({ fields: { omit: ['password'] } }),
      token: {
        type: 'bearer',
        value: token.value!.release(),
        expiresAt: token.expiresAt,
      },
    }

    return ResponseData.success(ctx, 'Login berhasil!', payload)
  }

  /**
   * Mendapatkan data profil user yang sedang login
   */
  async profile(ctx: HttpContext) {
    await ctx.auth.authenticate()
    const user = ctx.auth.getUserOrFail()

    // Preload roles agar ikut ter-serialize
    await user.load('roles')

    const serializedUser = user.serialize({ fields: { omit: ['password'] } })
    return ResponseData.success(ctx, 'Profil berhasil diambil', serializedUser)
  }

  /**
   * Update user profile
   */
  async updateProfile(ctx: HttpContext) {
    try {
      await ctx.auth.authenticate()
      const user = ctx.auth.getUserOrFail()
      const payload = await ctx.request.validateUsing(updateProfileValidator)

      if (payload.username && payload.username !== user.username) {
        const exists = await User.query()
          .where('username', payload.username)
          .whereNull('deleted_at')
          .first()
        if (exists) {
          return ResponseData.error(ctx, 400, 'Username sudah terdaftar.')
        }
      }
      if (payload.email && payload.email !== user.email) {
        const exists = await User.query()
          .where('email', payload.email)
          .whereNull('deleted_at')
          .first()
        if (exists) {
          return ResponseData.error(ctx, 400, 'Email sudah terdaftar.')
        }
      }

      user.merge(payload)
      await user.save()
      const serializedUser = user.serialize({ fields: { omit: ['password'] } })
      return ResponseData.success(ctx, 'Profil berhasil diupdate', serializedUser)
    } catch (error) {
      return ResponseData.serverError(ctx, error.message)
    }
  }

  /**
   * Mengubah password user
   */
  async changePassword(ctx: HttpContext) {
    try {
      await ctx.auth.authenticate()
      const user = ctx.auth.getUserOrFail()
      const { oldPassword, password } = await ctx.request.validateUsing(changePasswordValidator)

      const isSame = await hash.verify(user.password, oldPassword)
      if (!isSame) {
        return ResponseData.error(ctx, 400, 'Password lama tidak sesuai.')
      }

      user.password = password
      await user.save()
      return ResponseData.success(ctx, 'Password berhasil diubah')
    } catch (error) {
      return ResponseData.serverError(ctx, error.message)
    }
  }

  /**
   * Membuat access token baru (refresh token)
   */
  async refreshToken(ctx: HttpContext) {
    await ctx.auth.authenticate()
    const user = ctx.auth.getUserOrFail()
    const currentToken = user.currentAccessToken

    await User.accessTokens.delete(user, currentToken.identifier)
    const newToken = await User.accessTokens.create(user, ['*'], { expiresIn: '30 days' })

    const payload = {
      type: 'bearer',
      value: newToken.value!.release(),
      expiresAt: newToken.expiresAt,
    }

    return ResponseData.success(ctx, 'Token berhasil diperbarui', payload)
  }

  /**
   * Logout user dengan menghapus token
   */
  async logout(ctx: HttpContext) {
    await ctx.auth.authenticate()
    const user = ctx.auth.getUserOrFail()
    const currentToken = user.currentAccessToken

    await User.accessTokens.delete(user, currentToken.identifier)

    return ResponseData.success(ctx, 'Logout berhasil!')
  }
}
