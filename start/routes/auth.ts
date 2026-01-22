import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const AuthController = () => import('#controllers/Auth/auth_controller')
export default function authRoutes() {
  router
    .group(() => {
      router.post('/login', [AuthController, 'login'])
      // router.post('/register', [AuthController, 'register'])

      router
        .group(() => {
          router.post('/logout', [AuthController, 'logout'])
          router.get('/profile', [AuthController, 'profile'])
          router.put('/profile', [AuthController, 'updateProfile'])
          router.put('/password', [AuthController, 'changePassword'])
          router.post('/refresh-token', [AuthController, 'refreshToken'])
        })
        .use(middleware.auth({ guards: ['api'] }))
    })
    .prefix('api/auth')
}
