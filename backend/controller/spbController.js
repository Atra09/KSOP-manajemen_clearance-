const perjalanan = require("../model/perjalananModel")
const spb = require("../model/spbModel")

const getSpb = async (req, res) => {
    try {
        const datas = await spb.findAll()
        return res.status(200).json({ msg: "Berhasil mengambil data", datas })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const getSpbById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await spb.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeSpb = async (no_spb_asal, no_spb, t) => {
    try {
        if (no_spb_asal == "") no_spb_asal = null
        if (no_spb == "") no_spb = null
        let newSpb = await spb.create({ no_spb_asal, no_spb }, {transaction: t})

        return newSpb
    } catch (error) {
        console.log(error)
        throw error;
    }
}

const updateSpb = async (no_spb_asal, no_spb, id, t) => {
    try {
        if (no_spb_asal == "") no_spb_asal = null
        if (no_spb == "") no_spb = null
        
        let result = await spb.update({ no_spb_asal, no_spb }, { where: { id_spb: id }, transaction: t })
        console.log(result, id)
        if (result == 0) throw new Error("Data spb tidak ditemukan")
    } catch (error) {
        console.log(error)
        throw new Error("terjadi kesalahan pada fungsi")
    }
}

const deleteSpb = async (id, t) => {
    try {
        let result = await spb.destroy({ where: { id_spb: id }, transaction: t })
        
        if (result == 0) throw new Error("Data spb tidak ditemukan")
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

module.exports = { getSpb, getSpbById, storeSpb, updateSpb, deleteSpb }