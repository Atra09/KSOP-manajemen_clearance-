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
  const ext = path.extname(file.originalname)

  if(!allowedTypes.includes(ext.toLowerCase())) return cb(new Error("Format file tidak sesuai"))
    cb(null, true)
}

const upload = multer({storage, fileFilter})

router.post('/login', login);

router.use(verifyToken)

router.get('/', adminAuth, getUser);
router.get('/:id', userAuth, getUserById);
router.post('/store', adminAuth, upload.single("foto"), storeUser)
router.patch('/update/:id', userAuth, upload.single("foto"), updateUser)
router.patch('/change-password', changePassword)
router.delete('/delete/:id', userAuth, deleteUser)

module.exports = router;
