const { kategoriMuatan, satuanMuatan, muatan } = require("../model/association")
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

/**
 * Helper to process a single cargo item payload and map to database columns (unit, ton, m3, liter)
 * with auto-calculated tonnage if countable item has bobot_per_unit_kg > 0.
 */
const processSingleMuatan = async (item) => {
    if (!item.id_kategori_muatan) return item;

    // 1. Fetch Master Data: Query kategori_muatan joined with satuan_muatan
    const cat = await kategoriMuatan.findByPk(item.id_kategori_muatan, {
        include: [{ model: satuanMuatan, as: 'satuan_muatan' }]
    });

    const nama_satuan_muatan = String(cat?.satuan_muatan?.nama_satuan_muatan || 'unit').toLowerCase().trim();
    const bobot_per_unit_kg = parseFloat(cat?.bobot_per_unit_kg || 0);

    const jumlah = parseFloat(item.jumlah !== undefined && item.jumlah !== null && item.jumlah !== '' 
        ? item.jumlah 
        : (item.quantity !== undefined && item.quantity !== null && item.quantity !== '' 
            ? item.quantity 
            : (item.unit || item.ton || item.liter || item.m3 || 0))) || 0;

    // 2. Initialize Variables
    let insertUnit = null;
    let insertTon = null;
    let insertM3 = null;
    let insertLiter = null;

    // 3. Primary Mapping based on Unit
    if (nama_satuan_muatan === 'ton') {
        insertTon = jumlah;
    } else if (nama_satuan_muatan === 'm3' || nama_satuan_muatan === 'm³') {
        insertM3 = jumlah;
    } else if (nama_satuan_muatan === 'liter') {
        insertLiter = jumlah;
    } else {
        // For all other units ('unit', 'dus', 'tabung', 'biji', 'ekor', 'kg', 'box', etc.)
        insertUnit = jumlah;

        // 4. The Auto-Calculate Tonnage Logic (CRUCIAL)
        if (bobot_per_unit_kg > 0) {
            let calculatedTon = (jumlah * bobot_per_unit_kg) / 1000;
            insertTon = calculatedTon;
        }
    }

    // 5. Build Final Object
    return {
        id_perjalanan: item.id_perjalanan,
        id_kategori_muatan: item.id_kategori_muatan,
        jenis_perjalanan: item.jenis_perjalanan,
        unit: insertUnit,
        ton: insertTon,
        m3: insertM3,
        liter: insertLiter
    };
};

const processMuatanPayload = async (data = []) => {
    if (Array.isArray(data)) {
        const processed = [];
        for (const item of data) {
            processed.push(await processSingleMuatan(item));
        }
        return processed;
    } else {
        return [await processSingleMuatan(data)];
    }
};

/**
 * POST / Route Handler for inserting a single muatan record
 */
const createMuatanRecord = async (req, res) => {
    try {
        const { id_perjalanan, id_kategori_muatan, jumlah, jenis_perjalanan } = req.body;

        if (!id_kategori_muatan || jumlah === undefined) {
            return res.status(400).json({ msg: "id_kategori_muatan dan jumlah harus diisi" });
        }

        const mappedPayload = await processSingleMuatan({
            id_perjalanan,
            id_kategori_muatan,
            jumlah,
            jenis_perjalanan
        });

        const newRecord = await muatan.create(mappedPayload);

        return res.status(201).json({
            msg: "Berhasil menambahkan data muatan",
            data: newRecord
        });
    } catch (error) {
        console.error("Create Muatan Error:", error);
        return res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
};

const storeMuatan = async (data, t) => {
    try {
        const preparedData = await processMuatanPayload(data);
        console.log("Storing prepared muatan payload:", preparedData);

        let newMuatan = await muatan.bulkCreate(preparedData, { transaction: t })
        return newMuatan
    } catch (error) {
        console.log(error)
        throw error;
    }
}

const updateMuatan = async (data, id_perjalanan, t) => {
    try {
        console.log(id_perjalanan)
        await muatan.destroy({ where: { id_perjalanan }, transaction: t })
        if (data.length > 0) {
            const preparedData = await processMuatanPayload(data);
            console.log("Updating prepared muatan payload:", preparedData);
            await muatan.bulkCreate(preparedData, { transaction: t })
        }
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

module.exports = {
    getMuatan,
    getMuatanById,
    storeMuatan,
    updateMuatan,
    deleteMuatan,
    processSingleMuatan,
    processMuatanPayload,
    createMuatanRecord
}