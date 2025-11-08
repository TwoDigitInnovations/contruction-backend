const mongoose = require("mongoose");
const Review = mongoose.model("Review");
const response = require("../responses");

module.exports = {
addreview: async (req, res) => {
    try {
      const payload = req?.body || {};
      const userId = req.user.id;
      payload.rateby = userId;
      if (payload.driverrating&& payload.driver) {
        const review = new Review({rateby:userId,
          rateto: payload.driver,
          rating: payload.driverrating,
          comment:payload?.driverreview});
        await review.save();
      }
      if (payload.vendorrating&& payload.vendor) {
        const review = new Review({rateby:userId,
          rateto: payload.vendor,
          rating: payload.vendorrating,
          comment:payload?.vendorreview});
        await review.save();
      }
      if (payload.productrating&& payload.product) {
        const review = new Review({rateby:userId,
          rateto: payload.product,
          rating: payload.productrating,
          comment:payload?.productreview,
          product:payload.product});
        await review.save();
      }

      return response.ok(res, { message: "Review submitted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },


  getReviewByUser: async (req, res) => {
  try {
    const userId = req.user.id;
    const { driver, vendor, product } = req.query;

    const [driverReview, vendorReview, productReview] = await Promise.all([
      driver ? Review.findOne({ rateby: userId, rateto: driver }) : null,
      vendor ? Review.findOne({ rateby: userId, rateto: vendor }) : null,
      product ? Review.findOne({ rateby: userId, product }) : null,
    ]);

    return response.ok(res, { driverReview, vendorReview, productReview });
  } catch (error) {
    return response.error(res, error);
  }
}

}