import type { HttpContext } from '@adonisjs/core/http'

/**
 * Interface untuk struktur response API standar
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  errors?: any
  timestamp: string
}

/**
 * Fungsi dasar untuk mengirim response.
 * @param ctx HttpContext dari AdonisJS
 * @param statusCode Kode status HTTP
 * @param success Status keberhasilan
 * @param message Pesan response
 * @param payload Data atau error yang akan dikirim
 */
function sendResponse<T>(
  { response }: HttpContext,
  statusCode: number,
  success: boolean,
  message: string,
  payload?: T
) {
  const responseData: ApiResponse<any> = {
    success,
    message,
    timestamp: new Date().toISOString(),
  }

  if (payload) {
    if (success) {
      responseData.data = payload
    } else {
      responseData.errors = payload
    }
  }

  return response.status(statusCode).json(responseData)
}

// Kumpulan helper yang lebih spesifik

export const success = <T>(ctx: HttpContext, message: string, data?: T) => {
  return sendResponse(ctx, 200, true, message, data)
}

export const created = <T>(ctx: HttpContext, message: string, data?: T) => {
  return sendResponse(ctx, 201, true, message, data)
}

export const error = (ctx: HttpContext, statusCode: number, message: string, errors?: any) => {
  return sendResponse(ctx, statusCode, false, message, errors)
}

export const badRequest = (ctx: HttpContext, message: string = 'Bad Request', errors?: any) => {
  return sendResponse(ctx, 400, false, message, errors)
}

export const unauthorized = (ctx: HttpContext, message: string = 'Unauthorized') => {
  return sendResponse(ctx, 401, false, message)
}

export const forbidden = (ctx: HttpContext, message: string = 'Forbidden') => {
  return sendResponse(ctx, 403, false, message)
}

export const notFound = (ctx: HttpContext, message: string = 'Resource Not Found') => {
  return sendResponse(ctx, 404, false, message)
}

export const serverError = (ctx: HttpContext, message: string = 'Internal Server Error') => {
  return sendResponse(ctx, 500, false, message)
}
