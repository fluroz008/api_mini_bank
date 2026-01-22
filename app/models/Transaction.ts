import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Customer from '#models/Customer'

export default class Transaction extends compose(BaseModel, SoftDeletes) {
    public static table = 'transactions'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare customerId: number

    @column()

    @column()
    declare nominal: number

    @column()
    declare tipe: string

    @column()
    declare deskripsi: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    @column.dateTime()
    declare deletedAt: DateTime | null

    // Relasi Many-to-One ke Customer
    @belongsTo(() => Customer, {
        foreignKey: 'customerId',
    })
    declare customer: BelongsTo<typeof Customer>

}
