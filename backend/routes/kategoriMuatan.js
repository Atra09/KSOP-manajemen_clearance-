const express = require('express')
const router = express.Router()
const {
    getKategoriMuatan,
    getKategoriMuatanById,
    storeKategoriMuatan,
    updateKategoriMuatan,
    deleteKategoriMuatan,
    getKategoriMuatanOptions
} = require("../controller/kategoriMuatanController")

router.get("/", getKategoriMuatan)
router.get("/option", getKategoriMuatanOptions)
router.get("/:id", getKategoriMuatanById)
router.post("/store", storeKategoriMuatan)
router.patch("/update/:id", updateKategoriMuatan)
router.delete("/delete/:id", deleteKategoriMuatan)

module.exports = router