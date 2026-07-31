const { DataTypes } = require('sequelize')
const {db} = require('../config/db')
const negara = require('./negaraModel')

const provinsi = db.define('provinsi', {
    id_provinsi: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_provinsi: DataTypes.STRING,
    id_negara: {
        type: DataTypes.INTEGER,
        references: {
            model: negara,
            key: "id_negara"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
}, 
{
    freezeTableName: true
})

module.exports = provinsi