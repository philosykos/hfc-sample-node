import adminRouter from './api/controllers/admin/router'
import commonRouter from './api/controllers/common/router'
import memberRouter from './api/controllers/member/router'
import sampleRouter from './api/controllers/sample/router'

export default function routes (app) {
  app.use('/api/common', commonRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/member', memberRouter)
  app.use('/api/sample', sampleRouter)
}
