
const postsRouter = require('./posts')
const usersRouter = require('./users')
const commentsRouter = require('./comments')


function route(app){
    app.use('/api/posts', postsRouter)
    app.use('/api/users', usersRouter)
    app.use('/api/comments', commentsRouter)
}

module.exports = route