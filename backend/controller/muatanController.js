const perjalanan = require("../model/perjalananModel")
const muatan = require("../model/muatanModel")
const { Op } = require("sequelize")

const getMuatan = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await muatan.findAll({
            order: [['id_muatan', 'DESC']],
            where: {
                nama_muatan: {
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

const getMuatanById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await muatan.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeMuatan = async (data, t) => {
    try {
        console.log(data)

        let newMuatan = await muatan.bulkCreate(data, { transaction: t })

        return newMuatan
    } catch (error) {
        console.log(error)
        throw error;
    }
}

const updateMuatan = async (data, id_perjalanan, t) => {
    try {
        console.log(id_perjalanan)
        await muatan.destroy({ where: { id_perjalanan } })
        if (data.length > 0) await muatan.bulkCreate(data, { transaction: t })
    } catch (error) {
        console.log(error)
        throw new Error("terjadi kesalahan pada fungsi")
    }
}

const deleteMuatan = async (id, t) => {
    try {
        let result = await muatan.destroy({ where: { id_muatan: id }, transaction: t })

        if (result == 0) throw new Error("Data muatan tidak ditemukan")
    } catch (error) {
        console.log(error)
        throw new Error(error.message)
    }
}

module.exports = { getMuatan, getMuatanById, storeMuatan, updateMuatan, deleteMuatan }