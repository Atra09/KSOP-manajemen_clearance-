const { DataTypes } = require('sequelize')
const { db } = require('../config/db')
const spb = require('./spbModel')
const kapal = require('./kapalModel')
const nahkoda = require('./nahkodaModel')
const kecamatan = require('./kecamatanModel')
const agen = require('./agenModel')
const kabupaten = require('./kabupatenModel')
const users = require('./userModel')
const pelabuhan = require('./pelabuhanModel')

const perjalanan = db.define("perjalanan", {
    id_perjalanan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ppk: DataTypes.ENUM("27", "29"),
    id_spb: {
        type: DataTypes.INTEGER,
        references: {
            model: spb,
            key: "id_spb"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    no_urut: DataTypes.STRING,
    id_kapal: {
        type: DataTypes.INTEGER,
        references: {
            model: kapal,
            key: "id_kapal"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_nahkoda: {
        type: DataTypes.INTEGER,
        references: {
            model: nahkoda,
            key: "id_nahkoda"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    jumlah_crew: DataTypes.INTEGER,
    id_kedudukan_kapal: {
        type: DataTypes.INTEGER,
        references: {
            model: kabupaten,
            key: "id_kabupaten"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    tanggal_datang: DataTypes.DATEONLY,
    id_datang_dari: {
        type: DataTypes.INTEGER,
        references: {
            model: kecamatan,
            key: "id_kecamatan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    tanggal_berangkat: DataTypes.DATEONLY,
    id_tempat_singgah: {
        type: DataTypes.INTEGER,
        references: {
            model: kecamatan,
            key: "id_kecamatan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_tujuan_akhir: {
        type: DataTypes.INTEGER,
        references: {
            model: kecamatan,
            key: "id_kecamatan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_tolak: {
        type: DataTypes.INTEGER,
        references: {
            model: pelabuhan,
            key: "id_pelabuhan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_sandar: {
        type: DataTypes.INTEGER,
        references: {
            model: pelabuhan,
            key: "id_pelabuhan"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    id_agen: {
        type: DataTypes.INTEGER,
        references: {
            model: agen,
            key: "id_agen"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
    },
    tanggal_clearance: DataTypes.DATEONLY,
    pukul_agen_clearance: DataTypes.TIME,
    pukul_kapal_berangkat: DataTypes.STRING,
    status_muatan_berangkat: DataTypes.ENUM("NIHIL", "SESUAI MANIFEST"),
    penumpang_turun: DataTypes.INTEGER,
    penumpang_naik: DataTypes.INTEGER,
    wilayah_kerja: DataTypes.ENUM("dungkek", "pusat")
},
    {
        freezeTableName: true
    })

module.exports = perjalanan