import { ap } from './app.js'

ap.listen(ap.get('port'))
console.log('Server is running on PORT:', ap.get('port'))