module.exports = {
    toHex: (str) => '0x' + Buffer.from(str).toString('hex')
}