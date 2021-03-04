const login = (db) => (reg,res)=>{
  console.log(reg.body.username)
  console.log(reg.body.password)
  db.select('*')
  .from('userinfo')
  .where({
    "username":reg.body.username,
    "password":reg.body.password
  })
  .then(User => {
    if (User.length > 0) {
      return res.status(200).json(User[0])
    }
    return res.status(400).json("Failed!\n Please check your username and password")
  })
  .catch(err=> res.status(400).json("Failed!\n Please check your username and password"))
}

const register = (db) => (reg,res)=>{
  db('userinfo')
  .returning('*')
  .insert(reg.body)
  .then(User => res.status(200).json(User[0]))
  .catch(err=> res.status(400).json("Failed!\n Repeated UserName"))
}
// });

module.exports = {
  login: login,
  register: register,
}