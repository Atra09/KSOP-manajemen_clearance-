const { DataTypes } = require("sequelize")
const {db} = require(`../config/db`)

const users = db.define("users", {
    id_user: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    nama_lengkap: DataTypes.STRING,
    email: DataTypes.STRING,
    no_hp: DataTypes.STRING,
    jabatan: DataTypes.STRING,
    wilayah_kerja: DataTypes.STRING,
    foto: DataTypes.STRING,
    role: DataTypes.ENUM("user", "koordinator", "superuser"),
})

module.exports = users