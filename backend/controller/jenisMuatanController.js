const { Op } = require("sequelize")
const jenisMuatan = require("../model/jenisMuatanModel")
const logUserController = require("./logUserController")

const getJenisMuatan = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await jenisMuatan.findAll({
            order: [['id_jenis_muatan', 'DESC']],
            where: {
                nama_jenis_muatan: {
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

const getJenisMuatanById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await jenisMuatan.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeJenisMuatan = async (req, res) => {
    try {
        await jenisMuatan.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "Jenis Muatan Kapal",
            `Menambah data jenis Muatan ${req.body.nama_jenis_muatan}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateJenisMuatan = async (req, res) => {
    try {
        let jenisMuatanData = await jenisMuatan.findOne({
            where: { id_jenis_muatan: req.params.id },
            attributes: ['nama_jenis_muatan']
        })
        let result = await jenisMuatan.update({ ...req.body }, { where: { id_jenis_muatan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "Jenis Muatan Kapal",
            `Mengubah data jenis Muatan ${(jenisMuatanData.nama_jenis_muatan == req.body.nama_jenis_muatan) ?
                jenisMuatanData.nama_jenis_muatan : jenisMuatanData.nama_jenis_muatan + "->" + req.body.nama_jenis_muatan}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteJenisMuatan = async (req, res) => {
    try {
        let jenisMuatanData = await jenisMuatan.findOne({
            where: { id_jenis_muatan: req.params.id },
            attributes: ['nama_jenis_muatan', 'createdAt']
        })

        let jenisMuatanDate = new Date(jenisMuatanData.createdAt)
        let now = new Date()

        let dateDifference = Math.floor((now - jenisMuatanDate) / (1000 * 60 * 60 * 24))

        if (dateDifference > 10) return res.status(500).json({ msg: "data tidak bisa dihapus" })

        let result = await jenisMuatan.destroy({ where: { id_jenis_muatan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "JenisMuatan Kapal",
            `Menghapus data jenisMuatan ${jenisMuatanData.nama_jenis_muatan}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getJenisMuatan, getJenisMuatanById, storeJenisMuatan, updateJenisMuatan, deleteJenisMuatan }