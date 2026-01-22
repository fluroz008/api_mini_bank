/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import authRoutes from '#start/routes/auth'
import customerRoutes from '#start/routes/customer'
import transactionRoutes from '#start/routes/transaction'


router.get('/', () => {
  return {
    message: 'Selamat datang di API E-Wallet',
    status: 'success',
    version: '1.0.0',
  }
})

authRoutes()
customerRoutes()
transactionRoutes()
