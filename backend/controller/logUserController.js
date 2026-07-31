const logUser = require("../model/logUserModel");
const { Op } = require("sequelize");

const getLogUser = async (req, res) => {
    let { search, limit, page } = req.query;
    search = search || "";
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    try {
        const { count, rows } = await logUser.findAndCountAll({
            where: {
                [Op.or]: [
                    { 'username': { [Op.like]: `%${search}%` } },
                    { 'aksi': { [Op.like]: `%${search}%` } },
                    { 'jenis_data': { [Op.like]: `%${search}%` } },
                    { 'data_diubah': { [Op.like]: `%${search}%` } },
                ]
            },
            limit: limitNum,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ 
            msg: "Berhasil mengambil data", 
            datas: rows, 
            totalItems: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" });
    }
};

const getLogUserByFilter = async (req, res) => {
    let { aksi, jenis_data, tanggal_awal, tanggal_akhir, username, limit, page } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    try {
        let whereLogUser = {};

        if (aksi) whereLogUser.aksi = { [Op.like]: `%${aksi}%` };
        if (jenis_data) whereLogUser.jenis_data = { [Op.like]: `%${jenis_data}%` };
        if (username) whereLogUser.username = { [Op.like]: `%${username}%` };
        if (tanggal_awal && tanggal_akhir) {
            whereLogUser.tanggal = { [Op.between]: [new Date(tanggal_awal), new Date(tanggal_akhir)] };
        } else if (tanggal_awal) {
            whereLogUser.tanggal = { [Op.gte]: new Date(tanggal_awal) };
        } else if (tanggal_akhir) {
            whereLogUser.tanggal = { [Op.lte]: new Date(tanggal_akhir) };
        }

        const { count, rows } = await logUser.findAndCountAll({
            where: whereLogUser,
            limit: limitNum,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ 
            msg: "Berhasil mengambil data", 
            datas: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" });
    }
};


const getLogUserById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await logUser.findByPk(id)

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeLogUser = async (username, aksi, jenis_data, data_diubah) => {
    try {
        let now = new Date()

        let date = now.getDate()
        let month = now.getMonth() + 1
        let year = now.getFullYear()
        date = (date < 10) ? '0' + String(date) : date
        month = (month < 10) ? '0' + String(month) : month
        const tanggal = `${year}-${month}-${date}`

        let hour = now.getHours()
        let minute = now.getMinutes()
        let second = now.getSeconds()
        hour = (hour < 10) ? '0' + String(hour) : hour
        minute = (minute < 10) ? '0' + String(minute) : minute
        second = (second < 10) ? '0' + String(second) : second
        const waktu = `${hour}:${minute}:${second}`

        let data = await logUser.create({ username, aksi, jenis_data, data_diubah, tanggal, waktu })

        return data
    } catch (error) {
        console.log(error)
        throw error;
    }
}

module.exports = { getLogUser, getLogUserById, getLogUserByFilter, storeLogUser }