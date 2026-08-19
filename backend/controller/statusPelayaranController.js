const statusPelayaran = require('../model/statusPelayaranModel');
const logUserController = require('./logUserController');

const getStatusPelayaran = async (req, res) => {
    try {
        const datas = await statusPelayaran.findAll({
            order: [['id_status', 'ASC']]
        });
        return res.status(200).json({ datas });
    } catch (error) {
        console.error("Get status pelayaran error:", error);
        return res.status(500).json({ msg: "Gagal mengambil data status pelayaran" });
    }
};

const storeStatusPelayaran = async (req, res) => {
    try {
        const { kode_status, nama_status, deskripsi, badge_color } = req.body;

        if (!kode_status || !nama_status) {
            return res.status(400).json({ msg: "Kode status dan nama status wajib diisi." });
        }

        const formattedKode = kode_status.trim().toUpperCase();

        const existing = await statusPelayaran.findOne({ where: { kode_status: formattedKode } });
        if (existing) {
            return res.status(400).json({ msg: `Kode status '${formattedKode}' sudah digunakan.` });
        }

        const newStatus = await statusPelayaran.create({
            kode_status: formattedKode,
            nama_status,
            deskripsi,
            badge_color: badge_color || 'emerald',
            is_default: false
        });

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(
                    req.user.id,
                    `Menambahkan status pelayaran baru: ${formattedKode} (${nama_status})`
                );
            }
        } catch (logErr) {
            console.error("Log error:", logErr);
        }

        return res.status(201).json({ msg: "Status pelayaran berhasil ditambahkan", data: newStatus });
    } catch (error) {
        console.error("Store status pelayaran error:", error);
        return res.status(500).json({ msg: "Gagal menambahkan status pelayaran" });
    }
};

const updateStatusPelayaran = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_status, nama_status, deskripsi, badge_color } = req.body;

        const target = await statusPelayaran.findByPk(id);
        if (!target) {
            return res.status(404).json({ msg: "Status pelayaran tidak ditemukan." });
        }

        const formattedKode = kode_status ? kode_status.trim().toUpperCase() : target.kode_status;

        if (formattedKode !== target.kode_status) {
            const existing = await statusPelayaran.findOne({ where: { kode_status: formattedKode } });
            if (existing) {
                return res.status(400).json({ msg: `Kode status '${formattedKode}' sudah digunakan.` });
            }
        }

        await target.update({
            kode_status: formattedKode,
            nama_status: nama_status || target.nama_status,
            deskripsi: deskripsi !== undefined ? deskripsi : target.deskripsi,
            badge_color: badge_color || target.badge_color
        });

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(
                    req.user.id,
                    `Mengubah status pelayaran ID ${id}: ${formattedKode}`
                );
            }
        } catch (logErr) {
            console.error("Log error:", logErr);
        }

        return res.status(200).json({ msg: "Status pelayaran berhasil diperbarui", data: target });
    } catch (error) {
        console.error("Update status pelayaran error:", error);
        return res.status(500).json({ msg: "Gagal memperbarui status pelayaran" });
    }
};

const deleteStatusPelayaran = async (req, res) => {
    try {
        const { id } = req.params;
        const target = await statusPelayaran.findByPk(id);

        if (!target) {
            return res.status(404).json({ msg: "Status pelayaran tidak ditemukan." });
        }

        const deletedKode = target.kode_status;
        await target.destroy();

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(
                    req.user.id,
                    `Menghapus status pelayaran: ${deletedKode}`
                );
            }
        } catch (logErr) {
            console.error("Log error:", logErr);
        }

        return res.status(200).json({ msg: "Status pelayaran berhasil dihapus" });
    } catch (error) {
        console.error("Delete status pelayaran error:", error);
        return res.status(500).json({ msg: "Gagal menghapus status pelayaran" });
    }
};

module.exports = {
    getStatusPelayaran,
    storeStatusPelayaran,
    updateStatusPelayaran,
    deleteStatusPelayaran
};
