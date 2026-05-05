import pino from 'pino'

// Configurar el logger según el entorno
const isDevelopment = process.env.NODE_ENV === 'development'

const logger = pino(
  {
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    // Serializers personalizados para datos sensibles
    serializers: {
      error: pino.stdSerializers.err,
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          'x-request-id': req.headers?.['x-request-id'],
          'user-agent': req.headers?.['user-agent']
        }
      })
    }
  },
  // Transporte para desarrollo (pretty) vs producción (JSON)
  isDevelopment
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        }
      })
    : undefined
)

// Exportar tipos para mejor soporte de TypeScript
export interface LogContext {
  requestId?: string
  userId?: string
  action?: string
  [key: string]: any
}

export default logger
