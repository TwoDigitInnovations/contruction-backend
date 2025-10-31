const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const response = require("./../responses");
const mailNotification = require("../services/mailNotification");



module.exports = {

  createProduct: async (req, res) => {
    try {
      const payload = req?.body || {};
      payload.posted_by = req.user.id;
      console.log("as", req?.body);

      let attributes = [];

      if (payload.attributes) {
        try {
          const parsed =
            typeof payload.attributes === 'string'
              ? JSON.parse(payload.attributes)
              : payload.attributes;

          if (Array.isArray(parsed)) {
            attributes = parsed.map(attr =>
              typeof attr === 'object' ? { ...attr } : {}
            );
          }
        } catch (err) {
          console.warn('Could not parse payload.attributes JSON, fallback to form fields', err);
          attributes = [];
        }
      }

      // STEP 2: Parse FormData-style bracketed keys (attributes[0][name])
      Object.keys(req.body || {}).forEach(key => {
        const match = key.match(/^attributes\[(\d+)\]\[(.+)\]$/);
        if (match) {
          const index = parseInt(match[1], 10);
          const field = match[2];
          if (!attributes[index]) attributes[index] = {};
          attributes[index][field] = req.body[key];
        }
      });


      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const match = (file.fieldname || '').match(/^attributes\[(\d+)\]\[(.+)\]$/);
          const fileUrl = file.location || file.path || (file.filename ? `/uploads/${file.filename}` : null);

          if (match) {
            const index = parseInt(match[1], 10);
            const field = match[2];
            if (!attributes[index]) attributes[index] = {};
            attributes[index][field] = fileUrl;
          } else {
            payload[file.fieldname] = fileUrl;
          }
        });
      }


      attributes.forEach(attr => {
        Object.keys(attr).forEach(key => {
          if (
            attr[key] === 'undefined' ||
            attr[key] === undefined ||
            attr[key] === null ||
            attr[key] === ''
          ) {
            delete attr[key];
          } else if (typeof attr[key] === 'string') {
            attr[key] = attr[key].trim();
          }
        });
      });

      
      payload.attributes = attributes
        .filter(Boolean)
        .filter(a => Object.keys(a).length > 0);

      let cat = new Product(payload);
      await cat.save();
      return response.ok(res, { cat, message: 'Product added successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProduct: async (req, res) => {
    try {
      let { page, limit } = req.query;

      page = parseInt(page);
      limit = parseInt(limit);
      const skip = (page - 1) * limit;

      const products = await Product.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Product.countDocuments();

      return response.ok(res, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        products,
      });

    } catch (error) {
      return response.error(res, error);
    }
  },


  getProductByCategory: async (req, res) => {
    try {
      console.log('enter')
      console.log('enter', req.params)
      let product = await Product.find({ category: req.params.id });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getProductByVendor: async (req, res) => {
    try {
      let product = await Product.find({ posted_by: req.user.id });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getProductByVendorandCategory: async (req, res) => {
    try {
      let product = await Product.find({ posted_by: req.body.posted_by, category: req.body.category });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getProductById: async (req, res) => {
    try {
      let Productdata = await Product.findById(req?.params?.id).populate("category posted_by", "-password");
      return response.ok(res, Productdata);
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateProduct: async (req, res) => {
    const payload = req?.body || {};
    let attributes = [];

    // STEP 1: Parse payload.attributes if sent as JSON or array
    if (payload.attributes) {
      try {
        const parsed =
          typeof payload.attributes === 'string'
            ? JSON.parse(payload.attributes)
            : payload.attributes;

        if (Array.isArray(parsed)) {
          attributes = parsed.map(attr =>
            typeof attr === 'object' ? { ...attr } : {}
          );
        }
      } catch (err) {
        console.warn('Could not parse payload.attributes JSON, fallback to form fields', err);
        attributes = [];
      }
    }

    // STEP 2: Parse FormData-style bracketed keys (attributes[0][name])
    Object.keys(req.body || {}).forEach(key => {
      const match = key.match(/^attributes\[(\d+)\]\[(.+)\]$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        if (!attributes[index]) attributes[index] = {};
        attributes[index][field] = req.body[key];
      }
    });

    // STEP 3: Merge uploaded files (from multer / s3)
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const match = (file.fieldname || '').match(/^attributes\[(\d+)\]\[(.+)\]$/);
        const fileUrl = file.location || file.path || (file.filename ? `/uploads/${file.filename}` : null);

        if (match) {
          const index = parseInt(match[1], 10);
          const field = match[2];
          if (!attributes[index]) attributes[index] = {};
          attributes[index][field] = fileUrl;
        } else {
          payload[file.fieldname] = fileUrl;
        }
      });
    }

    // STEP 4: Clean invalid or empty values
    attributes.forEach(attr => {
      Object.keys(attr).forEach(key => {
        if (
          attr[key] === 'undefined' ||
          attr[key] === undefined ||
          attr[key] === null ||
          attr[key] === ''
        ) {
          delete attr[key];
        } else if (typeof attr[key] === 'string') {
          attr[key] = attr[key].trim();
        }
      });
    });

    // STEP 5: Filter out empty attributes
    payload.attributes = attributes
      .filter(Boolean) // removes holes or undefined
      .filter(a => Object.keys(a).length > 0); // removes empty objects

    try {

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