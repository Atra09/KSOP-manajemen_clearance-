const { Op } = require("sequelize")
const jenis = require("../model/jenisModel")
const logUserController = require("./logUserController")

const getJenis = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await jenis.findAll({
            order: [['id_jenis', 'DESC']],
            where: {
                nama_jenis: {
                    [Op.like]: `%${search}%`
                }
            }
        })
        return res.status(200).json({ msg: "Berhasil mengambil data", datas })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const getJenisById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await jenis.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeJenis = async (req, res) => {
    try {
        await jenis.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "Jenis Kapal",
            `Menambah data jenis ${req.body.nama_jenis}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateJenis = async (req, res) => {
    try {
        let jenisData = await jenis.findOne({
            where: { id_jenis: req.params.id },
            attributes: ['nama_jenis']
        })
        let result = await jenis.update({ ...req.body }, { where: { id_jenis: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "Jenis Kapal",
            `Mengubah data jenis ${(jenisData.nama_jenis == req.body.nama_jenis) ?
                jenisData.nama_jenis : jenisData.nama_jenis + "->" + req.body.nama_jenis}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteJenis = async (req, res) => {
    try {
        let jenisData = await jenis.findOne({
            where: { id_jenis: req.params.id },
            attributes: ['nama_jenis', 'createdAt']
        })

        let jenisDate = new Date(jenisData.createdAt)
        let now = new Date()

        let dateDifference = Math.floor((now - jenisDate) / (1000 * 60 * 60 * 24))

        if (dateDifference > 10) return res.status(500).json({ msg: "data tidak bisa dihapus" })

        let result = await jenis.destroy({ where: { id_jenis: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "Jenis Kapal",
            `Menghapus data jenis ${jenisData.nama_jenis}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getJenis, getJenisById, storeJenis, updateJenis, deleteJenis }