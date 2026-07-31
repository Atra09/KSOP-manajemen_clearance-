const express = require('express')
const router = express.Router()
const {
    getKecamatan,
    getKecamatanById,
    storeKecamatan,
    updateKecamatan,
    deleteKecamatan
} = require("../controller/kecamatanController")

router.get("/", getKecamatan)
router.get("/:id", getKecamatanById)
router.post("/store", storeKecamatan)
router.patch("/update/:id", updateKecamatan)
router.delete("/delete/:id", deleteKecamatan)

module.exports = router