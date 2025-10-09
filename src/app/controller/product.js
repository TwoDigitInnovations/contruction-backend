const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const response = require("./../responses");
const mailNotification = require("../services/mailNotification");



module.exports = {

    createProduct: async (req, res) => {
        try {
            const payload = req?.body || {};
            payload.posted_by = req.user.id;
            let cat = new Product(payload);
            await cat.save();
            return response.ok(res, { message: 'Product added successfully' });
        } catch (error) {
            return response.error(res, error);
        }
    },

   getProduct: async (req, res) => {
    try {
        const products = await Product.find(); 
        return response.ok(res, products);
    } catch (error) {
        return response.error(res, error);
    }
},

    getProductByCategory: async (req, res) => {
        try {
            console.log('enter')
            console.log('enter',req.params)
            let product = await Product.find({category:req.params.id});
            return response.ok(res, product);
        } catch (error) {
            return response.error(res, error);
        }
    },
    getProductByVendor: async (req, res) => {
        try {
            let product = await Product.find({posted_by:req.user.id});
            return response.ok(res, product);
        } catch (error) {
            return response.error(res, error);
        }
    },
    getProductByVendorandCategory: async (req, res) => {
        try {
            let product = await Product.find({posted_by:req.body.posted_by,category:req.body.category});
            return response.ok(res, product);
        } catch (error) {
            return response.error(res, error);
        }
    },
    getProductById: async (req, res) => {
        try {
            let Productdata = await Product.findById(req?.params?.id).populate("category posted_by","-password");
            return response.ok(res, Productdata);
        } catch (error) {
            return response.error(res, error);
        }
    },

    updateProduct: async (req, res) => {
        try {
            const payload = req?.body || {};
            let updatProduct = await Product.findByIdAndUpdate(payload?.id, payload, {
                new: true,
                upsert: true,
            });
            return response.ok(res, updatProduct);
        } catch (error) {
            return response.error(res, error);
        }
    },

    deleteProduct: async (req, res) => {
        try {
            await Product.findByIdAndDelete(req?.params?.id);
            return response.ok(res, { meaasge: "Deleted successfully" });
        } catch (error) {
            return response.error(res, error);
        }
    },

    deleteAllProduct: async (req, res) => {
        try {
            const newid = req.body.Product.map(f => new mongoose.Types.ObjectId(f))
            await Product.deleteMany({ _id: { $in: newid } });
            return response.ok(res, { meaasge: "Deleted successfully" });
        } catch (error) {
            return response.error(res, error);
        }
    },

};