const base = require('./jest.config.cjs')

module.exports = {
  ...base,
  collectCoverageFrom: [
    'app/api/pedidos/**/*.ts',
    'app/api/pagos/**/*.ts',
    'app/api/mesas/**/*.ts',
  ],
  coverageThreshold: {},
  coverageDirectory: 'coverage/rf',
  coverageReporters: ['text', 'html'],
}
