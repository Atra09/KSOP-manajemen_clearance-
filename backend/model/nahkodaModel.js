const { DataTypes } = require('sequelize')
const {db} = require('../config/db')

const nahkoda = db.define('nahkoda', {
    id_nahkoda: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_nahkoda: {
        type: DataTypes.STRING,
        unique: true
    }
}, 
{
    freezeTableName: true
})

module.exports = nahkoda