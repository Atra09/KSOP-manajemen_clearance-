const { Op } = require("sequelize")
const negara = require("../model/negaraModel")
const logUserController = require("./logUserController")

const getNegara = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await negara.findAll({
            order: [['id_negara', 'DESC']],
            where: {
                nama_negara: {
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

const getNegaraById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await negara.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeNegara = async (req, res) => {
    try {
        await negara.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "negara",
            `Menambah data negara ${req.body.nama_negara}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateNegara = async (req, res) => {
    try {
        let negaraData = await negara.findOne({
            where: { id_negara: req.params.id },
            attributes: ['nama_negara']
        })
        let result = await negara.update({ ...req.body }, { where: { id_negara: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "negara",
            `Mengubah data negara ${(negaraData.nama_negara == req.body.nama_negara) ?
                negaraData.nama_negara : negaraData.nama_negara + "->" + req.body.nama_negara}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteNegara = async (req, res) => {
    try {
        let negaraData = await negara.findOne({
            where: { id_negara: req.params.id },
            attributes: ['nama_negara', 'createdAt']
        })

        let negaraDate = new Date(negaraData.createdAt)
        let now = new Date()

        let dateDifference = Math.floor((now - negaraDate) / (1000 * 60 * 60 * 24))

        if (dateDifference > 10) return res.status(500).json({ msg: "data tidak bisa dihapus" })

        let result = await negara.destroy({ where: { id_negara: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "negara",
            `Menghapus data negara ${negaraData.nama_negara}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getNegara, getNegaraById, storeNegara, updateNegara, deleteNegara }