const express = require('express')
const router = express.Router()
const {
    getJenis,
    getJenisById,
    storeJenis,
    updateJenis,
    deleteJenis
} = require("../controller/jenisController")

router.get("/", getJenis)
router.get("/:id", getJenisById)
router.post("/store", storeJenis)
router.patch("/update/:id", updateJenis)
router.delete("/delete/:id", deleteJenis)

module.exports = router