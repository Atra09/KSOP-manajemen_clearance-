const express = require('express');
const router = express.Router();
const {
    getStatusPelayaran,
    storeStatusPelayaran,
    updateStatusPelayaran,
    deleteStatusPelayaran
} = require("../controller/statusPelayaranController");

router.get("/", getStatusPelayaran);
router.post("/store", storeStatusPelayaran);
router.patch("/update/:id", updateStatusPelayaran);
router.delete("/delete/:id", deleteStatusPelayaran);

module.exports = router;
