const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const jenis = db.define("jenis", {
    id_jenis: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    nama_jenis: DataTypes.STRING
}, 
{
    freezeTableName: true
})

module.exports = jenis