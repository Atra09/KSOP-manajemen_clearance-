const express = require('express');
const router = express.Router();
const {
    getSatuanMuatan,
    getSatuanMuatanById,
    storeSatuanMuatan,
    updateSatuanMuatan,
    deleteSatuanMuatan
} = require('../controller/satuanMuatanController');
const verifyToken = require('../middleware/jwt');

router.get('/', verifyToken, getSatuanMuatan);
router.get('/:id', verifyToken, getSatuanMuatanById);
router.post('/store', verifyToken, storeSatuanMuatan);
router.patch('/update/:id', verifyToken, updateSatuanMuatan);
router.delete('/delete/:id', verifyToken, deleteSatuanMuatan);

module.exports = router;
