const path = require("path")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const salt = 10
const perjalanan = require("../model/perjalananModel")
const users = require("../model/userModel")
const logUserController = require("./logUserController")
const { Op } = require("sequelize")

const login = async (req, res) => {
    try {
        let { username, password } = req.body
        console.log(req.body)
        const data = await users.findOne({ where: { username } })
        if (!data) return res.status(401).json({ msg: "Username tidak ditemukan" })

        const match = await bcrypt.compare(password, data.password)
        if (!match) return res.status(401).json({ msg: "Username / password tidak sesuai" })

        const token = jwt.sign({
            id: data.id_user,
            username: data.username
        }, process.env.JWT_SECRET, { expiresIn: "3h" })

        return res.status(200).json({ msg: "Berhasil login", token })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const getUser = async (req, res) => {
    let search = req.query.search || ""
    try {
        const datas = await users.findAll({
            order: [['id_user', 'DESC']],
            attributes: {
                exclude: ['password']
            },
            where: {
                [Op.or]: {
                    username: {
                        [Op.like]: `%${search}%`
                    },
                    nama_lengkap: {
                        [Op.like]: `%${search}%`
                    },
                    wilayah_kerja: {
                        [Op.like]: `%${search}%`
                    },
                    role: {
                        [Op.like]: `%${search}%`
                    },
                    jabatan: {
                        [Op.like]: `%${search}%`
                    },
                }
            }
        })
        return res.status(200).json({ msg: "Berhasil mengambil data", datas })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const getUserById = async (req, res) => {
    try {
        let id = req.params.id
        let data = await users.findByPk(id, {
            attributes: {
                exclude: ['password']
            }
        })

        if (data == null) return res.status(500).json({ msg: "data tidak ditemukan" })

        return res.status(200).json({ msg: "Berhasil mengambil data", data })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const storeUser = async (req, res) => {
    try {
        let data = await users.findOne({ where: { username: req.body.username } })
        if (data) return res.status(500).json({ msg: "Username sudah ada" })

        if (req.file) {
            req.body.foto = `images/profil/${req.file.filename}`
        }

        req.body.password = await bcrypt.hash(req.body.password, salt)
        await users.create({ ...req.body })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "CREATE",
            "user",
            `Menambah data ${req.body.role} ${req.body.username}`
        )

        return res.status(200).json({ msg: "Berhasil menambahkan data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const updateUser = async (req, res, next) => {
    try {
        let user = await users.findByPk(req.user.id)
        let userData = await users.findOne({
            where: { id_user: req.params.id },
            attributes: ['username']
        })
        let data = await users.findOne({ where: { username: req.body.username } })
        if (data && data.id_user != req.params.id) return res.status(500).json({ msg: "Username sudah ada" })

        if (req.file) {
            let data = await users.findByPk(req.params.id)
            if (data.foto) {
                let oldFile = path.join(__dirname, "../public", data.foto)
                console.log(oldFile)
                fs.unlinkSync(oldFile)
            }
            req.body.foto = `images/profil/${req.file.filename}`
        }
        if (user.role != "superuser" && req.body.password) {
            delete req.body.password
            console.log()
        } else if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, salt)
        }
        let result = await users.update({ ...req.body }, { where: { id_user: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "UPDATE",
            "user",
            `Mengubah data user ${(userData.username == req.body.username) ?
                userData.username : userData.username + "->" + req.body.username}`
        )

        return res.status(200).json({ msg: "Berhasil memperbarui data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const changePassword = async (req, res, next) => {
    try {
        let { newPassword, currentPassword } = req.body

        let data = await users.findOne({
            where: {
                id_user: req.user.id
            }
        })

        const match = await bcrypt.compare(currentPassword, data.password)
        if (!match) return res.status(500).json({ msg: "Password saat ini tidak sesuai" })

        let hashedPassword = await bcrypt.hash(newPassword, salt)

        await users.update({ password: hashedPassword }, { where: { id_user: req.user.id } })

        return res.status(200).json({ msg: "berhasil mengubah password" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

const deleteUser = async (req, res) => {
    try {
        let userData = await users.findOne({
            where: { id_user: req.params.id },
            attributes: ['username']
        })
        let data = await users.findByPk(req.params.id)
        if (data.foto) {
            let file = path.join(__dirname, "../public", data.foto)
            console.log(file)
            fs.unlinkSync(file)
        }
        let result = await users.destroy({ where: { id_user: req.params.id } })

        if (result == 0) return res.status(500).json({ msg: "data tidak ditemukan" })

        let log = await logUserController.storeLogUser(
            req.user.username,
            "DELETE",
            "user",
            `Menghapus data user ${userData.username}`
        )

        return res.status(200).json({ msg: "Berhasil menghapus data" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "terjadi kesalahan pada fungsi" })
    }
}

module.exports = { login, getUser, getUserById, storeUser, updateUser, changePassword, deleteUser }