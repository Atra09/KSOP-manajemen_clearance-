const express = require('express')
const router = express.Router()
const {
    getProvinsi,
    getProvinsiById,
    storeProvinsi,
    updateProvinsi,
    deleteProvinsi
} = require("../controller/provinsiController")

router.get("/", getProvinsi)
router.get("/:id", getProvinsiById)
router.post("/store", storeProvinsi)
router.patch("/update/:id", updateProvinsi)
router.delete("/delete/:id", deleteProvinsi)

module.exports = router