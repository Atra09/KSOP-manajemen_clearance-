const { DataTypes } = require('sequelize')
const {db} = require('../config/db')
const users = require('./userModel')

const logUser = db.define("log_user", {
    id_log_user: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    waktu: DataTypes.TIME,
    tanggal: DataTypes.DATEONLY,
    username: DataTypes.STRING,
    aksi: DataTypes.ENUM("CREATE", "UPDATE", "DELETE", "LOGIN"),
    jenis_data: DataTypes.STRING,
    data_diubah: DataTypes.STRING
})

module.exports = logUser