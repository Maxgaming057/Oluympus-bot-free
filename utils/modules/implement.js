const log = require('./log')
const fs = require('fs')
module.exports = async (name, data, format) => {
    if (!name || !data || !format) return log('error', 'Please provide all the required parameters.')
    if (typeof name !== 'string') return log('error', 'Type of name is not a string.')
    if (typeof data!== 'object') return log('error', 'Type of data is not an object.')
    if (typeof format !== 'string') return log('error', 'Type of format is not a string.')
    
    try {
        fs.writeFileSync(`./utils/addon-files/${name}.${format}`, JSON.stringify(data), 'utf8')
        log('info', `Created new addon file: ${name}.${format}`)
    } catch (error) {
        log('error', error)
    }
}