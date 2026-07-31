const express = require('express')
const router = express.Router()
const {
    getPelabuhan,
    getPelabuhanById,
    storePelabuhan,
    updatePelabuhan,
    deletePelabuhan
} = require("../controller/pelabuhanController")

router.get("/", getPelabuhan)
router.get("/:id", getPelabuhanById)
router.post("/store", storePelabuhan)
router.patch("/update/:id", updatePelabuhan)
router.delete("/delete/:id", deletePelabuhan)

module.exports = router