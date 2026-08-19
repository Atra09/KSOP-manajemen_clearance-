const { DataTypes } = require("sequelize");
const { db } = require("../config/db");

const satuanMuatan = db.define("satuan_muatan", {
    id_satuan_muatan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_satuan_muatan: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    keterangan_satuan: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true
});

module.exports = satuanMuatan;
