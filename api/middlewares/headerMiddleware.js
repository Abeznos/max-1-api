module.exports = (req, res, next) => {
    if (req.path.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf')
    }
    next()
}