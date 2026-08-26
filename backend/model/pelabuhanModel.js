const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const pelabuhan = db.define("pelabuhan", {
    id_pelabuhan: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    nama_pelabuhan: {
        type: DataTypes.STRING,
        unique: true
    },
}, {freezeTableName: true})

module.exports = pelabuhan