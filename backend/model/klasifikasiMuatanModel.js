const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const klasifikasiMuatan = db.define("klasifikasi_muatan", {
    id_klasifikasi_muatan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_klasifikasi_muatan: {
        type: DataTypes.STRING,
        allowNull: false
    },
    keterangan_klasifikasi: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    freezeTableName: true
});

module.exports = klasifikasiMuatan;
