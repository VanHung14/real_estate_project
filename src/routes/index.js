
const postsRouter = require('./posts')
const usersRouter = require('./users')


function route(app){
    app.use('/api/posts', postsRouter)
    app.use('/api/users', usersRouter)
}

module.exports = route