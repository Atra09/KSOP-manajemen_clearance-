const { Op } = require("sequelize")
const kabupaten = require("../model/kabupatenModel")
const kecamatan = require("../model/kecamatanModel")
const logUserController = require("./logUserController")

const getKecamatan = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await kecamatan.findAll({
            order: [['id_kecamatan', 'DESC']],
            where: {
                nama_kecamatan: {
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

const getKecamatanById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await kecamatan.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeKecamatan = async (req, res) => {
    try {
        let data = await kabupaten.findByPk(req.body.id_kabupaten)
        if (!data) return res.status(500).json({ msg: "data kabupaten tidak ditemukan" })

        await kecamatan.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "kecamatan",
            `Menambah data kecamatan ${req.body.nama_kecamatan}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateKecamatan = async (req, res) => {
    try {
        let kecamatanData = await kecamatan.findOne({
            where: { id_kecamatan: req.params.id },
            attributes: ['nama_kecamatan']
        })
        let result = await kecamatan.update({ ...req.body }, { where: { id_kecamatan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "kecamatan",
            `Mengubah data kecamatan ${(kecamatanData.nama_kecamatan == req.body.nama_kecamatan) ?
                kecamatanData.nama_kecamatan : kecamatanData.nama_kecamatan + "->" + req.body.nama_kecamatan}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteKecamatan = async (req, res) => {
    try {
        let kecamatanData = await kecamatan.findOne({
            where: { id_kecamatan: req.params.id },
            attributes: ['nama_kecamatan', 'createdAt']
        })

        let kecamatanDate = new Date(kecamatanData.createdAt)
        let now = new Date()

        let dateDifference = Math.floor((now - kecamatanDate) / (1000 * 60 * 60 * 24))

        if (dateDifference > 10) return res.status(500).json({ msg: "data tidak bisa dihapus" })

        let result = await kecamatan.destroy({ where: { id_kecamatan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "kecamatan",
            `Menghapus data kecamatan ${kecamatanData.nama_kecamatan}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getKecamatan, getKecamatanById, storeKecamatan, updateKecamatan, deleteKecamatan }