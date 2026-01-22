import { DateTime } from 'luxon'
import { compose } from '@adonisjs/core/helpers'
import User from '#models/User'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'

export default class Roles extends compose(BaseModel, SoftDeletes) {
  public static table = 'roles'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relasi Many-to-Many ke User
  @manyToMany(() => User, {
    pivotTable: 'user_roles', // Nama tabel pivot
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'user_id',
  })
  declare users: any
}
