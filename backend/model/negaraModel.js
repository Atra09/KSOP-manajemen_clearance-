const { DataTypes } = require('sequelize')
const {db} = require('../config/db')

const negara = db.define('negara', {
    id_negara: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_negara: DataTypes.STRING,
    kode_negara: DataTypes.STRING
}, 
{
    freezeTableName: true
})

module.exports = negara