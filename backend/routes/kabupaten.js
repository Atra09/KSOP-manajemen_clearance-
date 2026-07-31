const express = require('express')
const router = express.Router()
const {
    getKabupaten,
    getKabupatenById,
    storeKabupaten,
    updateKabupaten,
    deleteKabupaten
} = require("../controller/kabupatenController")

router.get("/", getKabupaten)
router.get("/:id", getKabupatenById)
router.post("/store", storeKabupaten)
router.patch("/update/:id", updateKabupaten)
router.delete("/delete/:id", deleteKabupaten)

module.exports = router