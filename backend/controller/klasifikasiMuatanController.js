const { Op } = require("sequelize");
const { klasifikasiMuatan, kategoriMuatan } = require("../model/association");
const logUserController = require("./logUserController");

const getKlasifikasiMuatan = async (req, res) => {
    let search = req.query.search || "";
    try {
        const datas = await klasifikasiMuatan.findAll({
            order: [['id_klasifikasi_muatan', 'DESC']],
            where: {
                nama_klasifikasi_muatan: {
                    [Op.like]: `%${search}%`
                }
            }
        });
        return res.status(200).json({ msg: "Berhasil mengambil data", datas });
    } catch (error) {
        console.error("Get Klasifikasi Muatan Error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const getKlasifikasiMuatanById = async (req, res) => {
    try {
        let id = req.params.id;
        let data = await klasifikasiMuatan.findByPk(id);

        if (!data) return res.status(404).json({ msg: "Data tidak ditemukan" });

        return res.status(200).json({ msg: "Berhasil mengambil data", data });
    } catch (error) {
        console.error("Get Klasifikasi Muatan By ID Error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const storeKlasifikasiMuatan = async (req, res) => {
    try {
        const { nama_klasifikasi_muatan, keterangan_klasifikasi } = req.body;

        if (!nama_klasifikasi_muatan) {
            return res.status(400).json({ msg: "Nama Klasifikasi Muatan wajib diisi" });
        }

        const newRecord = await klasifikasiMuatan.create({
            nama_klasifikasi_muatan,
            keterangan_klasifikasi
        });

        if (req.user) {
            await logUserController.storeLogUser(
                req.user.username,
                "CREATE",
                "Klasifikasi Muatan",
                `Menambah data klasifikasi ${nama_klasifikasi_muatan}`
            );
        }

        return res.status(200).json({ msg: "Berhasil menambahkan data", data: newRecord });
    } catch (error) {
        console.error("Store Klasifikasi Muatan Error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const updateKlasifikasiMuatan = async (req, res) => {
    try {
        let item = await klasifikasiMuatan.findByPk(req.params.id);

        if (!item) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { nama_klasifikasi_muatan, keterangan_klasifikasi } = req.body;

        await item.update({
            nama_klasifikasi_muatan: nama_klasifikasi_muatan || item.nama_klasifikasi_muatan,
            keterangan_klasifikasi: keterangan_klasifikasi !== undefined ? keterangan_klasifikasi : item.keterangan_klasifikasi
        });

        if (req.user) {
            await logUserController.storeLogUser(
                req.user.username,
                "UPDATE",
                "Klasifikasi Muatan",
                `Mengubah data klasifikasi ${nama_klasifikasi_muatan}`
            );
        }

        return res.status(200).json({ msg: "Berhasil memperbarui data" });
    } catch (error) {
        console.error("Update Klasifikasi Muatan Error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const deleteKlasifikasiMuatan = async (req, res) => {
    try {
        let item = await klasifikasiMuatan.findByPk(req.params.id);

        if (!item) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const countKategori = await kategoriMuatan.count({ where: { id_klasifikasi_muatan: req.params.id } });
        if (countKategori > 0) {
            return res.status(400).json({
                msg: `Data klasifikasi muatan '${item.nama_klasifikasi_muatan}' tidak dapat dihapus karena sedang digunakan oleh ${countKategori} kategori muatan.`
            });
        }

        await item.destroy();

        if (req.user) {
            await logUserController.storeLogUser(
                req.user.username,
                "DELETE",
                "Klasifikasi Muatan",
                `Menghapus data klasifikasi ${item.nama_klasifikasi_muatan}`
            );
        }

        return res.status(200).json({ msg: "Berhasil menghapus data" });
    } catch (error) {
        console.error("Delete Klasifikasi Muatan Error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

module.exports = {
    getKlasifikasiMuatan,
    getKlasifikasiMuatanById,
    storeKlasifikasiMuatan,
    updateKlasifikasiMuatan,
    deleteKlasifikasiMuatan
};
