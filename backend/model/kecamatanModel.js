const { DataTypes } = require('sequelize')
const {db} = require('../config/db')
const kabupaten = require('./kabupatenModel')

const kecamatan = db.define('kecamatan', {
    id_kecamatan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_kecamatan: {
        type: DataTypes.STRING,
        unique: true
    },
    id_kabupaten: {
        type: DataTypes.INTEGER,
        references: {
            model: kabupaten,
            key: "id_kabupaten"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
}, 
{
    freezeTableName: true
})

module.exports = kecamatan