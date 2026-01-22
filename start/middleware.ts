import RoleMiddleware from '#middleware/RoleMiddleware'

export const role = (roles: string | string[]) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const rolesParam = Array.isArray(roles) ? roles.join(',') : roles
    await new RoleMiddleware().handle(ctx, next, rolesParam)
  }
}
