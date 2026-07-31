const { Op } = require("sequelize")
const negara = require("../model/negaraModel")
const provinsi = require("../model/provinsiModel")
const logUserController = require("./logUserController")

const getProvinsi = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await provinsi.findAll({
            order: [['id_provinsi', 'DESC']],
            where: {
                nama_provinsi: {
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

const getProvinsiById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await provinsi.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeProvinsi = async (req, res) => {
    try {
        let data = await negara.findByPk(req.body.id_negara)
        if (!data) return res.status(500).json({ msg: "data negara tidak ditemukan" })

        await provinsi.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "provinsi",
            `Menambah data provinsi ${req.body.nama_provinsi}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateProvinsi = async (req, res) => {
    try {
        let provinsiData = await provinsi.findOne({
            where: { id_provinsi: req.params.id },
            attributes: ['nama_provinsi']
        })
        let result = await provinsi.update({ ...req.body }, { where: { id_provinsi: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "provinsi",
            `Mengubah data provinsi ${(provinsiData.nama_provinsi == req.body.nama_provinsi) ?
                provinsiData.nama_provinsi : provinsiData.nama_provinsi + "->" + req.body.nama_provinsi}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteProvinsi = async (req, res) => {
    try {
        let provinsiData = await provinsi.findOne({
            where: { id_provinsi: req.params.id },
            attributes: ['nama_provinsi', 'createdAt']
        })

        let provinsiDate = new Date(provinsiData.createdAt)
        let now = new Date()

        let dateDifference = Math.floor((now - provinsiDate) / (1000 * 60 * 60 * 24))

        if (dateDifference > 10) return res.status(500).json({ msg: "data tidak bisa dihapus" })

        let result = await provinsi.destroy({ where: { id_provinsi: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "provinsi",
            `Menghapus data provinsi ${provinsiData.nama_provinsi}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getProvinsi, getProvinsiById, storeProvinsi, updateProvinsi, deleteProvinsi }