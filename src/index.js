const app = require('./app')

app.listen(app.get('port'))
console.log('Server is running on PORT:', app.get('port'))