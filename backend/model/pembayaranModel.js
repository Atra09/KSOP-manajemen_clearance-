const { DataTypes } = require("sequelize")
const {db} = require("../config/db")
const perjalanan = require("./perjalananModel")

const pembayaran = db.define("pembayaran", {
    id_pembayaran: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipe_pembayaran: DataTypes.ENUM("labuh", "rambu"),
    ntpn: DataTypes.STRING,
    nilai: DataTypes.INTEGER,
    id_perjalanan: {
        type: DataTypes.INTEGER,
        references: {
            model: perjalanan,
            key: "id_perjalanan"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
}, {freezeTableName: true})

module.exports = pembayaran