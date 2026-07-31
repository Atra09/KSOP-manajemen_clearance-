const { DataTypes } = require("sequelize")
const { db } = require("../config/db")
const jenis = require("./jenisModel")
const negara = require("./negaraModel")

const kapal = db.define('kapal', {
    id_kapal: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_kapal: DataTypes.STRING,
    id_jenis: {
        type: DataTypes.INTEGER,
        references: {
            model: jenis,
            key: "id_jenis"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_bendera: {
        type: DataTypes.INTEGER,
        references: {
            model: negara,
            key: "id_negara"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    gt: DataTypes.INTEGER,
    nt: DataTypes.INTEGER,
    nomor_selar: DataTypes.INTEGER,
    tanda_selar: DataTypes.STRING,
    nomor_imo: DataTypes.STRING,
    call_sign: DataTypes.STRING,
},
    {
        freezeTableName: true
    })

module.exports = kapal