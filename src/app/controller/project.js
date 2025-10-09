const mongoose = require("mongoose");
const Project = mongoose.model('Project');
const response = require("./../responses");
const aws = require('aws-sdk');
const cloudinary = require('cloudinary').v2;
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { uploadFileToS3 } = require("../services/uploadFileToS3");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

module.exports = {

createProject: async (req, res) => {
    try {
        const payload = req.body;
        console.log(payload)
     payload.posted_by=req.user.id

if (req.files && req.files?.billOfQuentity?.length > 0) {
        payload.billOfQuentity = req.files?.billOfQuentity?.[0].location;
      }
       payload.location = JSON.parse(payload.location);
       payload.startdate=new Date(payload?.startdate)
        // Create and save the project
        const project = new Project(payload);
        await project.save();

        return response.ok(res, {
            message: 'Project added successfully',
            project
        });

    } catch (error) {
        console.error("Error creating project:", error);
        return response.error(res, {
            message: 'Failed to create project',
            error: error.message
        });
    }
},

updateProject: async (req, res) => {
    try {
        const projectId = req.params.id;
        const payload = req.body;
        
        if (!projectId) {
            return response.error(res, { message: "Project ID is required" });
        }
        
        const existingProject = await Project.findOne({
            _id: projectId,
            posted_by: req.user.id
        });
        
        if (!existingProject) {
            return response.error(res, { message: "Project not found or not authorized" });
        }
        
        // Handle file uploads
        if (req.files) {
            console.log('Files received for update:', req.files);

            // Handle images update
            if (req.files.image && req.files.image.length > 0) {
                // Delete old images from S3 if needed
                if (existingProject.image && existingProject.image.length > 0) {
                    for (const imageUrl of existingProject.image) {
                        try {
                            const urlParts = imageUrl.split('/');
                            const key = urlParts[urlParts.length - 1];
                            
                            const deleteCommand = new DeleteObjectCommand({
                                Bucket: process.env.BUCKET_NAME,
                                Key: key
                            });
                            
                            await s3.send(deleteCommand);
                            console.log("Old image deleted from S3:", key);
                        } catch (deleteError) {
                            console.error("Error deleting old image from S3:", deleteError);
                        }
                    }
                }
                
                // Upload new images
                const imageUrls = [];
                for (let i = 0; i < req.files.image.length; i++) {
                    const file = req.files.image[i];
                    console.log(`Processing image ${i + 1}: ${file.originalname}`);

                    try {
                        if (!file.mimetype.startsWith('image/')) {
                            return response.error(res, {
                                message: `Invalid image file type: ${file.originalname}`
                            });
                        }

                        const fileUrl = await uploadFileToS3(file);
                        imageUrls.push(fileUrl);
                        console.log(`Image ${i + 1} uploaded: ${fileUrl}`);
                    } catch (uploadError) {
                        console.error(`Error uploading image ${file.originalname}:`, uploadError);
                        return response.error(res, {
                            message: `Failed to upload image: ${file.originalname}`,
                            error: uploadError.message
                        });
                    }
                }
                payload.image = imageUrls;
            }

            // Handle documents update
            if (req.files.documents && req.files.documents.length > 0) {
                // Delete old documents from S3 if needed
                if (existingProject.documents && existingProject.documents.length > 0) {
                    for (const docUrl of existingProject.documents) {
                        try {
                            const urlParts = docUrl.split('/');
                            const key = urlParts[urlParts.length - 1];
                            
                            const deleteCommand = new DeleteObjectCommand({
                                Bucket: process.env.BUCKET_NAME,
                                Key: key
                            });
                            
                            await s3.send(deleteCommand);
                            console.log("Old document deleted from S3:", key);
                        } catch (deleteError) {
                            console.error("Error deleting old document from S3:", deleteError);
                        }
                    }
                }
                
                // Upload new documents
                const documentUrls = [];
                for (let i = 0; i < req.files.documents.length; i++) {
                    const file = req.files.documents[i];
                    console.log(`Processing document ${i + 1}: ${file.originalname}`);

                    try {
                        if (file.mimetype !== 'application/pdf') {
                            return response.error(res, {
                                message: `Invalid document file type: ${file.originalname}. Only PDF files are allowed.`
                            });
                        }

                        const fileUrl = await uploadFileToS3(file);
                        documentUrls.push(fileUrl);
                        console.log(`Document ${i + 1} uploaded: ${fileUrl}`);
                    } catch (uploadError) {
                        console.error(`Error uploading document ${file.originalname}:`, uploadError);
                        return response.error(res, {
                            message: `Failed to upload document: ${file.originalname}`,
                            error: uploadError.message
                        });
                    }
                }
                payload.documents = documentUrls;
            }
        }
        
        // Capitalize function for text fields
        const capitalizeWords = (str) => {
            return str
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        };

        // Update text fields with capitalization
        if (payload.name) payload.name = capitalizeWords(payload.name);
        if (payload.projectname) payload.projectname = capitalizeWords(payload.projectname);
        if (payload.location) payload.location = capitalizeWords(payload.location);
        if (payload.startdate) payload.startdate = new Date(payload.startdate);
        
        const updatedProject = await Project.findOneAndUpdate(
            { _id: projectId, posted_by: req.user.id },
            payload,
            { new: true }
        );
        
        return response.ok(res, {
            message: "Project updated successfully",
            data: updatedProject
        });
    } catch (error) {
        console.error("Error updating project:", error);
        return response.error(res, error);
    }
},





   getProject: async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1; 
        let limit = parseInt(req.query.limit) || 10; 
        let skip = (page - 1) * limit;

        const total = await Project.countDocuments();
        const projects = await Project.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); 
        return response.ok(res, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: projects
        });
    } catch (error) {
        return response.error(res, error);
    }
},

    getProjectbyuser: async (req, res) => {
        try {
            let project = await Project.find({posted_by:req.user.id});
            return response.ok(res, project);
        } catch (error) {
            return response.error(res, error);
        }
    },
    getSingleProject: async (req, res) => {
    try {
        const projectId = req.params.id;

        if (!projectId) {
            return response.error(res, { message: "Project ID is required" });
        }

        let project = await Project.findById(projectId);

        if (!project) {
            return response.error(res, { message: "Project not found" });
        }

        return response.ok(res, project);
    } catch (error) {
        return response.error(res, error);
    }
},



deleteProject: async (req, res) => {
    try {
        const projectId = req.params.id;

        if (!projectId) {
            return response.error(res, { message: "Project ID is required" });
        }

        
        const project = await Project.findOne({ 
            _id: projectId, 
            posted_by: req.user.id 
        });

        if (!project) {
            return response.error(res, { message: "Project not found or not authorized" });
        }

       
        if (project.image && project.image.length > 0) {
            for (const imageUrl of project.image) {
                try {
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`projects/${publicId}`);
                    console.log("Image deleted from cloudinary:", publicId);
                } catch (deleteError) {
                    console.error("Error deleting image from cloudinary:", deleteError);
                }
            }
        }

        const deletedProject = await Project.findOneAndDelete({
            _id: projectId,
            posted_by: req.user.id
        });

        return response.ok(res, { message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error);
        return response.error(res, error);
    }
}



}