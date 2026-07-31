const express = require('express')
const router = express.Router()
const {
    getNegara,
    getNegaraById,
    storeNegara,
    updateNegara,
    deleteNegara
} = require("../controller/negaraController")

router.get("/", getNegara)
router.get("/:id", getNegaraById)
router.post("/store", storeNegara)
router.patch("/update/:id", updateNegara)
router.delete("/delete/:id", deleteNegara)

module.exports = router