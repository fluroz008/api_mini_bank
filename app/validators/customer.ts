import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
    'name.minLength': 'Nama harus minimal 2 karakter.',
    'name.required': 'Nama wajib diisi.',
    'alamat.minLength': 'Alamat harus minimal 5 karakter.',
    'alamat.required': 'Alamat wajib diisi.',
    'noHp.required': 'Nomor HP wajib diisi.',
    'noHp.mobile': 'Format nomor HP tidak valid.',
    'tanggalLahir.required': 'Tanggal lahir wajib diisi.',
    'tanggalLahir.date': 'Format tanggal lahir tidak valid.',
    'required': 'Kolom {{ field }} wajib diisi.',
})

export const createCustomerValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2),
        alamat: vine.string().trim().minLength(5),
        noHp: vine.string().trim().mobile(),
        tanggalLahir: vine.date(),
    })
)

export const updateCustomerValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).optional(),
        alamat: vine.string().trim().minLength(5).optional(),
        noHp: vine.string().trim().mobile().optional(),
        tanggalLahir: vine.date().optional(),
    })
)
