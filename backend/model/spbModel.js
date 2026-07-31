const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const spb = db.define('spb', {
    id_spb: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    no_spb: DataTypes.STRING,
    no_spb_asal: DataTypes.STRING
}, 
{
    freezeTableName: true
})

module.exports = spb