const { Op } = require("sequelize")
const agen = require("../model/agenModel")
const logUserController = require("./logUserController")

const getAgen = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await agen.findAll({
            order: [['id_agen', 'DESC']],
            where: {
                nama_agen: {
                    [Op.like] : `%${search}%`
                }
            }
        })
        return res.status(200).json({ msg: "Berhasil mengambil data", datas })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const getAgenById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await agen.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeAgen = async (req, res) => {
    try {
        await agen.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "agen",
            `Menambah data agen ${req.body.nama_agen}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateAgen = async (req, res) => {
    try {
        let agenData = await agen.findOne({
            where: { id_agen: req.params.id },
            attributes: ['nama_agen']
        })
        let result = await agen.update({ ...req.body }, { where: { id_agen: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "agen",
            `Mengubah data agen ${(agenData.nama_agen == req.body.nama_agen) ?
                agenData.nama_agen : agenData.nama_agen + "->" + req.body.nama_agen}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteAgen = async (req, res) => {
    try {
        let agenData = await agen.findOne({
            where: { id_agen: req.params.id },
            attributes: ['nama_agen', 'createdAt']
        })

        let agenDate = new Date(agenData.createdAt)
        let now = new Date()

        let dateDifference = Math.floor((now - agenDate) / (1000 * 60 * 60 * 24))

        if (dateDifference > 10) return res.status(500).json({ msg: "data tidak bisa dihapus" })

        let result = await agen.destroy({ where: { id_agen: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "agen",
            `Menghapus data agen ${agenData.nama_agen}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getAgen, getAgenById, storeAgen, updateAgen, deleteAgen }