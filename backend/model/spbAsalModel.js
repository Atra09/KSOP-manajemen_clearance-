const { Sequelize } = require("sequelize");
const { db } = require("../config/db");

const { DataTypes } = Sequelize;

const spbAsal = db.define('spb_asal', {
    id_spb_asal: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    kode_spb: {
        type: DataTypes.STRING,
        allowNull: false
    },
    asal: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: true,
    timestamps: true
});

module.exports = spbAsal;
