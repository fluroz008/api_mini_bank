import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class IndexSeeder extends BaseSeeder {
  private async seed(Seeder: { default: typeof BaseSeeder }) {
    await new Seeder.default(this.client).run()
  }

  public async run() {
    await this.seed(await import ('#database/seeders/modules/UserSeeder'))
    await this.seed(await import ('#database/seeders/modules/CustomerSeeder'))
  }
}