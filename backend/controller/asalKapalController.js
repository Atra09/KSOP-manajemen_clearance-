const { Op } = require("sequelize")
const asalKapal = require("../model/asalKapalModel")
const kabupaten = require("../model/kabupatenModel")
const logUserController = require("./logUserController")

const getAsalKapal = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await asalKapal.findAll({
            order: [['nama_asal_kapal', 'ASC']],
            where: {
                nama_asal_kapal: {
                    [Op.like]: `%${search}%`
                }
            }
        })
        return res.status(200).json({ msg: "Berhasil mengambil data", datas })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" })
    }
}

const storeAsalKapal = async (req, res) => {
    try {
        const { nama_asal_kapal } = req.body
        if (!nama_asal_kapal || !nama_asal_kapal.trim()) {
            return res.status(400).json({ msg: "Nama asal kapal wajib diisi." })
        }

        const existing = await asalKapal.findOne({ where: { nama_asal_kapal: nama_asal_kapal.trim() } })
        if (existing) {
            return res.status(400).json({ msg: `Asal kapal '${nama_asal_kapal.trim()}' sudah ada.` })
        }

        const newData = await asalKapal.create({ nama_asal_kapal: nama_asal_kapal.trim() })

        try {
            await kabupaten.findOrCreate({
                where: { nama_kabupaten: nama_asal_kapal.trim() },
                defaults: { nama_kabupaten: nama_asal_kapal.trim() }
            })
        } catch (kabErr) { console.error("Kabupaten sync error:", kabErr) }

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(req.user.id, `Menambahkan asal kapal: ${nama_asal_kapal.trim()}`)
            }
        } catch (logErr) { console.error("Log error:", logErr) }

        return res.status(201).json({ msg: "Asal kapal berhasil ditambahkan", data: newData })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Gagal menambahkan asal kapal" })
    }
}

const updateAsalKapal = async (req, res) => {
    try {
        const { id } = req.params
        const { nama_asal_kapal } = req.body

        const target = await asalKapal.findByPk(id)
        if (!target) return res.status(404).json({ msg: "Asal kapal tidak ditemukan." })

        if (nama_asal_kapal && nama_asal_kapal.trim() !== target.nama_asal_kapal) {
            const existing = await asalKapal.findOne({ where: { nama_asal_kapal: nama_asal_kapal.trim() } })
            if (existing) {
                return res.status(400).json({ msg: `Asal kapal '${nama_asal_kapal.trim()}' sudah ada.` })
            }
        }

        const newName = nama_asal_kapal ? nama_asal_kapal.trim() : target.nama_asal_kapal
        await target.update({ nama_asal_kapal: newName })

        try {
            await kabupaten.findOrCreate({
                where: { nama_kabupaten: newName },
                defaults: { nama_kabupaten: newName }
            })
        } catch (kabErr) { console.error("Kabupaten sync error:", kabErr) }

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(req.user.id, `Mengubah asal kapal ID ${id}: ${nama_asal_kapal}`)
            }
        } catch (logErr) { console.error("Log error:", logErr) }

        return res.status(200).json({ msg: "Asal kapal berhasil diperbarui", data: target })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Gagal memperbarui asal kapal" })
    }
}

const deleteAsalKapal = async (req, res) => {
    try {
        const { id } = req.params
        const target = await asalKapal.findByPk(id)
        if (!target) return res.status(404).json({ msg: "Asal kapal tidak ditemukan." })

        const deletedName = target.nama_asal_kapal
        await target.destroy()

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(req.user.id, `Menghapus asal kapal: ${deletedName}`)
            }
        } catch (logErr) { console.error("Log error:", logErr) }

        return res.status(200).json({ msg: "Asal kapal berhasil dihapus" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Gagal menghapus asal kapal" })
    }
}

module.exports = { getAsalKapal, storeAsalKapal, updateAsalKapal, deleteAsalKapal }
