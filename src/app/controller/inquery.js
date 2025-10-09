const mongoose = require("mongoose");
const Inquery = mongoose.model('Inquery');
const response = require("./../responses");

module.exports = {

    createInquery: async (req, res) => {
        try {
            const payload = req?.body || {};
            payload.posted_by = req.user.id;
            let cat = new Inquery(payload);
            await cat.save();
            return response.ok(res, { message: 'Inquery added successfully' });
        } catch (error) {
            return response.error(res, error);
        }
    },

getInquery: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const date = req.query.date || '';

        const skip = (page - 1) * limit;

      
        let query = {};

      
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

      
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.createdAt = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const data = await Inquery.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
        const totalCount = await Inquery.countDocuments(query);

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

    getInquerybyuser: async (req, res) => {
        try {
            let data = await Inquery.find({posted_by:req.user.id});
            return response.ok(res, data);
        } catch (error) {
            return response.error(res, error);
        }
    },
}