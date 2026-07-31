const express = require('express')
const router = express.Router()
const {
    getNahkoda,
    getNahkodaById,
    storeNahkoda,
    updateNahkoda,
    deleteNahkoda
} = require("../controller/nahkodaController")

router.get("/", getNahkoda)
router.get("/:id", getNahkodaById)
router.post("/store", storeNahkoda)
router.patch("/update/:id", updateNahkoda)
router.delete("/delete/:id", deleteNahkoda)

module.exports = router