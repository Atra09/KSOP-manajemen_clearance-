const { Op } = require("sequelize")
const nahkoda = require("../model/nahkodaModel")
const perjalanan = require("../model/perjalananModel")
const logUserController = require("./logUserController")

const getNahkoda = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await nahkoda.findAll({
            order: [['id_nahkoda', 'DESC']],
            where: {
                nama_nahkoda: {
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

const getNahkodaById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await nahkoda.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeNahkoda = async (req, res) => {
    try {
        await nahkoda.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "nahkoda",
            `Menambah data nahkoda ${req.body.nama_nahkoda}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateNahkoda = async (req, res) => {
    try {
        let nahkodaData = await nahkoda.findOne({
            where: { id_nahkoda: req.params.id },
            attributes: ['nama_nahkoda']
        })
        let result = await nahkoda.update({ ...req.body }, { where: { id_nahkoda: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "nahkoda",
            `Mengubah data nahkoda ${(nahkodaData.nama_nahkoda == req.body.nama_nahkoda) ?
                nahkodaData.nama_nahkoda : nahkodaData.nama_nahkoda + "->" + req.body.nama_nahkoda}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteNahkoda = async (req, res) => {
    try {
        let nahkodaData = await nahkoda.findOne({
            where: { id_nahkoda: req.params.id },
            attributes: ['nama_nahkoda']
        })

        if (!nahkodaData) return res.status(404).json({ msg: "data tidak ditemukan" })

        const countPerjalanan = await perjalanan.count({ where: { id_nahkoda: req.params.id } });
        if (countPerjalanan > 0) {
            return res.status(400).json({
                msg: `Data nahkoda '${nahkodaData.nama_nahkoda}' tidak dapat dihapus karena sedang digunakan dalam ${countPerjalanan} data transaksi clearance/perjalanan.`
            });
        }

        let result = await nahkoda.destroy({ where: { id_nahkoda: req.params.id } })

        if (result == 0) return res.status(404).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "nahkoda",
            `Menghapus data nahkoda ${nahkodaData.nama_nahkoda}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getNahkoda, getNahkodaById, storeNahkoda, updateNahkoda, deleteNahkoda }