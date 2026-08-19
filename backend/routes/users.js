var express = require('express');
var router = express.Router();
const path = require("path")
const multer = require("multer");
const verifyToken = require(`../middleware/jwt`)
const { storeUser, getUser, updateUser, getUserById, deleteUser, login, changePassword } = require('../controller/userController');
const { userAuth, adminAuth } = require('../middleware/authorization');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/profil')
  },
  filename: (req, file, cb) => {
    let name = file.originalname.replace(/ /g, '+')
    let random = Math.floor(Math.random() * 9000) + 1000
    cb(null, `${random}${name}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.png', '.jpg', '.jpeg']
  const ext = path.extname(file.originalname).toLowerCase()

  if (!allowedTypes.includes(ext)) {
    return cb(new Error("Format file tidak sesuai! Hanya file PNG, JPG, dan JPEG yang diperbolehkan."))
  }
  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

const uploadFotoSingle = (req, res, next) => {
  upload.single("foto")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: "Ukuran file terlalu besar! Maksimal 5MB." })
      }
      return res.status(400).json({ msg: err.message })
    } else if (err) {
      return res.status(400).json({ msg: err.message })
    }
    next()
  })
}

router.post('/login', login);

router.use(verifyToken)

router.get('/', adminAuth, getUser);
router.get('/:id', userAuth, getUserById);
router.post('/store', adminAuth, uploadFotoSingle, storeUser)
router.patch('/update/:id', userAuth, uploadFotoSingle, updateUser)
router.patch('/change-password', changePassword)
router.delete('/delete/:id', userAuth, deleteUser)

module.exports = router;

