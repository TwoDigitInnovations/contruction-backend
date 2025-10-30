const mongoose = require("mongoose");
const Setting = mongoose.model("Setting");

exports.getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(200).json({
        status: true,
        message: "No settings found, returning defaults",
        data: { TaxRate: 0, RatePerKM: 0 },
      });
    }

    res.status(200).json({
      status: true,
      message: "Settings fetched successfully",
      data: setting,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.saveSetting = async (req, res) => {
  try {
    const { TaxRate, RatePerKM } = req.body;

    let setting = await Setting.findOne();

    if (!setting) {

      setting = new Setting({ TaxRate, RatePerKM });
      await setting.save();
      return res.status(201).json({
        status: true,
        message: "Settings created successfully",
        data: setting,
      });
    } else {
      setting.TaxRate = TaxRate ?? setting.TaxRate;
      setting.RatePerKM = RatePerKM ?? setting.RatePerKM;
      await setting.save();

      return res.status(200).json({
        status: true,
        message: "Settings updated successfully",
        data: setting,
      });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
