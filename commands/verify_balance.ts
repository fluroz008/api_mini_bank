import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Customer from '#models/Customer'
import Transaction from '#models/Transaction'
import db from '@adonisjs/lucid/services/db'

export default class VerifyBalance extends BaseCommand {
  static commandName = 'verify:balance'
  static description = 'Verify customer balance calculation'

  static options: CommandOptions = {
    startApp: true
  }

  async run() {
    this.logger.info('Starting verification...')

    const trx = await db.transaction()
    try {
      // Find a user or create one
      let user = await db.from('users').useTransaction(trx).first()
      if (!user) {
        const [id] = await db.table('users').useTransaction(trx).insert({
          email: 'test_verify@example.com',
          password: 'password',
          created_at: new Date(),
          updated_at: new Date()
        }).returning('id')
        user = { id }
        this.logger.info(`Created temporary user: ${user.id}`)
      } else {
        this.logger.info(`Using existing user: ${user.id}`)
      }

      const customer = await Customer.create({
        name: 'Test Balance Customer',
        alamat: 'Test Address',
        noHp: '08123456789',
        userId: user.id,
        tanggalLahir: new Date('1990-01-01')
      }, { client: trx })

      this.logger.info(`Created customer: ${customer.id}`)

      // Create some transactions
      await Transaction.createMany([
        { customerId: customer.id, nominal: 100000, tipe: 'deposit', deskripsi: 'Initial Deposit' },
        { customerId: customer.id, nominal: -50000, tipe: 'withdraw', deskripsi: 'Withdrawal' },
        { customerId: customer.id, nominal: 25000, tipe: 'deposit', deskripsi: 'Topup' }
      ], { client: trx })

      this.logger.info('Created transactions')

      // Query using the logic from the controller
      const result = await Customer.query({ client: trx })
        .where('id', customer.id)
        .withAggregate('transactions', (query) => {
          query.sum('nominal').as('balance')
        })
        .first()

      if (result) {
        this.logger.info(`Customer ID: ${result.id}`)
        this.logger.info(`Calculated Balance: ${result.balance}`)

        if (result.balance === 75000) {
          this.logger.success('SUCCESS: Balance calculation is correct (100000 - 50000 + 25000 = 75000)')
        } else {
          this.logger.error(`FAILURE: Expected balance 75000, got ${result.balance}`)
        }
      } else {
        this.logger.error('FAILURE: Could not find created customer')
      }

      // Rollback so we don't pollute the DB
      await trx.rollback()
      this.logger.info('Rolled back transaction')

    } catch (error) {
      this.logger.error(`Error during verification: ${error.message}`)
      await trx.rollback()
    }
  }
}