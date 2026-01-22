import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const TransactionsController = () => import('#controllers/transactions_controller')

export default function transactionRoutes() {
    router
        .group(() => {
            router.post('/deposit', [TransactionsController, 'deposit'])
                .use(middleware.role('customer'))
            router.post('/withdraw', [TransactionsController, 'withdraw'])
                .use(middleware.role('customer'))

            router.get('/all/transactions', [TransactionsController, 'index'])
                .use(middleware.role('admin'))
        })
        .prefix('api/transaction')
        .use(middleware.auth({ guards: ['api'] }))
}
