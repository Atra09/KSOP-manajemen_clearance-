const { Op } = require("sequelize")
const pelabuhan = require("../model/pelabuhanModel")
const logUserController = require("./logUserController")

const getPelabuhan = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await pelabuhan.findAll({
            order: [['id_pelabuhan', 'DESC']],
            where: {
                nama_pelabuhan: {
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

const getPelabuhanById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await pelabuhan.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storePelabuhan = async (req, res) => {
    try {
        await pelabuhan.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "pelabuhan",
            `Menambah data pelabuhan ${req.body.nama_pelabuhan}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updatePelabuhan = async (req, res) => {
    try {
        let pelabuhanData = await pelabuhan.findOne({
            where: { id_pelabuhan: req.params.id },
            attributes: ['nama_pelabuhan']
        })
        let result = await pelabuhan.update({ ...req.body }, { where: { id_pelabuhan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "pelabuhan",
            `Mengubah data pelabuhan ${(pelabuhanData.nama_pelabuhan == req.body.nama_pelabuhan) ?
                pelabuhanData.nama_pelabuhan : pelabuhanData.nama_pelabuhan + "->" + req.body.nama_pelabuhan}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deletePelabuhan = async (req, res) => {
    try {
        let pelabuhanData = await pelabuhan.findOne({
            where: { id_pelabuhan: req.params.id },
            attributes: ['nama_pelabuhan', 'createdAt']
        })
        let result = await pelabuhan.destroy({ where: { id_pelabuhan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "pelabuhan",
            `Menghapus data pelabuhan ${pelabuhanData.nama_pelabuhan}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getPelabuhan, getPelabuhanById, storePelabuhan, updatePelabuhan, deletePelabuhan }