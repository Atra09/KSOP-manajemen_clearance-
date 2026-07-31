const { Sequelize } = require('sequelize')

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    dialect: 'mysql',
    host: process.env.DB_HOST
})

const configDb = async () => {
    try {
        await db.authenticate()
        console.log("CONNECTED")
    } catch (error) {
        console.log(error)
    }
}

module.exports = {db, configDb}