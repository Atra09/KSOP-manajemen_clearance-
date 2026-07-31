const { DataTypes } = require('sequelize')
const {db} = require('../config/db')
const provinsi = require('./provinsiModel')

const kabupaten = db.define('kabupaten', {
    id_kabupaten: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_kabupaten: DataTypes.STRING,
    id_provinsi: {
        type: DataTypes.INTEGER,
        references: {
            model: provinsi,
            key: "id_provinsi"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
}, 
{
    freezeTableName: true
})

module.exports = kabupaten