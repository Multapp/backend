const httpStatus = require('http-status')

module.exports = function (req, res, next) {
    res.send(httpStatus.OK)
    return next()
}