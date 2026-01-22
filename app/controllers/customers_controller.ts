import type { HttpContext } from '@adonisjs/core/http'
import Customer from '#models/Customer'
import { createCustomerValidator, updateCustomerValidator } from '#validators/customer'
import * as ResponseData from '#helpers/ResponseHelper'
import { pagination } from '#helpers/Pagination'

export default class CustomersController {
    /**
     * Menampilkan daftar semua customer dengan pagination
     */
    async index(ctx: HttpContext) {
        try {
            const user = ctx.auth.user!
            const page = ctx.request.input('page', 1)
            const limit = ctx.request.input('limit', 10)

            // Security Check: Admin can see all customers, customer can only see their own record
            await user.load('roles')
            const isAdmin = user.roles.some(r => r.name === 'admin')
            
            let customers;
            if (isAdmin) {
                customers = await Customer.query()
                    .whereNull('deleted_at')
                    .withAggregate('transactions', (query) => {
                        query.sum('nominal').as('balance')
                    })
                    .orderBy('created_at', 'desc')
                    .paginate(page, limit);
            } else {
                customers = await Customer.query()
                    .where('userId', user.id)
                    .whereNull('deleted_at')
                    .withAggregate('transactions', (query) => {
                        query.sum('nominal').as('balance')
                    })
                    .orderBy('created_at', 'desc')
                    .paginate(page, limit);
            }

            const paginatedData = pagination(customers)

            return ResponseData.success(ctx, 'Daftar customer berhasil diambil', paginatedData)
        } catch (error) {
            return ResponseData.serverError(ctx, error.message)
        }
    }

    /**
     * Menampilkan detail customer berdasarkan ID
     */
    async show(ctx: HttpContext) {
        try {
            const { id } = ctx.params
            const user = ctx.auth.user!

            const customer = await Customer.query()
                .where('id', id)
                .whereNull('deleted_at')
                .preload('transactions')
                .whereNull('deleted_at')
                .withAggregate('transactions', (query) => {
                    query.sum('nominal').as('balance')
                })
                .orderBy('created_at', 'desc')
                .first()

            if (!customer) {
                return ResponseData.notFound(ctx, 'Customer tidak ditemukan')
            }

            // Security Check: Allow if admin or own customer
            await user.load('roles')
            const isAdmin = user.roles.some(r => r.name === 'admin')
            const isOwner = user.id === customer.userId

            if (!isAdmin && !isOwner) {
                return ResponseData.forbidden(ctx, 'Anda tidak memiliki akses ke data ini')
            }

            // Additional check: Ensure the authenticated user's customer ID matches the requested ID
            if (!isAdmin && String(customer.id) !== String(id)) {
                return ResponseData.forbidden(ctx, 'Anda hanya dapat mengakses data milik Anda sendiri')
            }

            return ResponseData.success(ctx, 'Detail customer berhasil diambil', customer)
        } catch (error) {
            return ResponseData.serverError(ctx, error.message)
        }
    }

    /**
     * Membuat customer baru
     */
    async store(ctx: HttpContext) {
        try {
            const user = ctx.auth.user!
            const data = await ctx.request.validateUsing(createCustomerValidator)

            // Security Check: Only admin can create customers
            await user.load('roles')
            const isAdmin = user.roles.some(r => r.name === 'admin')

            if (!isAdmin) {
                return ResponseData.forbidden(ctx, 'Hanya admin yang memiliki akses untuk membuat customer')
            }

            const customer = await Customer.create(data)

            return ResponseData.created(ctx, 'Customer berhasil dibuat', customer)
        } catch (error) {
            return ResponseData.serverError(ctx, error.message)
        }
    }

    /**
     * Mengupdate data customer
     */
    async update(ctx: HttpContext) {
        try {
            const { id } = ctx.params
            const user = ctx.auth.user!
            const data = await ctx.request.validateUsing(updateCustomerValidator)

            const customer = await Customer.query()
                .where('id', id)
                .whereNull('deleted_at')
                .first()

            if (!customer) {
                return ResponseData.notFound(ctx, 'Customer tidak ditemukan')
            }

            // Security Check: Allow if admin or own customer
            await user.load('roles')
            const isAdmin = user.roles.some(r => r.name === 'admin')
            const isOwner = user.id === customer.userId

            if (!isAdmin && !isOwner) {
                return ResponseData.forbidden(ctx, 'Anda tidak memiliki akses untuk mengupdate data ini')
            }

            // Additional check: Ensure the authenticated user's customer ID matches the requested ID
            if (!isAdmin && String(customer.id) !== String(id)) {
                return ResponseData.forbidden(ctx, 'Anda hanya dapat mengupdate data milik Anda sendiri')
            }

            customer.merge(data)
            await customer.save()

            return ResponseData.success(ctx, 'Customer berhasil diupdate', customer)
        } catch (error) {
            return ResponseData.serverError(ctx, error.message)
        }
    }

