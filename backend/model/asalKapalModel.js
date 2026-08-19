const { DataTypes } = require("sequelize")
const { db } = require("../config/db")

const asalKapal = db.define('asal_kapal', {
    id_asal_kapal: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_asal_kapal: {
        type: DataTypes.STRING,
        unique: true
    }
}, 
{
    freezeTableName: true
})

module.exports = asalKapal
