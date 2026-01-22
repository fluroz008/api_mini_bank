import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/User'
import Customer from '#models/Customer'

export default class extends BaseSeeder {
  async run() {
    // Get the users created in UserSeeder
    const user1 = await User.findByOrFail('username', 'johndoe')
    const user2 = await User.findByOrFail('username', 'janesmith')

    // Create customer data for the first user only if it doesn't exist
    await Customer.firstOrCreate({
      userId: user1.id
    }, {
      name: 'John Doe Customer',
      userId: user1.id,
      alamat: 'Jl. Merdeka No. 123, Jakarta',
      noHp: '+6281234567890',
      tanggalLahir: new Date('1990-05-15')
    })

    // Create customer data for the second user only if it doesn't exist
    await Customer.firstOrCreate({
      userId: user2.id
    }, {
      name: 'Jane Smith Customer',
      userId: user2.id,
      alamat: 'Jl. Sudirman No. 456, Bandung',
      noHp: '+6282345678901',
      tanggalLahir: new Date('1988-12-22')
    })
  }
}