    /**
     * Menghapus customer (soft delete)
     */
    async destroy(ctx: HttpContext) {
        try {
            const { id } = ctx.params
            const user = ctx.auth.user!

            const customer = await Customer.query()
                .where('id', id)
                .whereNull('deleted_at')
                .first()

            if (!customer) {
                return ResponseData.notFound(ctx, 'Customer tidak ditemukan')
            }

            // Security Check: Only admin can delete customers
            await user.load('roles')
            const isAdmin = user.roles.some(r => r.name === 'admin')

            if (!isAdmin) {
                return ResponseData.forbidden(ctx, 'Hanya admin yang memiliki akses untuk menghapus customer')
            }

            await customer.delete()

            return ResponseData.success(ctx, 'Customer berhasil dihapus')
        } catch (error) {
            return ResponseData.serverError(ctx, error.message)
        }
    }

    /**
     * Get real-time balance for a customer
     */
    async balance({ params, response, auth }: HttpContext) {
        const { id } = params
        const user = auth.user!

        try {
            const customer = await Customer.query().where('id', id).first()

            if (!customer) {
                return response.notFound({ message: 'Customer tidak ditemukan' })
            }

            // Security Check: Allow if admin or own customer
            await user.load('roles')
            const isAdmin = user.roles.some(r => r.name === 'admin')
            const isOwner = user.id === customer.userId

            if (!isAdmin && !isOwner) {
                return response.forbidden({ message: 'Anda tidak memiliki akses ke data ini' })
            }

            // Additional check: Ensure the authenticated user's customer ID matches the requested ID
            if (!isAdmin && String(customer.id) !== String(id)) {
                return response.forbidden({ message: 'Anda hanya dapat mengakses data milik Anda sendiri' })
            }

            const balance = await customer.calculateBalance()

            return response.ok({
                message: 'Balance berhasil diambil',
                data: { balance }
            })
        } catch (error) {
            return response.internalServerError({ message: error.message })
        }
    }

    /**
     * Get transactions history for a customer
     */
    async transactions({ params, request, response, auth }: HttpContext) {
        const { id } = params
        const user = auth.user!
        const page = request.input('page', 1)
        const limit = request.input('limit', 10)
        const { start_date, end_date, type } = request.qs()

        try {
            const customer = await Customer.query().where('id', id).first()

            if (!customer) {
                return response.notFound({ message: 'Customer tidak ditemukan' })
            }

            // Security Check: Allow if admin or own customer
            await user.load('roles')
            const isAdmin = user.roles.some(r => r.name === 'admin')
            const isOwner = user.id === customer.userId

            if (!isAdmin && !isOwner) {
                return response.forbidden({ message: 'Anda tidak memiliki akses ke data ini' })
            }

            // Additional check: Ensure the authenticated user's customer ID matches the requested ID
            if (!isAdmin && String(customer.id) !== String(id)) {
                return response.forbidden({ message: 'Anda hanya dapat mengakses data milik Anda sendiri' })
            }

            const query = customer.related('transactions').query()

            if (start_date) {
                query.where('created_at', '>=', start_date)
            }
            if (end_date) {
                query.where('created_at', '<=', end_date + ' 23:59:59')
            }
            if (type) {
                query.where('tipe', type)
            }

            const transactions = await query.orderBy('created_at', 'desc').paginate(page, limit)

            // Calculate totals for the filtered range (ignoring pagination)
            const totalsQuery = customer.related('transactions').query()
            if (start_date) totalsQuery.where('created_at', '>=', start_date)
            if (end_date) totalsQuery.where('created_at', '<=', end_date + ' 23:59:59')
            if (type) totalsQuery.where('tipe', type)

            const totals = await totalsQuery.sum('nominal as total_nominal').first()
            const totalAmount = totals?.$extras.total_nominal || 0

            const paginatedData = pagination(transactions)

            return response.ok({
                message: 'Riwayat transaksi berhasil diambil',
                data: {
                    ...paginatedData,
                    meta: {
                        ...paginatedData.meta,
                        filter_total: Number(totalAmount)
                    }
                }
            })
        } catch (error) {
            return response.internalServerError({ message: error.message })
        }
    }
}
