const { fn, col, Op } = require("sequelize");
const { kategoriMuatan, jenisMuatan, satuanMuatan, klasifikasiMuatan } = require("../model/association");
const logUserController = require("./logUserController")

const getKategoriMuatanOptions = async (req, res) => {
    try {
        const datas = await kategoriMuatan.findAll({
            attributes: [
                [fn('DISTINCT', col('status_kategori_muatan')), 'status_kategori_muatan'],
                'nama_kategori_muatan'
            ],
            group: ['status_kategori_muatan', 'nama_kategori_muatan']
        });

        console.log(datas)

        const categories = [...new Set(datas.map(d => d.status_kategori_muatan).filter(Boolean))];
        const goods = [...new Set(datas.map(d => d.nama_kategori_muatan).filter(Boolean))];

        return res.status(200).json({
            msg: "Berhasil mengambil data",
            datas: { categories, goods }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const getKategoriMuatan = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await kategoriMuatan.findAll({
            order: [['id_kategori_muatan', 'DESC']],
            where: {
                nama_kategori_muatan: {
                    [Op.like]: `%${search}%`
                }
            },
            include: [
                { model: jenisMuatan, as: 'jenis_muatan' },
                { model: satuanMuatan, as: 'satuan_muatan' },
                { model: klasifikasiMuatan, as: 'klasifikasi_muatan' }
            ]
        })
        return res.status(200).json({ msg: "Berhasil mengambil data", datas })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const getKategoriMuatanById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await kategoriMuatan.findByPk(id, {
            include: [
                { model: jenisMuatan, as: 'jenis_muatan' },
                { model: satuanMuatan, as: 'satuan_muatan' },
                { model: klasifikasiMuatan, as: 'klasifikasi_muatan' }
            ]
        })

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeKategoriMuatan = async (req, res) => {
    try {
        let payload = { ...req.body };
        if (!payload.id_satuan_muatan || payload.id_satuan_muatan === "") {
            payload.id_satuan_muatan = null;
        }
        if (!payload.id_jenis_muatan || payload.id_jenis_muatan === "") {
            payload.id_jenis_muatan = null;
        }
        if (!payload.id_klasifikasi_muatan || payload.id_klasifikasi_muatan === "") {
            payload.id_klasifikasi_muatan = null;
        }

        if (payload.bobot_per_unit_kg !== undefined && payload.bobot_per_unit_kg !== null && payload.bobot_per_unit_kg !== '') {
            payload.bobot_per_unit_kg = parseFloat(payload.bobot_per_unit_kg) || 0;
        } else {
            payload.bobot_per_unit_kg = 0;
        }

        await kategoriMuatan.create(payload);

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "Kategori Muatan",
            `Menambah data kategori ${req.body.nama_kategori_muatan}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateKategoriMuatan = async (req, res) => {
    try {
        let kategoriData = await kategoriMuatan.findOne({
            where: { id_kategori_muatan: req.params.id },
            attributes: ['nama_kategori_muatan']
        })

        let payload = { ...req.body };
        if (!payload.id_satuan_muatan || payload.id_satuan_muatan === "") {
            payload.id_satuan_muatan = null;
        }
        if (!payload.id_jenis_muatan || payload.id_jenis_muatan === "") {
            payload.id_jenis_muatan = null;
        }
        if (!payload.id_klasifikasi_muatan || payload.id_klasifikasi_muatan === "") {
            payload.id_klasifikasi_muatan = null;
        }

        if (payload.bobot_per_unit_kg !== undefined && payload.bobot_per_unit_kg !== null && payload.bobot_per_unit_kg !== '') {
            payload.bobot_per_unit_kg = parseFloat(payload.bobot_per_unit_kg) || 0;
        } else {
            payload.bobot_per_unit_kg = 0;
        }

        let result = await kategoriMuatan.update(payload, { where: { id_kategori_muatan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "Kategori Muatan",
            `Mengubah data kategori ${(kategoriData.nama_kategori_muatan == req.body.nama_kategori_muatan) ?
                kategoriData.nama_kategori_muatan : kategoriData.nama_kategori_muatan + "->" + req.body.nama_kategori_muatan}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteKategoriMuatan = async (req, res) => {
    try {
        let kategoriData = await kategoriMuatan.findOne({
            where: { id_kategori_muatan: req.params.id },
            attributes: ['nama_kategori_muatan']
        })

        if (!kategoriData) return res.status(500).json({ msg: "data tidak ditemukan" })

        let result = await kategoriMuatan.destroy({ where: { id_kategori_muatan: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "Kategori Muatan",
            `Menghapus data kategori ${kategoriData.nama_kategori_muatan}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { getKategoriMuatan, getKategoriMuatanById, storeKategoriMuatan, updateKategoriMuatan, deleteKategoriMuatan, getKategoriMuatanOptions }