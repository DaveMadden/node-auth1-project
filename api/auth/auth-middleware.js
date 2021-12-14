const User = require('../users/users-model')

function restricted(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    next({ status: 401, message: 'You shall not pass!' })
  }
}


async function checkUsernameFree(req, res, next) {
  console.log("MIDDLEWARE: check username free")
  const { username } = req.body
  console.log("checking:", username)
  console.log("reconstruct:", { username })
  try {
    const usernameThere = await User.findBy({ username })

    console.log("usernameThere:", usernameThere)

    if(usernameThere.length !== 0){
      return next({ status: 422, message: "Username taken"})
    }
    else{
      next()
    }


  } catch (error) {
    next(error)
  }
}

async function checkUsernameExists(req, res, next) {
  console.log("MIDDLEWARE: check username exists")

  const {username} = req.body

  try {
    const [userFromDb] = await User.findBy({username})
    console.log(userFromDb)
    if (!userFromDb) {
      return next({ message: 'Invalid credentials', status: 401 })
    }
    else{
      req.loggedUser = userFromDb
      next()
    }

  } catch (error) {
    console.error(error)
    next(error)
  }

}

function checkPasswordLength(req, res, next) {
  console.log("MIDDLEWARE: check pwd length")
  const pwd = req.body.password
  if (pwd.length > 3){
    next()
  }
  else{
    return next({status: 422, message: "Password must be longer than 3 chars"})
  }
}

module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
}