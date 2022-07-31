// const loginRouter = require('./login')
// const logoutRouter = require('./logout')
const postsRouter = require('./posts')
const usersRouter = require('./users')


function route(app){
    // app.use('/login', loginRouter)
    // app.use('/logout', logoutRouter)
    app.use('/api/posts', postsRouter)
    app.use('/api/users', usersRouter)
}

module.exports = route