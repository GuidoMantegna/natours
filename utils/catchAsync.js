module.exports = (fn) => {
  /* express will call this func. as soon as someone hits the route 
  that needs this control function, so that function can then 
  later be called when necessary  */
  return (req, res, next) => {
    // Here, 'next' will be called with the parameter that 'catch' receives (err)
    // So, is the same as catch(err => next(err))
    fn(req, res, next).catch(next)
  }
}