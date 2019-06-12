import logger from 'pino'

// const l = logger({
//   name: process.env.APP_ID,
//   level: process.env.LOG_LEVEL
// })

export default logger({
  name: process.env.APP_ID,
  level: process.env.LOG_LEVEL
})
