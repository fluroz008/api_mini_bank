import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany, belongsTo, computed } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Transaction from '#models/Transaction'
import User from '#models/User'

export default class Customer extends compose(BaseModel, SoftDeletes) {
    public static table = 'customers'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare name: string

    @column()
    declare alamat: string

    @column()
    declare noHp: string

    @column()
    declare userId: number


    // Hitung balance dari deposit - withdraw
    public async calculateBalance(): Promise<number> {
        const result = await Transaction.query()
            .where('customerId', this.id)
            .whereNull('deleted_at')
            .sum('nominal as total')
            .first()

        const total = result?.$extras.total || 0
        return Number(total)
    }

    @computed()
    public get balance() {
        return Number(this.$extras.balance || 0)
    }

    @column()
    declare tanggalLahir: Date

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime | null

    @column.dateTime()
    declare deletedAt: DateTime | null

    // Relasi One-to-Many ke Transaction
    @hasMany(() => Transaction, {
        foreignKey: 'customerId',
    })
    declare transactions: HasMany<typeof Transaction>

    @belongsTo(() => User, {
        foreignKey: 'userId',
    })
    declare user: BelongsTo<typeof User>
}
