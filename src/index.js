const express = require('express')
const app = express()
const path = require('path')
const emailExistence = require('email-existence')


const port = process.env.PORT || 3000
const route = require('./routes')
var bodyParser = require('body-parser')


app.use(express.static(path.join(__dirname, 'models')))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


route(app)
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})  

// const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()

// async function main() {

//   // query DB
//   // const allUsers = await prisma.users.findMany()
//   // console.log(allUsers)


//   // create user
//   // await prisma.users.create({
//   //   data: {
//   //     full_name: 'Van Truong',
//   //     email: 'truongdv_tts@rikkeisoft.com',
//   //     password: '123456',
//   //     phone: '0935678377',
//   //     posts: {
//   //       create: { title: 'Nha dat 7 tang mat tien', price: 7.8 },
//   //     },
//   //     profile: {
//   //       create: { bio: 'I like turtles' },
//   //     },
//   //     role_id: 1
//   //   },
//   // })


//   // create post
//   // await prisma.posts.create({
//   //   data: {
//   //     title: 'Nha pho 7 tang',
//   //     content: 'Dien tich 100m2',
//   //     price: 10,
//   //     phone: '0933567815',
//   //     status: 'Chua duyet',
//   //     user_id: 1,
//   //     address: {
//   //       create: {
//   //         city: 'Da Nang',
//   //         district: 'Lien Chieu',
//   //         ward: 'Hoa Minh',
//   //         street: 'Doan Van Cu'
//   //       }
        
//   //     }
//   //   }
//   // })


//   // update post
//   const post = await prisma.posts.update({
//     where: { id: 1 },
//     data: { views: 2, status: 'Da duyet' },
//   })
//   console.log(post)
// }

// main()
//   .catch((e) => {
//     throw e
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })