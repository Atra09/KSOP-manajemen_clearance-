const { Op } = require("sequelize")
const kabupaten = require("../model/kabupatenModel")
const provinsi = require("../model/provinsiModel")
const logUserController = require("./logUserController")

const getKabupaten = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await kabupaten.findAll({
            order: [['id_kabupaten', 'DESC']],
            where: {
                nama_kabupaten: {
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

const getKabupatenById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await kabupaten.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeKabupaten = async (req, res) => {
    try {
        let data = await provinsi.findByPk(req.body.id_provinsi)
        if (!data) return res.status(500).json({ msg: "data provinsi tidak ditemukan" })

        await kabupaten.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "kabupaten",
            `Menambah data kabupaten ${req.body.nama_kabupaten}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateKabupaten = async (req, res) => {
    try {
        let kabupatenData = await kabupaten.findOne({
            where: { id_kabupaten: req.params.id },
            attributes: ['nama_kabupaten']
        })
        let result = await kabupaten.update({ ...req.body }, { where: { id_kabupaten: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "kabupaten",
            `Mengubah data kabupaten ${(kabupatenData.nama_kabupaten == req.body.nama_kabupaten) ?
                kabupatenData.nama_kabupaten : kabupatenData.nama_kabupaten + "->" + req.body.nama_kabupaten}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteKabupaten = async (req, res) => {
    try {
        let kabupatenData = await kabupaten.findOne({
            where: { id_kabupaten: req.params.id },
            attributes: ['nama_kabupaten', 'createdAt']
        })

        let kabupatenDate = new Date(kabupatenData.createdAt)
        let now = new Date()

        let dateDifference = Math.floor((now - kabupatenDate) / (1000 * 60 * 60 * 24))

        if (dateDifference > 10) return res.status(500).json({ msg: "data tidak bisa dihapus" })

        let result = await kabupaten.destroy({ where: { id_kabupaten: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "kabupaten",
            `Menghapus data kabupaten ${kabupatenData.nama_kabupaten}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getKabupaten, getKabupatenById, storeKabupaten, updateKabupaten, deleteKabupaten }