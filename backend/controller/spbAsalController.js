const { Op } = require("sequelize");
const spbAsal = require("../model/spbAsalModel");
const logUserController = require("./logUserController");

const getSpbAsal = async (req, res) => {
    let search = req.query.search || "";
    try {
        const datas = await spbAsal.findAll({
            order: [['updatedAt', 'DESC']],
            where: {
                [Op.or]: [
                    { kode_spb: { [Op.like]: `%${search}%` } },
                    { asal: { [Op.like]: `%${search}%` } }
                ]
            }
        });
        return res.status(200).json({ msg: "Berhasil mengambil data SPB Asal", datas });
    } catch (error) {
        console.error("GET SPB ASAL ERROR:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const storeSpbAsal = async (req, res) => {
    try {
        const { kode_spb, asal } = req.body;
        if (!kode_spb || !kode_spb.trim()) {
            return res.status(400).json({ msg: "Kode SPB wajib diisi." });
        }
        if (!asal || !asal.trim()) {
            return res.status(400).json({ msg: "Asal wajib diisi." });
        }

        const existing = await spbAsal.findOne({
            where: {
                kode_spb: kode_spb.trim(),
                asal: asal.trim()
            }
        });

        if (existing) {
            return res.status(400).json({ msg: `Kode SPB '${kode_spb.trim()}' dengan asal '${asal.trim()}' sudah ada.` });
        }

        const newData = await spbAsal.create({
            kode_spb: kode_spb.trim(),
            asal: asal.trim()
        });

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(req.user.id, `Menambahkan SPB Asal: ${kode_spb.trim()} - ${asal.trim()}`);
            }
        } catch (logErr) { console.error("Log error:", logErr); }

        return res.status(201).json({ msg: "SPB Asal berhasil ditambahkan", data: newData });
    } catch (error) {
        console.error("STORE SPB ASAL ERROR:", error);
        return res.status(500).json({ msg: "Gagal menambahkan SPB Asal" });
    }
};

const updateSpbAsal = async (req, res) => {
    try {
        const { id } = req.params;
        const { kode_spb, asal } = req.body;

        const target = await spbAsal.findByPk(id);
        if (!target) return res.status(404).json({ msg: "SPB Asal tidak ditemukan." });

        const newKode = kode_spb !== undefined ? kode_spb.trim() : target.kode_spb;
        const newAsal = asal !== undefined ? asal.trim() : target.asal;

        if (newKode !== target.kode_spb || newAsal !== target.asal) {
            const existing = await spbAsal.findOne({
                where: {
                    kode_spb: newKode,
                    asal: newAsal,
                    id_spb_asal: { [Op.ne]: id }
                }
            });
            if (existing) {
                return res.status(400).json({ msg: `Data SPB Asal '${newKode}' (${newAsal}) sudah ada.` });
            }
        }

        await target.update({
            kode_spb: newKode,
            asal: newAsal
        });

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(req.user.id, `Mengubah SPB Asal ID ${id}: ${newKode} - ${newAsal}`);
            }
        } catch (logErr) { console.error("Log error:", logErr); }

        return res.status(200).json({ msg: "SPB Asal berhasil diperbarui", data: target });
    } catch (error) {
        console.error("UPDATE SPB ASAL ERROR:", error);
        return res.status(500).json({ msg: "Gagal memperbarui SPB Asal" });
    }
};

const deleteSpbAsal = async (req, res) => {
    try {
        const { id } = req.params;
        const target = await spbAsal.findByPk(id);
        if (!target) return res.status(404).json({ msg: "SPB Asal tidak ditemukan." });

        const deletedDesc = `${target.kode_spb} - ${target.asal}`;
        await target.destroy();

        try {
            if (req.user && req.user.id) {
                await logUserController.createLogUser(req.user.id, `Menghapus SPB Asal: ${deletedDesc}`);
            }
        } catch (logErr) { console.error("Log error:", logErr); }

        return res.status(200).json({ msg: "SPB Asal berhasil dihapus" });
    } catch (error) {
        console.error("DELETE SPB ASAL ERROR:", error);
        return res.status(500).json({ msg: "Gagal menghapus SPB Asal" });
    }
};

module.exports = { getSpbAsal, storeSpbAsal, updateSpbAsal, deleteSpbAsal };
