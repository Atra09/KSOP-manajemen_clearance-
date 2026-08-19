const { DataTypes } = require("sequelize")
const {db} = require("../config/db")
const jenisMuatan = require("./jenisMuatanModel")
const satuanMuatan = require("./satuanMuatanModel")
const klasifikasiMuatan = require("./klasifikasiMuatanModel")

const kategoriMuatan = db.define("kategori_muatan", {
    id_kategori_muatan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_kategori_muatan: {
        type: DataTypes.STRING,
        unique: true
    },
    excel_column_name: DataTypes.STRING,
    status_kategori_muatan: DataTypes.STRING,
    bobot_per_unit_kg: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    id_jenis_muatan: {
        type: DataTypes.INTEGER,
        references: {
            model: jenisMuatan,
            key: "id_jenis_muatan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_satuan_muatan: {
        type: DataTypes.INTEGER,
        references: {
            model: satuanMuatan,
            key: "id_satuan_muatan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_klasifikasi_muatan: {
        type: DataTypes.INTEGER,
        references: {
            model: klasifikasiMuatan,
            key: "id_klasifikasi_muatan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    }
}, 
{
    freezeTableName: true
})

module.exports = kategoriMuatan