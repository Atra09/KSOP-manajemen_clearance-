const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const pelabuhan = db.define("pelabuhan", {
    id_pelabuhan: {
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
    },
    nama_pelabuhan: DataTypes.STRING,
}, {freezeTableName: true})

module.exports = pelabuhan