const { Op } = require("sequelize");
const satuanMuatan = require("../model/satuanMuatanModel");
const logUserController = require("./logUserController");

const getSatuanMuatan = async (req, res) => {
    let search = req.query.search || "";
    try {
        const datas = await satuanMuatan.findAll({
            order: [['id_satuan_muatan', 'DESC']],
            where: {
                nama_satuan_muatan: {
                    [Op.like]: `%${search}%`
                }
            }
        });
        return res.status(200).json({ msg: "Berhasil mengambil data", datas });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" });
    }
};

const getSatuanMuatanById = async (req, res) => {
    try {
        let id = req.params.id;
        let data = await satuanMuatan.findByPk(id);

        if (data == null) return res.status(404).json({ msg: "data tidak ditemukan" });

        return res.status(200).json({ msg: "Berhasil mengambil data", data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" });
    }
};

const storeSatuanMuatan = async (req, res) => {
    try {
        await satuanMuatan.create({ ...req.body });

        if (req.user) {
            await logUserController.storeLogUser(
                req.user.username,
                "CREATE",
                "Satuan Muatan",
                `Menambah data satuan ${req.body.nama_satuan_muatan}`
            );
        }

        return res.status(200).json({ msg: "Berhasil menambahkan data" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" });
    }
};

const updateSatuanMuatan = async (req, res) => {
    try {
        let satuanData = await satuanMuatan.findOne({
            where: { id_satuan_muatan: req.params.id },
            attributes: ['nama_satuan_muatan']
        });

        if (!satuanData) return res.status(404).json({ msg: "data tidak ditemukan" });

        await satuanMuatan.update({ ...req.body }, { where: { id_satuan_muatan: req.params.id } });

        if (req.user) {
            await logUserController.storeLogUser(
                req.user.username,
                "UPDATE",
                "Satuan Muatan",
                `Mengubah data satuan ${satuanData.nama_satuan_muatan} -> ${req.body.nama_satuan_muatan || satuanData.nama_satuan_muatan}`
            );
        }

        return res.status(200).json({ msg: "Berhasil memperbarui data" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" });
    }
};

const deleteSatuanMuatan = async (req, res) => {
    try {
        let satuanData = await satuanMuatan.findOne({
            where: { id_satuan_muatan: req.params.id },
            attributes: ['nama_satuan_muatan']
        });

        if (!satuanData) return res.status(404).json({ msg: "data tidak ditemukan" });

        await satuanMuatan.destroy({ where: { id_satuan_muatan: req.params.id } });

        if (req.user) {
            await logUserController.storeLogUser(
                req.user.username,
                "DELETE",
                "Satuan Muatan",
                `Menghapus data satuan ${satuanData.nama_satuan_muatan}`
            );
        }

        return res.status(200).json({ msg: "Berhasil menghapus data" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" });
    }
};

module.exports = {
    getSatuanMuatan,
    getSatuanMuatanById,
    storeSatuanMuatan,
    updateSatuanMuatan,
    deleteSatuanMuatan
};
