const express = require('express')
const router = express.Router()
const {
    getSpb,
    getSpbById,
    storeSpb,
    updateSpb,
    deleteSpb
} = require("../controller/spbController")

router.get("/", getSpb)
router.get("/:id", getSpbById)
router.post("/store", storeSpb)
router.patch("/update/:id", updateSpb)
router.delete("/delete/:id", deleteSpb)

module.exports = router