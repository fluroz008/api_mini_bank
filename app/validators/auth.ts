import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'email.email': 'Email tidak valid.',
  'email.unique': 'Email sudah terdaftar.',
  'username.minLength': 'Username harus minimal 4 karakter.',
  'username.unique': 'Username sudah terdaftar.',
  'password.minLength': 'Password harus minimal 8 karakter.',
  'password.confirmed': 'Konfirmasi password tidak cocok.',
  'password.notSameAs': 'Password baru tidak boleh sama dengan password lama.',
  'required': 'Kolom {{ field }} wajib diisi.',
})

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().optional(),
    username: vine
      .string()
      .trim()
      .minLength(4)
      .unique(async (db, value) => !(await db.from('users').where('username', value).first())),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => !(await db.from('users').where('email', value).first())),
    password: vine.string().minLength(8).confirmed(),
    nip: vine.string().trim().optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    username: vine.string(),
    password: vine.string(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().optional(),
    username: vine.string().trim().optional(),
    nip: vine.string().trim().optional(),
    email: vine.string().trim().email().optional(),
  })
)

export const changePasswordValidator = vine.compile(
  vine.object({
    oldPassword: vine.string().minLength(8),
    password: vine.string().minLength(8).confirmed().notSameAs('oldPassword'),
  })
)
