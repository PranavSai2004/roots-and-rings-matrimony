const express = require("express");
const router = express.Router();

const {
  createMarriageDetails,
  getMarriageDetails,
  updateMarriageDetails,
  deleteMarriageDetails
} = require("../controllers/marriageDetailsController");

router.post("/marriage-details", createMarriageDetails);
router.get("/marriage-details/:userId", getMarriageDetails);
router.put("/marriage-details/:userId", updateMarriageDetails);
router.delete("/marriage-details/:userId", deleteMarriageDetails);

module.exports = router;
