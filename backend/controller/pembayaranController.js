const perjalanan = require("../model/perjalananModel")
const pembayaran = require("../model/pembayaranModel")

const getPembayaran = async (req, res) => {
    try {
        const datas = await pembayaran.findAll()
        return res.status(200).json({ msg: "Berhasil mengambil data", datas })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const getPembayaranById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await pembayaran.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storePembayaran = async (data, t) => {
    try {
        console.log(data)

        let newpembayaran = await pembayaran.bulkCreate(data, { transaction: t })

        return newpembayaran
    } catch (error) {
        console.log(error)
        throw error;
    }
}

const updatePembayaran = async (data, id_perjalanan, t) => {
    try {
        console.log(id_perjalanan)
        await pembayaran.destroy({ where: { id_perjalanan } })
        if(data.length > 0) await pembayaran.bulkCreate(data, { transaction: t })
    } catch (error) {
        console.log(error)
        throw new Error("terjadi kesalahan pada fungsi")
    }
}

const deletePembayaran = async (id, t) => {
    try {
        let result = await pembayaran.destroy({ where: { id_pembayaran: id }, transaction: t })

        if (result == 0) throw new Error("Data pembayaran tidak ditemukan")
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

module.exports = { getPembayaran, getPembayaranById, storePembayaran, updatePembayaran, deletePembayaran }