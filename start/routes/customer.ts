import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const CustomersController = () => import('#controllers/customers_controller')

export default function customerRoutes() {
    router
        .group(() => {
            router.get('/customers', [CustomersController, 'index'])
                .use(middleware.role('admin'))
            router.get('/customers/:id', [CustomersController, 'show'])
                .use(middleware.role('admin,customer'))
            router.post('/customers', [CustomersController, 'store'])
                .use(middleware.role('admin'))
            router.put('/customers/:id', [CustomersController, 'update'])
                .use(middleware.role('admin,customer'))
            router.patch('/customers/:id', [CustomersController, 'update'])
                .use(middleware.role('admin,customer'))
            router.delete('/customers/:id', [CustomersController, 'destroy'])
                .use(middleware.role('admin'))

            // Riwayat & Laporan
            router.get('/customers/:id/balance', [CustomersController, 'balance'])
                .use(middleware.role('admin,customer'))
            router.get('/customers/:id/transactions', [CustomersController, 'transactions'])
                .use(middleware.role('admin,customer'))
        })
        .prefix('api/customer')
        .use(middleware.auth({ guards: ['api'] }))
}
