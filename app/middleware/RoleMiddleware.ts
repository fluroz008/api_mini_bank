import User from '#models/User'

export default class RoleMiddleware {
  public async handle(ctx: any, next: () => Promise<void>, rolesParam?: string) {
    const user = ctx.auth?.user
    const response = ctx.response

    const unauthorized = (msg: string) => {
      return response.unauthorized({
        success: false,
        message: msg,
        timestamp: new Date().toISOString(),
      })
    }

    const forbidden = (msg: string) => {
      return response.forbidden({
        success: false,
        message: msg,
        timestamp: new Date().toISOString(),
      })
    }

    if (!user) return unauthorized('User tidak terautentikasi')

    const allowedRoles = rolesParam ? rolesParam.split(',') : []

    const userWithRoles = await User.query().where('id', user.id).preload('roles').first()

    if (!userWithRoles) return unauthorized('User tidak ditemukan')

    const hasRole = userWithRoles.roles.some((role) => allowedRoles.includes(role.name))

    if (!hasRole) return forbidden('Anda tidak memiliki akses ke resource ini')

    await next()
  }
}
