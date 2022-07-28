const loginRouter = require('./login')
const logoutRouter = require('./logout')
const registerRouter = require('./register')
const refreshTokenRouter = require('./refreshToken')
const postsRouter = require('./posts')
// const resetPasswordRouter = require('./resetPassword')


function route(app){
    app.use('/login', loginRouter)
    app.use('/logout', logoutRouter)
    app.use('/register', registerRouter)
    app.use('/refreshToken', refreshTokenRouter)
    app.use('/posts', postsRouter)
    // app.use('/reset-password-email', resetPasswordRouter)
}

module.exports = route