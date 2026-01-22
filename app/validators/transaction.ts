import vine from '@vinejs/vine'

export const createTransactionValidator = vine.compile(
  vine.object({
    amount: vine.number().min(1).decimal([0, 2]),
    deskripsi: vine.string().optional(),
  })
)
