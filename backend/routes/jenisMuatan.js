const express = require('express')
const router = express.Router()
const {
    getJenisMuatan,
    getJenisMuatanById,
    storeJenisMuatan,
    updateJenisMuatan,
    deleteJenisMuatan,
} = require("../controller/jenisMuatanController")

router.get("/", getJenisMuatan)
router.get("/:id", getJenisMuatanById)
router.post("/store", storeJenisMuatan)
router.patch("/update/:id", updateJenisMuatan)
router.delete("/delete/:id", deleteJenisMuatan)

module.exports = router