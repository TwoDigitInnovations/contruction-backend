"use strict";
const userHelper = require("./../helper/user");
const response = require("./../responses");
const passport = require("passport");
const jwtService = require("./../services/jwtService");
const mailNotification = require("./../services/mailNotification");
const mongoose = require("mongoose");
const { notify } = require("../services/notification");
const Product = mongoose.model("Product");

const User = mongoose.model("User");
const Verification = mongoose.model("Verification");
const Device = mongoose.model("Device");

module.exports = {
  //   sendOTPForSignUp: async (req, res) => {
  //     try {
  //       const payload = req.body;
  //       const user = await User.findOne({ phone: payload.phone });

  //       if (user) {
  //         return response.badReq(res, { message: "Number allready exist." });
  //       }
  //       const user2 = await User.findOne({ email: payload.email });

  //       if (user2) {
  //         return response.badReq(res, { message: "Email allready exist." });
  //       }

  //       let ran_otp = Math.floor(1000 + Math.random() * 9000);

  //       const veruser = await Verification.findOne({ phone: payload.email });

  //       if (veruser) {
  //         veruser.expiration_at = userHelper.getDatewithAddedMinutes(5);
  //         veruser.otp = ran_otp;
  //         await veruser.save();
  //       } else {
  //         // let ran_otp = "0000";
  //         let ver = new Verification({
  //           otp: ran_otp,
  //           phone: payload.email,
  //           expiration_at: userHelper.getDatewithAddedMinutes(5),
  //         });
  //         await ver.save();
  //       }
  //       await mailNotification.sendOTPmailForSignup({
  //         email: payload.email,
  //         code: ran_otp,
  //       });

  //       return response.ok(res, { message: "OTP sent to your email" });
  //     } catch (error) {
  //       return response.error(res, error);
  //     }
  //   },

  signUp: async (req, res) => {
    try {
      const payload = req.body;
      const mail = req.body.email;
      if (!mail) {
        return response.badReq(res, { message: "Email required." });
      }
      let user2 = await User.findOne({
        email: payload.email.toLowerCase(),
      });
      const user = await User.findOne({ phone: payload.phone });
      if (user) {
        return res.status(404).json({
          success: false,
          message: "Phone number already exists.",
        });
      }
      if (user2) {
        return res.status(404).json({
          success: false,
          message: "Email Id already exists.",
        });
      }
      let userdata = new User(payload);
      userdata.password = userdata.encryptPassword(req.body.password);
      await userdata.save();
      res.status(200).json({ success: true, data: userdata });
    } catch (error) {
      return response.error(res, error);
    }
  },

  login: (req, res) => {
    console.log(req.body);
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return response.error(res, err);
      }

      if (!user) {
        return response.unAuthorize(res, info);
      }

      console.log("user=======>>", user);
      let token = await new jwtService().createJwtToken({
        id: user._id,
        type: user.type,
      });
      await Device.updateOne(
        { device_token: req.body.device_token },
        { $set: { player_id: req.body.player_id, user: user._id } },
        { upsert: true }
      );
      const data = {
        token,
        ...user._doc,
      };
      delete data.password;
      return response.ok(res, data);
    })(req, res);
  },

  sendOTPForforgetpass: async (req, res) => {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email });

      if (!user) {
        return response.badReq(res, { message: "Email does nots exist." });
      }

      let ran_otp = Math.floor(1000 + Math.random() * 9000);
      await mailNotification.sendOTPmailForForgetPasword({
        email: email,
        code: ran_otp,
      });
      // let ran_otp='0000'
      let ver = new Verification({
        //email: email,
        user: user._id,
        otp: ran_otp,
        expiration_at: userHelper.getDatewithAddedMinutes(5),
      });
      await ver.save();
      // }
      let token = await userHelper.encode(ver._id);

      return response.ok(res, { message: "OTP sent.", token });
    } catch (error) {
      return response.error(res, error);
    }
  },
  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: "otp and token required." });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ":" + userHelper.getDatewithAddedMinutes(5).getTime()
        );
        ver.verified = true;
        await ver.save();
        return response.ok(res, { message: "OTP verified", token });
      } else {
        return response.notFound(res, { message: "Invalid OTP" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(":");
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: "Session expired." });
      }
      let otp = await Verification.findById(verID);
      if (!otp.verified) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      await Verification.findByIdAndDelete(verID);
      user.password = user.encryptPassword(password);
      await user.save();
      //mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed! Login now." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  //   getAllUsers: async (req, res) => {
  //     try {
  //       const user = await User.find();
  //       const data = [];
  //       user.map(async (item) => {
  //         delete item._doc.password;
  //         data.push({ ...item._doc });
  //       });
  //       // delete user.password;
  //       return response.ok(res, data);
  //     } catch (error) {
  //       return response.error(res, error);
  //     }
  //   },

  getProfile: async (req, res) => {
    // console.log(req.body);
    try {
      const data = await User.findById(req.user.id, '-password');

      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },
  // updateProfile: async (req, res) => {
  //   const payload = req.body;
  //   delete req.body.password;
  //   const userId = req?.params?.id || req.user.id;
  //   try {
  //     let userDetail = await User.findById(userId);
  //     console.log(userDetail.phone, req.body.phone);
  //     if (
  //       req.body.phone &&
  //       userDetail.phone !== req.body.phone &&
  //       !req.body.otp
  //     ) {
  //       let u = await User.findOne({ phone: req.body.phone });
  //       if (u) {
  //         return response.conflict(res, {
  //           message: "Phone Number already exist.",
  //         });
  //       }
  //       // await sendOtp.sendOtp(req.body.phone)
  //       // let ran_otp = Math.floor(1000 + Math.random() * 9000);
  //       let ran_otp = "0000";
  //       // const data = req.body;
  //       const newPoll = new Verification({
  //         phone: req.body.phone,
  //         otp: ran_otp,
  //         expiration_at: userHelper.getDatewithAddedMinutes(5),
  //       });
  //       await newPoll.save();
  //       return response.ok(res, {
  //         otp: true,
  //         message: "OTP sent to your phone number",
  //       });
  //     } else {
  //       if (payload.otp) {
  //         let ver = await Verification.findOne({ phone: payload.phone });
  //         console.log(ver);
  //         if (
  //           payload.otp === ver.otp &&
  //           !ver.verified &&
  //           new Date().getTime() < new Date(ver.expiration_at).getTime()
  //         ) {
  //           const u = await User.findByIdAndUpdate(
  //             userId,
  //             { $set: payload },
  //             {
  //               new: true,
  //               upsert: true,
  //             }
  //           );
  //           // let token = await new jwtService().createJwtToken({
  //           //   id: u._id,
  //           //   type: u.type,
  //           // });
  //           const data = {
  //             // token,
  //             ...u._doc,
  //           };
  //           delete data.password;
  //           await Verification.findOneAndDelete({ phone: payload.phone });
  //           return response.ok(res, data);
  //         } else {
  //           return res
  //             .status(404)
  //             .json({ success: false, message: "Invalid OTP" });
  //         }
  //       } else {
  //         const u = await User.findByIdAndUpdate(
  //           userId,
  //           { $set: payload },
  //           {
  //             new: true,
  //             upsert: true,
  //           }
  //         );
  //         let token = await new jwtService().createJwtToken({
  //           id: u._id,
  //           type: u.type,
  //         });
  //         const data = {
  //           token,
  //           ...u._doc,
  //         };
  //         delete data.password;
  //         await Verification.findOneAndDelete({ phone: payload.phone });
  //         return response.ok(res, data);
  //       }
  //     }
  //   } catch (error) {
  //     return response.error(res, error);
  //   }
  // },
  updateProfile: async (req, res) => {
    try {
      const payload = req.body;
      const userId = req?.params?.id || req.user.id;
      const user = await User.findOne({ phone: payload.phone });
      // if (user && user._id != userId) {
      //   return response.badReq(res, { message: "Phone number already exists." });
      // }
      // if (req.file && req.file.key) {
      //   payload.img=req.file.location
      // }
      if (payload?.location) {
        payload.location = JSON.parse(payload?.location)
      }
      if (req.files && req.files?.img?.length > 0) {
        payload.img = req.files?.img?.[0].location;
      }
      if (req.files && req.files?.tax_reg_img?.length > 0) {
        payload.tax_reg_img = req.files?.tax_reg_img?.[0].location;
      }
      if (req.files && req.files?.business_license_img?.length > 0) {
        payload.business_license_img = req.files?.business_license_img?.[0].location;
      }
      if (req.files && req.files?.driving_licence_img?.length > 0) {
        payload.driving_licence_img = req.files?.driving_licence_img?.[0].location;
      }
      if (req.files && req.files?.vehicle_doc_img?.length > 0) {
        payload.vehicle_doc_img = req.files?.vehicle_doc_img?.[0].location;
      }
      const u = await User.findByIdAndUpdate(
        userId,
        { $set: payload },
        {
          new: true,
          upsert: true,
        }
      );
      delete u.password;
      // let token = await new jwtService().createJwtToken({
      //   id: u._id,
      //   type: u.type,
      // });
      // const data = {
      //   token,
      //   ...u._doc,
      // };
      // delete data.password;
      return response.ok(res, u);
    } catch (error) {
      return response.error(res, error);
    }
  },

  driverupdatelocation: async (req, res) => {
    try {
      const track = req.body?.track;
      if (!track) {
        return response.error(res, "Location not provided");
      }
      console.log("track", track);
      await User.findByIdAndUpdate(req.user.id, { $set: { current_location: track } });
      return response.ok(res, { message: "Location Update successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateBasicProfile: async (req, res) => {
    const { username, email, phone } = req.body;
    const userId = req?.params?.id || req.user.id;

    try {

      let updateData = {};

      if (username && username.trim() !== '') {
        updateData.username = username.trim();
      }

      if (email && email.trim() !== '') {
        updateData.email = email.toLowerCase().trim();
      }

      if (phone && phone.trim() !== '') {
        updateData.phone = phone.trim();
      }

      console.log('Updating user with data:', updateData);

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) {
        return response.error(res, { message: "User not found" });
      }

      // Generate new token
      let token = await new jwtService().createJwtToken({
        id: updatedUser._id,
        type: updatedUser.type,
      });

      const responseData = {
        token,
        ...updatedUser._doc,
      };
      delete responseData.password;

      return response.ok(res, {
        message: "Profile updated successfully",
        data: responseData
      });

    } catch (error) {
      console.log('Update profile error:', error);
      return response.error(res, error);
    }
  },
  getAllDriver: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const date = req.query.date || '';
      const status = req.query.status || '';

      const skip = (page - 1) * limit;
      let query = { type: "DRIVER" };


      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Date filter
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        query.createdAt = {
          $gte: startDate,
          $lt: endDate
        };
      }

      // Status filter
      if (status) {
        query.verified = status;
      }

      const data = await User.find(query, "-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const totalCount = await User.countDocuments(query);

      return response.ok(res, {
        data,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getAllVendor: async (req, res) => {
    try {
      const { page, limit, search, date, status } = req.query;


      let query = { type: "VENDOR" };

      // Add search functionality
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { shop_name: { $regex: search, $options: 'i' } }
        ];
      }

      // Add date filter
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        query.createdAt = {
          $gte: startDate,
          $lt: endDate
        };
      }

      // Status filter
      if (status) {
        query.verified = status;
      }

      if (search) {
        const users = await User.find(query, "-password").sort({ createdAt: -1 });
        return response.ok(res, {
          data: users,
          totalCount: users.length,
          currentPage: 1,
          totalPages: 1,
        });
      }


      const skip = (page - 1) * limit;
      const users = await User.find(query, "-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const totalCount = await User.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);

      return response.ok(res, {
        data: users,
        totalCount,
        currentPage: parseInt(page),
        totalPages,
      });

    } catch (error) {
      return response.error(res, error);
    }
  },

  verifyuser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      user.verified = req?.body?.verified;
      await user.save();
      console.log("==>", user._id);

      if (req.body.verified === "VERIFIED") {
        await notify(
          user._id,
          "Account verified",
          "Your account is now verified"
        );
      }
      if (req.body.verified === "SUSPEND") {
        await notify(
          user._id,
          "Account suspended",
          "Your account is suspended"
        );
      }

      return response.ok(res, user);
    } catch (error) {
      return response.error(res, error);
    }
  },

  //   fileUpload: async (req, res) => {
  //     try {
  //       let key = req.file && req.file.key;
  //       return response.ok(res, {
  //         message: "File uploaded.",
  //         file: `${process.env.ASSET_ROOT}/${key}`,
  //       });
  //     } catch (error) {
  //       return response.error(res, error);
  //     }
  //   },
  shopsnearme: async (req, res) => {
    try {
      // const products = await Product.find({ category: req.body.categoryId }).select('posted_by');
      // console.log(products)

      // Extract vendor IDs
      // const vendorIds = [...new Set(products.map((product) => product.posted_by.toString()))];
      const vendorIds = await Product.distinct('posted_by', { category: req.body.categoryId });
      console.log(vendorIds)

      let rides = await User.find({
        _id: { $in: vendorIds },
        type: 'VENDOR',
        location: {
          $near: {
            $maxDistance: 1609.34 * 10,
            $geometry: {
              type: "Point",
              coordinates: req.body.location,
            },
          },
        },
      }, '-password');
      // console.log(req.body)
      // console.log(rides)
      return response.ok(res, rides);
    } catch (err) {
      return response.error(res, err);
    }
  },
  getVendorsByCategoryAndAttribute: async (req, res) => {
    try {
      const { categoryId, attributeName, location } = req.body;

      const result = await User.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: location },
            distanceField: "distance",
            spherical: true,
            maxDistance: 1609.34 * 10,
            query: { type: "VENDOR" },
          },
        },
        {
          $lookup: {
            from: "products",
            let: { vendorId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$posted_by", "$$vendorId"] },
                  category: new mongoose.Types.ObjectId(categoryId),
                  attributes: { $elemMatch: { name: attributeName } },
                },
              },
            ],
            as: "products",
          },
        },
        {
          $match: {
            products: { $ne: [] },
          },
        },
        {
          $project: {
            _id: 1,
            shop_name: 1,
            address: 1,
            type: 1,
            location: 1,
            distance: 1,
            products: 1,
          },
        },
      ]);
      console.log("result", result)
      return response.ok(res, result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { search, date, userType, status } = req.query;

      let filter = {};

      if (search && search.trim()) {
        filter.$or = [
          { username: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } }
        ];
      }

      if (date) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        filter.createdAt = {
          $gte: startOfDay,
          $lte: endOfDay
        };
      }


      if (userType && ['USER', 'VENDOR', 'DRIVER'].includes(userType)) {
        filter.type = userType;
      }


      if (status && ['VERIFIED', 'PENDING', 'SUSPEND'].includes(status)) {
        filter.verified = status;
      }


      let users, total;

      if (search || date) {

        users = await User.find(filter, "-password")
          .sort({ createdAt: -1 });
        total = users.length;
      } else {

        users = await User.find(filter, "-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        total = await User.countDocuments(filter);
      }

      return response.ok(res, {
        users,
        pagination: {
          total,
          page: search || date ? 1 : page,
          limit: search || date ? total : limit,
          pages: search || date ? 1 : Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
  updatePassword: async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmNewPassword } = req.body;
      const userId = req.user.id; // Assuming you have user ID from JWT middleware

      // Validate input
      if (!oldPassword || !newPassword || !confirmNewPassword) {
        return response.badReq(res, {
          message: "Old password, new password and confirm password are required."
        });
      }

      // Check if new password matches confirm password
      if (newPassword !== confirmNewPassword) {
        return response.badReq(res, {
          message: "New password and confirm password do not match."
        });
      }

      // Validate new password length (optional)
      if (newPassword.length < 6) {
        return response.badReq(res, {
          message: "New password must be at least 6 characters long."
        });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return response.notFound(res, {
          message: "User not found."
        });
      }

      // Verify old password
      const isOldPasswordValid = user.isValidPassword(oldPassword);
      if (!isOldPasswordValid) {
        return response.badReq(res, {
          message: "Old password is incorrect."
        });
      }

      // Check if new password is same as old password
      if (oldPassword === newPassword) {
        return response.badReq(res, {
          message: "New password must be different from old password."
        });
      }

      // Encrypt new password and update
      user.password = user.encryptPassword(newPassword);
      await user.save();

      // Optional: Send email notification
      // await mailNotification.passwordChange({ email: user.email });

      return response.ok(res, {
        message: "Password updated successfully."
      });

    } catch (error) {
      return response.error(res, error);
    }
  },
   getVendorById: async (req, res) => {
    try {
      let data = await User.findById(req?.params?.id);
      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },


};

