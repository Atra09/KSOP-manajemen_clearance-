const express = require('express');
const router = express.Router();
const {
    getSpbAsal,
    storeSpbAsal,
    updateSpbAsal,
    deleteSpbAsal
} = require("../controller/spbAsalController");

router.get("/", getSpbAsal);
router.post("/store", storeSpbAsal);
router.patch("/update/:id", updateSpbAsal);
router.delete("/delete/:id", deleteSpbAsal);

module.exports = router;
