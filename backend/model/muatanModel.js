const { DataTypes } = require("sequelize")
const {db} = require("../config/db")
const perjalanan = require("./perjalananModel")
const kategoriMuatan = require("./kategoriMuatanModel")

const muatan = db.define("muatan", {
    id_muatan: {
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
    id_kategori_muatan: {
        type: DataTypes.INTEGER,
        references: {
            model: kategoriMuatan,
            key: "id_kategori_muatan"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    jenis_perjalanan: DataTypes.ENUM("berangkat", "datang"),
    unit: DataTypes.INTEGER,
    ton: DataTypes.DOUBLE,
    m3: DataTypes.DOUBLE,
}, 
{
    freezeTableName: true
})

module.exports = muatan