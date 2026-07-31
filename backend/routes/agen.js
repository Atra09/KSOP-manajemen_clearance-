const express = require('express')
const router = express.Router()
const {
    getAgen,
    getAgenById,
    storeAgen,
    updateAgen,
    deleteAgen
} = require("../controller/agenController")

router.get("/", getAgen)
router.get("/:id", getAgenById)
router.post("/store", storeAgen)
router.patch("/update/:id", updateAgen)
router.delete("/delete/:id", deleteAgen)

module.exports = router