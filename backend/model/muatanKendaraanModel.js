const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const perjalanan = require("./perjalananModel")

const muatanKendaraan = db.define("muatan_kendaraan", {
    id_muatan_kendaraan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_perjalanan: {
        type: DataTypes.INTEGER,
        references: {
            model: perjalanan,
            key: "id_perjalanan"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    jenis_perjalanan: DataTypes.ENUM("berangkat", "datang"),
    golongan_kendaraan: DataTypes.ENUM("I", "II", "III", "IV", "V", "VI"),
    unit: DataTypes.INTEGER,
    ton: DataTypes.DOUBLE,
    m3: DataTypes.DOUBLE,
},
{
    freezeTableName: true
})

module.exports = muatanKendaraan