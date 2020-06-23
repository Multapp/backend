import { listen, get } from './app'

listen(get('port'))
console.log('Server is running on PORT:', get('port'))