const { Sequelize } = require("sequelize");
const { db } = require("../config/db");

const { DataTypes } = Sequelize;

const statusPelayaran = db.define('status_pelayaran', {
    id_status: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    kode_status: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nama_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    badge_color: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'emerald' // emerald, amber, red, blue, purple, gray
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    freezeTableName: true,
    timestamps: true
});

module.exports = statusPelayaran;
