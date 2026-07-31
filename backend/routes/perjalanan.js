const express = require('express')
const router = express.Router()
const {
    getPerjalanan,
    getPerjalananById,
    storePerjalanan,
    updatePerjalanan,
    deletePerjalanan,
    getPerjalananByFilter,
    getTotalPerjalananPerMonth,
    getTotalPerKategori,
    getTotalPerjalananThisMonth,
    getTotalPerjalananNow,
    getPerjalananFilterOptions // <-- TAMBAHKAN INI
} = require("../controller/perjalananController")


router.get("/filter", getPerjalananByFilter)
router.get("/filter-options", getPerjalananFilterOptions)

router.get("/total", getTotalPerjalananThisMonth)
router.get("/total-today", getTotalPerjalananNow)
router.get("/total-kategori", getTotalPerKategori)
router.get("/total-month", getTotalPerjalananPerMonth)

router.get("/", getPerjalanan)
router.post("/store", storePerjalanan)

router.get("/:id", getPerjalananById) 
router.patch("/update/:id", updatePerjalanan)
router.delete("/delete/:id", deletePerjalanan)

module.exports = router