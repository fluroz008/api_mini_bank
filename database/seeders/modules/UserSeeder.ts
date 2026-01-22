import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/User'
import Roles from '#models/Roles'

export default class extends BaseSeeder {
  async run() {
    // Create admin user with no customer data
    const adminRole = await Roles.firstOrCreate(
      { name: 'admin' },
      { name: 'admin' }
    )

    const adminUser = await User.firstOrCreate({
      username: 'admin'
    }, {
      email: 'admin@example.com',
      username: 'admin',
      password: 'password123',
      nip: 'ADM001'
    })

    // Attach role only if not already attached
    const existingAdminRoles = await adminUser.related('roles').query()
    if (!existingAdminRoles.some(role => role.id === adminRole.id)) {
      await adminUser.related('roles').attach([adminRole.id])
    }

    // Create two regular users with different customer data
    const userRole = await Roles.firstOrCreate(
      { name: 'customer' },
      { name: 'customer' }
    )

    const user1 = await User.firstOrCreate({
      username: 'johndoe'
    }, {
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'password123',
      nip: 'USR001'
    })

    const existingUser1Roles = await user1.related('roles').query()
    if (!existingUser1Roles.some(role => role.id === userRole.id)) {
      await user1.related('roles').attach([userRole.id])
    }

    const user2 = await User.firstOrCreate({
      username: 'janesmith'
    }, {
      email: 'jane.smith@example.com',
      username: 'janesmith',
      password: 'password123',
      nip: 'USR002'
    })

    const existingUser2Roles = await user2.related('roles').query()
    if (!existingUser2Roles.some(role => role.id === userRole.id)) {
      await user2.related('roles').attach([userRole.id])
    }
  }
}