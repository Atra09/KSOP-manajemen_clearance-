const express = require('express')
const router = express.Router()
const {
    getKapal,
    getKapalById,
    storeKapal,
    updateKapal,
    deleteKapal,
    getTotalKapal,
    getTotalKapalNow,
    getKapalOptions
} = require("../controller/kapalController")

router.get("/", getKapal)
router.get("/option", getKapalOptions)
router.get("/total", getTotalKapal)
router.get("/total-today", getTotalKapalNow)
router.get("/:id", getKapalById)
router.post("/store", storeKapal)
router.patch("/update/:id", updateKapal)
router.delete("/delete/:id", deleteKapal)

module.exports = router