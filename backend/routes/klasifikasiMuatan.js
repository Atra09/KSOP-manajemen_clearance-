const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/jwt');
const {
    getKlasifikasiMuatan,
    getKlasifikasiMuatanById,
    storeKlasifikasiMuatan,
    updateKlasifikasiMuatan,
    deleteKlasifikasiMuatan
} = require('../controller/klasifikasiMuatanController');

router.get('/', verifyToken, getKlasifikasiMuatan);
router.get('/detail/:id', verifyToken, getKlasifikasiMuatanById);
router.post('/store', verifyToken, storeKlasifikasiMuatan);
router.patch('/update/:id', verifyToken, updateKlasifikasiMuatan);
router.delete('/delete/:id', verifyToken, deleteKlasifikasiMuatan);

module.exports = router;
