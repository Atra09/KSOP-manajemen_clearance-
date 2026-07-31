const { DataTypes } = require("sequelize")
const {db} = require("../config/db")
const jenisMuatan = require("./jenisMuatanModel")

const kategoriMuatan = db.define("kategori_muatan", {
    id_kategori_muatan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_kategori_muatan: DataTypes.STRING,
    status_kategori_muatan: DataTypes.STRING,
    id_jenis_muatan: {
        type: DataTypes.INTEGER,
        references: {
            model: jenisMuatan,
            key: "id_jenis_muatan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    }
}, 
{
    freezeTableName: true
})

module.exports = kategoriMuatan