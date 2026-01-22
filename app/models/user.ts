import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany, hasOne } from '@adonisjs/lucid/orm'
import type { ManyToMany, HasOne } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Roles from '#models/Roles'
import Customer from '#models/Customer'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder, SoftDeletes) {
  public static table = 'users'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare nip: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @manyToMany(() => Roles, {
    pivotTable: 'user_roles',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Roles>

  @hasOne(() => Customer, {
    foreignKey: 'userId',
  })
  declare customer: HasOne<typeof Customer>
}
