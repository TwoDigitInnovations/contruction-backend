const mongoose = require("mongoose");
const Order = mongoose.model("Order");
const response = require("./../responses");
const mailNotification = require("../services/mailNotification");
const { notify } = require("../services/notification");
const User = mongoose.model("User");

module.exports = {
  createOrder: async (req, res) => {
  try {
    const payload = req?.body || {};
    const userId = req?.body?.user || req.user.id;
    const now = new Date();
      const date = now
        .toISOString()
        .replace(/[-T:.Z]/g, "")
        .slice(0, 17); // YYYYMMDDHHMMSSmmm

      payload.order_id = `BDMS-${date}`;
    
    const orderData = {
      ...payload,
      user: userId,
      product: payload.product || payload.productId, 
    };
    
    let order = new Order(orderData);
    await order.save();
    
    const u = await User.findByIdAndUpdate(
      userId,
      { $set: payload },
      {
        new: true,
        upsert: true,
      }
    );
    
    return response.ok(res, { 
      message: "Order added successfully",
      order: order 
    });
  } catch (error) {
    console.log("Order creation error:", error);
    return response.error(res, error);
  }
},
  getrequestProductbyuser: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const product = await Order.find({ user: req.user.id })
        .populate("user", "-password")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getvendororder: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const product = await Order.find({ vendor: req.user.id })
        .populate("user product", "-password")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getOrderById: async (req, res) => {
    try {
      let data = await Order.findById(req?.params?.id).populate(
        "product user driver vendor",
        "-password"
      );
      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getallorder: async (req, res) => {
    try {
      const product = await Order.find()
        .populate("user", "-password")
        .sort({ createdAt: -1 });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getordercount: async (req, res) => {
    try {
      const [totalOrderCount, totalDeliveredOrder, totalPendingOrder] = await Promise.all([
    Order.countDocuments({user:req.user.id}),
    Order.countDocuments({ user:req.user.id,status: "Delivered" }),
    Order.countDocuments({ user:req.user.id,status: "Pending" }),
  ]);

      return response.ok(res, {totalOrderCount,totalDeliveredOrder,totalPendingOrder});
    } catch (error) {
      return response.error(res, error);
    }
  },
  getorderfilter: async (req, res) => {
    try {
      let cond ={}
      if(req.body.curDate){
        const newEt = new Date(new Date(req.body.curDate).setDate(new Date(req.body.curDate).getDate() + 1))
        cond.createdAt = { $gte: new Date(req.body.curDate), $lte: newEt };
      }
      let blog = await Order.find(cond).sort({ createdAt: -1 });
      return response.ok(res, blog);
    } catch (error) {
      return response.error(res, error);
    }
  },
  nearbyorderfordriver: async (req, res) => {
    try {
  
      let orders = await Order.find({
        status:'Driverassigned',
        driver: { $exists: false },
        location: {
          $near: {
            $maxDistance: 1609.34 * 10,
            $geometry: {
              type: "Point",
              coordinates: req.body.location,
            },
          },
        },
      }).populate("user vendor product", "-password");
      // console.log(req.body)
      // console.log(rides)
      return response.ok(res,orders);
    } catch (err) {
      return response.error(res, err);
      }
    },
  acceptedorderfordriver: async (req, res) => {
    try {
      const product = await Order.find({driver:req.user.id,status: { $ne: "Delivered" }}).populate("user vendor product", "-password");
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  orderhistoryfordriver: async (req, res) => {
    try {
      const product = await Order.find({driver:req.user.id,status:"Delivered" }).populate("user", "-password");
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  orderhistoryforvendor: async (req, res) => {
    try {
      const product = await Order.find({vendor:req.user.id,status:"Delivered" }).populate("user", "-password");
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  acceptorderdriver: async (req, res) => {
    try {
      const product = await Order.findById(req.params.id)
      if (product.driver) {
        return response.badReq(res, { message: "Order already accepted" });
      }
      product.driver=req.user.id
      // product.status='Driveraccepted'
      product.save();
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  changeorderstatus: async (req, res) => {
    try {
      const product = await Order.findById(req.body.id)
      product.status=req.body.status
      product.save();
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
};
