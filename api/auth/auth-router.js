const router = require("express").Router()
const bcrypt = require('bcryptjs')



const {
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
} = require('../auth/auth-middleware')

const User = require('../users/users-model')



router.post('/register', checkUsernameFree, checkPasswordLength, async (req,res,next)=>{
  try {
    //pull username and pass from req.body
    const { username, password } = req.body
    //create a hash for pwd
    const newUser = {
      username,
      password: bcrypt.hashSync(password, 8)
    }
    //store user and hash to db
    const [createdUser] = await User.add(newUser)
    console.log("createdUser:", createdUser)
    res.status(200).json(createdUser)
  }
  catch (error) {
    next(error)
  }
})

router.post('/login', checkUsernameExists, async (req,res,next)=>{
  try {
    const { username, password } = req.body
    const verifiesHash = bcrypt.compareSync(password, req.loggedUser.password)
    
    if(!verifiesHash){
      return next({ status: 401, message: "Invalid credentials"})
    }

    req.session.user = req.loggedUser
    res.json({ message: `Welcome ${username}!`})

  } catch (error) {
    next(error)
  }
})

router.get('/logout', async (req,res,next)=>{
  try {
    if (req.session.user){
      req.session.destroy((err)=>{
        if (err){
          res.json('cannot leave')
        }
        else{
          res.status(200).json({message: 'logged out'})
        }
      })
    }
    else {
      res.status(200).json({message: 'no session'})
    }
  }
  catch (error) {
    next(error)
  }
})
 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router