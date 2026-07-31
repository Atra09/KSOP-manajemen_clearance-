const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const jenisMuatan = db.define("jenis_muatan", {
    id_jenis_muatan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_jenis_muatan: DataTypes.STRING,
}, 
{
    freezeTableName: true
})

module.exports = jenisMuatan