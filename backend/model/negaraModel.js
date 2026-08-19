const { DataTypes } = require('sequelize')
const {db} = require('../config/db')

const negara = db.define('negara', {
    id_negara: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_negara: {
        type: DataTypes.STRING,
        unique: true
    },
    kode_negara: {
        type: DataTypes.STRING,
        unique: true
    }
}, 
{
    freezeTableName: true
})

module.exports = negara