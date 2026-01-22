import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Transaction from '#models/Transaction'
import { createTransactionValidator } from '#validators/transaction'

export default class TransactionsController {
    /**
     * Deposit money to customer's wallet
     */
    async deposit({ request, response, auth }: HttpContext) {
        const { amount, deskripsi } = await request.validateUsing(createTransactionValidator)
        const user = auth.user!

        // Ensure customer exists for the logged in user
        const customer = await user.related('customer').query().first()

        if (!customer) {
            return response.badRequest({ message: 'User belum terdaftar sebagai customer' })
        }

        const trx = await db.transaction()

        try {
            const transaction = new Transaction()
            transaction.customerId = customer.id
            transaction.nominal = amount
            transaction.tipe = 'deposit'
            transaction.deskripsi = deskripsi ?? null

            transaction.useTransaction(trx)
            await transaction.save()

            await trx.commit()

            // Calculate new balance for response
            const newBalance = await customer.calculateBalance()

            return response.ok({
                message: 'Berhasil melakukan deposit',
                data: {
                    transaction,
                    current_balance: newBalance,
                }
            })
        } catch (error) {
            await trx.rollback()
            return response.badRequest({ message: 'Gagal melakukan deposit', error: error.message })
        }
    }

    /**
     * Withdraw money from customer's wallet
     */
    async withdraw({ request, response, auth }: HttpContext) {
        const { amount, deskripsi } = await request.validateUsing(createTransactionValidator)
        const user = auth.user!

        const customer = await user.related('customer').query().first()

        if (!customer) {
            return response.badRequest({ message: 'User belum terdaftar sebagai customer' })
        }

        const trx = await db.transaction()

        try {

            const currentBalance = await customer.calculateBalance()

            if (currentBalance < amount) {
                await trx.rollback()
                return response.badRequest({
                    message: 'Saldo tidak mencukupi',
                    current_balance: currentBalance,
                    requested_amount: amount
                })
            }

            const transaction = new Transaction()
            transaction.customerId = customer.id
            transaction.nominal = -amount //aggregrate nominal
            transaction.tipe = 'withdraw'
            transaction.deskripsi = deskripsi ?? null

            transaction.useTransaction(trx)
            await transaction.save()

            await trx.commit()

            const newBalance = await customer.calculateBalance()

            return response.ok({
                message: 'Berhasil melakukan withdraw',
                data: {
                    transaction,
                    current_balance: newBalance,
                }
            })
        } catch (error) {
            return response.badRequest({ message: 'Gagal melakukan withdraw', error: error.message })
        }
    }

    /**
     * Get all transactions (Admin only)
     */
    async index({ request, response }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)
        const { start_date, end_date, type } = request.qs()

        try {
            const query = Transaction.query()

            if (start_date) {
                query.where('created_at', '>=', start_date)
            }
            if (end_date) {
                query.where('created_at', '<=', end_date + ' 23:59:59')
            }
            if (type) {
                query.where('tipe', type)
            }

            // Preload customer and user for context
            query.preload('customer', (customerQuery) => {
                customerQuery.preload('user')
            })

            const transactions = await query.orderBy('created_at', 'desc').paginate(page, limit)

            // Calculate totals for the filtered range
            const totalsQuery = Transaction.query()
            if (start_date) totalsQuery.where('created_at', '>=', start_date)
            if (end_date) totalsQuery.where('created_at', '<=', end_date + ' 23:59:59')
            if (type) totalsQuery.where('tipe', type)

            const totals = await totalsQuery.sum('nominal as total_nominal').first()
            const totalAmount = totals?.$extras.total_nominal || 0

            return response.ok({
                message: 'Data transaksi berhasil diambil',
                data: {
                    ...transactions.toJSON(),
                    meta: {
                        ...transactions.toJSON().meta,
                        filter_total: Number(totalAmount)
                    }
                }
            })
        } catch (error) {
            return response.internalServerError({ message: error.message })
        }
    }
}
