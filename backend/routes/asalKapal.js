const express = require('express');
const router = express.Router();
const {
    getAsalKapal,
    storeAsalKapal,
    updateAsalKapal,
    deleteAsalKapal
} = require("../controller/asalKapalController");

router.get("/", getAsalKapal);
router.post("/store", storeAsalKapal);
router.patch("/update/:id", updateAsalKapal);
router.delete("/delete/:id", deleteAsalKapal);

module.exports = router;
