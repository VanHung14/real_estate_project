const { PrismaClient } = require('@prisma/client')
const config = require('../configs/config');
const jwt = require('jsonwebtoken')
const utils = require('../utils/utils');
const fs = require('fs')

const prisma = new PrismaClient()

class PostsController {


    // [GET] /api/posts?sort=&direct=&filter=address&city=&district=&ward=
    async getPosts(req, res, next) {
        try{
            let perPage = 10
            let page = parseInt(req.query.page) || 1

            if(JSON.stringify(req.query) === JSON.stringify({})){ // get all posts 
                let posts = await prisma.posts.findMany({
                    skip: (perPage * page) - perPage,
                    take: perPage,
                })
                if(posts){
                    for(var i = 0; i< posts.length;++i){
                        let address = await prisma.address.findFirst({where: {id : posts[i].id}})
                        posts[i].address = address
                        let image = await prisma.images.findFirst({where:{ post_id: posts[i].id}})
                            posts[i].first_image_path= image.image_path
                    }
                    res.send(posts)
                }
                else{
                    res.status(404).send('Not found!')
                }
            }
            else { // co sort hoac filter

                let sortKey = req.query.sort || 'price'
                let sortDirect = req.query.direct || 'desc'
                let sort = {}
                sort[sortKey]= sortDirect
                
                let filter = req.query.filter || 'price'
                // console.log(filter)
                let posts = []

                if(filter == 'price'){
                    let min = parseInt(req.query.min)  || 0
                    let max = parseInt(req.query.max) || 100
                    posts = await prisma.posts.findMany({
                        skip: (perPage * page) - perPage,
                        take: perPage, 
                        where: { AND: [{
                            OR: [{
                                title: {contains: req.query.search}
                            },{
                                content: {contains: req.query.search}
                            },
                        ]
                        }, {
                                price: {
                                lte: max,
                                gte: min
                            },
                        }]
                 },
                        orderBy: [sort],
                    })
                    
                }
                else {
                    let address = await prisma.address.findMany({
                        skip: (perPage * page) - perPage,
                        take: perPage,
                        where: {
                        city: {contains: req.query.city},
                        district: {contains: req.query.district},
                        ward: {contains: req.query.ward},
                        street: {contains: req.query.street}
                    }})
                    let idList = []
                    for(var i = 0;i<address.length; ++i){
                        idList.push(address[i].id)
                    }
                    console.log(idList)
                    posts = await prisma.posts.findMany({ where: {
                        AND: [
                            {
                                id : { in : idList},
                            },
                            {
                                OR: [{
                                    title: {contains: req.query.search}
                                },{ 
                                    content: {contains: req.query.search}
                                },
                            ]
                            }
                        ]
                        
                    },
                        orderBy: [sort],
                    })

                }
                if(posts){

                    for(var i = 0; i< posts.length;++i){
                        let address = await prisma.address.findFirst({where: {id : posts[i].id}})
                        posts[i].address = address
                        let image = await prisma.images.findFirst({where:{ post_id: posts[i].id}})
                        posts[i].first_image_path= image.image_path
    
                    }
                    res.send(posts)
                }
                else{
                    res.status(404).send('Not found!')
                }
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }

    // [GET]/posts/:id
    async getPostById(req, res, next){
        try{
            let id = parseInt(req.params.id)
            let post = await prisma.posts.findFirst({where: { id: id }})
            if(post){
                post.image_path_list=[]
                let address = await prisma.address.findFirst({where: { id: post.id}})
                post.address= address
                let images = await prisma.images.findMany({where:{ post_id: post.id}})
                for(var i =0;i<images.length;++i){
                    console.log(images[i].image_path)
                    post.image_path_list.push(images[i].image_path)
                }
                res.send(post)
            }
            else{
                res.status(400).send('No post found!')
            }
        }
        catch(err){
            res.status(400).send(err)
        }
    }
    
    // [POST] api/posts/
    async createPost (req, res, next) {
        try{
            if(req.user.role_id == 2) {
                let address = await prisma.address.findFirst({ where :{
                    city: req.body.city,
                    district: req.body.district,
                    ward: req.body.ward,
                    street: req.body.street
                }})
                if(address) {
                    deleteImgInByReqFiles(req.files)
                    res.status(401).send('Address is already created!')
                }
                else{
                    let date = new Date()
                    date.setHours(date.getHours()+7)
                    let post = await prisma.posts.create({
                        data: {
                        title: req.body.title,
                        content: req.body.content,
                        price: parseFloat(req.body.price),
                        phone: req.body.phone,
                        status: req.body.status,
                        created_at: date,
                        updated_at: date,
                        user_id: req.user.id,
                        address: {
                            create: {
                            city: req.body.city,
                            district: req.body.district,
                            ward: req.body.ward,
                            street: req.body.street
                            }
                        },
                        }
                    })
        
                    if(post){
                        var array = req.files
                        for(var i =0; i< array.length; ++i){
                            array[i] = {    
                                image_path: array[i].path,
                                post_id: post.id
                            }
                        }
                        let image = await prisma.images.createMany({
                            data : array
                        })
                        
                        res.send(post)
                    }
                    else{
                        deleteImgInByReqFiles(req.files)
                        res.status(400).send('Post failed!')
                    }
                }
            }
            else{
                deleteImgInByReqFiles(req.files)
                res.status(403).send('No permission! Create post only works for seller.')
            }
        }
        catch(err){
            deleteImgInByReqFiles(req.files)
            res.status(400).send(err)
        }
    }


    // [PATCH] /api/:id/
    async updatePost(req, res, next){
        try{
            let id = parseInt(req.params.id)
            let date = new Date()
            date.setHours(date.getHours()+7)
            let checkPost = await prisma.posts.findFirst({ where: { id: id }})
            if(checkPost){                                                                  // check if post is available
                if (checkPost.created_at.getTime() != checkPost.updated_at.getTime()) {     // check if this post had been changed before?
                // if(false){
                    // delete files in local folder when not update new images
                    deleteImgInLocalFolder(req.files)
                    res.status(400).send('This post had been changed before.')
                }
                else{
                    let post = await prisma.posts.update({
                        where: {
                            id: id
                        }, 
                        data: {
                            title: req.body.title,
                            content: req.body.content,
                            price: parseFloat(req.body.price),
                            phone: req.body.phone,
                            status: req.body.status,
                            updated_at: date,
                        }
                    })
                    if(post){
                        // delete image in local folder
                        let delList =[]
                        if(typeof(req.body.delList)=='string'){ 
                            delList = new Array(req.body.delList) 
                        }
                        else{
                            delList = req.body.delList
                        }
                        // console.log('dellist', delList)
                        deleteImgInByPath(delList)
                        // delete record in DB
                        let deleteImg = await prisma.images.deleteMany({ where:{ image_path :{ in : delList}}})
        
                        var array = req.files
                        for(var i =0; i< array.length; ++i){
                            array[i] = {
                                image_path: array[i].path,
                                post_id: post.id
                            }
                        }
                        let image = await prisma.images.createMany({
                            data : array
                        })
                        let address = await prisma.address.update({
                            where:{
                                id: post.id
                            }
                            ,data: {
                                city: req.body.city,
                                district: req.body.district,
                                ward: req.body.ward,
                                street: req.body.street
                            }
                        })
                        res.send(post)
                    }
                    else{
                        deleteImgInByReqFiles(req.files)
                        res.status(400).send('Update failed!')
                    }
                }
            }
            else{
                deleteImgInByReqFiles(req.files)
                res.status(404).send('No posts found!')
            }
            
        }
        catch(err){
            deleteImgInByReqFiles(req.files)
            res.status(400).send(err)
        }
    }

    // [DELETE] /api/posts/:id
    // Only works with user who own this post, or admin.
    async deletePost(req, res, next){
        try{
            var id = parseInt(req.params.id)
            let post = await prisma.posts.findFirst({where: {id: id}})
            if(req.user.id == 1 || post.user_id == req.user.id ){
                let imgPath = await prisma.images.findMany({where: { post_id: id}})
                let delList =[]
                for(var i =0; i< imgPath.length; ++i){
                    delList.push(imgPath[i].image_path)
                }
                let delPost = await prisma.posts.delete({ where: {
                    id: id,
                }})
                // console.log(delList)
                if(delPost && JSON.stringify(delList) != JSON.stringify([])){
                    deleteImgInByPath(delList)
                    res.send(delPost)
                }
                else{
                    res.status(404).send('Delete failed!')
                }
            }
            else{
                res.status(403).send('No permission! Only works with user who own this post, or admin.')
            }
        }
        catch(err)
        {
            res.status(400).send(err)
        }
    }
}

module.exports = new PostsController;

async function deleteImgInByReqFiles(array){ // delete by req.files
    // console.log('array', array)
    try { // delete files in local folder when not update new images
        for(var i =0; i< array.length; ++i){
            fs.unlinkSync(array[i].path)
        }
      } catch(err) {
        console.error(err)
      }
}

async function deleteImgInByPath(array){    // delete by path req.body
    // console.log('array', array)
    try { // delete files in local folder when not update new images
        for(var i =0; i< array.length; ++i){
            fs.unlinkSync(array[i])
        }
      } catch(err) {
        console.error(err)
      }
}