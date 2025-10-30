"use strict";
const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const isAuthenticated = require("./../../middlewares/isAuthenticated");
const user = require("../../app/controller/user");
const category = require("../../app/controller/category");
const product = require("../../app/controller/product");
const project = require("../../app/controller/project");
const order = require("../../app/controller/order");
const inquery = require("../../app/controller/inquery");
const { upload } = require("../../app/services/fileUpload");
const Setting = require("../../app/controller/setting");
// const notification = require("../../app/controller/notification");


// router.post("/sendotp", user.sendOTPForSignUp);
router.post("/signUp", user.signUp);
router.post("/login", user.login);
router.post("/sendOTP", user.sendOTPForforgetpass);
router.post("/verifyOTP", user.verifyOTP);
router.post("/changePassword", user.changePassword);
router.post("/shopsnearme", user.shopsnearme);

router.get("/getAllDriver", user.getAllDriver);
router.get("/getAllVendor", user.getAllVendor);
router.get("/driverupdatelocation", isAuthenticated(["DRIVER"]), user.driverupdatelocation);
router.post("/verifyuser/:id", user.verifyuser);
router.get(
  "/getProfile",
  isAuthenticated(["USER", "DRIVER", "ADMIN", "VENDOR"]),
  user.getProfile
);

router.get("/getAllUsers", user.getAllUsers)

router.post(
  "/updateProfile",
  isAuthenticated(["USER", "DRIVER", "ADMIN", "VENDOR"]), upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'tax_reg_img', maxCount: 1 },
    { name: 'driving_licence_img', maxCount: 1 },
    { name: 'vehicle_doc_img', maxCount: 1 },
    { name: 'business_license_img', maxCount: 1 },]),
  user.updateProfile
);


router.post(
  "/updateBasicProfile",
  isAuthenticated(["USER", "DRIVER", "ADMIN", "VENDOR"]),
  user.updateBasicProfile
);
// router.post("/verifyuser/:id", user.verifyuser);



// router.post(
//   "/user/fileupload",
//   upload.single("file"),
//   user.fileUpload
// );

router.get("/getCategoryById/:id", category.getCategoryById);
router.post("/createCategory", isAuthenticated(["ADMIN", "DRIVER", "VENDOR"]), category.createCategory);
router.get("/getCategory", category.getCategory);
router.post("/updateCategory", isAuthenticated(["USER", "ADMIN"]), category.updateCategory);
router.delete("/deleteCategory/:id", isAuthenticated(["USER", "ADMIN"]), category.deleteCategory);
router.post("/deleteAllCategory", isAuthenticated(["USER", "ADMIN"]), category.deleteAllCategory);

////product/////

router.get("/getProductByVendor", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), product.getProductByVendor);
router.post("/createProduct", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), product.createProduct);
router.get("/getProductByVendor",isAuthenticated(["USER","ADMIN","DRIVER","VENDOR"]),product.getProductByVendor);
router.post("/createProduct",isAuthenticated(["USER","ADMIN","DRIVER","VENDOR"]),upload.any(),product.createProduct);
router.get(
  "/getProductByCategory/:id",
  // isAuthenticated(["USER","ADMIN","DRIVER","VENDOR"]),
  product.getProductByCategory);
router.post("/getProductByVendorandCategory", product.getProductByVendorandCategory);
router.get("/getProductById/:id", product.getProductById);

router.get("/getProducts", product.getProduct);
router.post("/updateProduct", product.updateProduct);
router.delete("/deleteProduct/:id", product.deleteProduct);
router.get("/getProducts",product.getProduct);
router.post("/updateProduct",upload.any(),product.updateProduct);
router.delete("/deleteProduct/:id",product.deleteProduct);

router.post('/updatepassword', isAuthenticated("USER"), user.updatePassword)


// inquery

router.post('/createInquery', isAuthenticated("USER"), inquery.createInquery)
router.get('/getInquery', inquery.getInquery)
router.get('/getinquerybyuser', inquery.getInquerybyuser)
// router.get("/getnotification",isAuthenticated(["USER", "DRIVER", "ADMIN"]), notification.getnotification);

router.post("/createProject", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), upload.fields([
  { name: 'billOfQuentity', maxCount: 1 },
]), project.createProject);
router.get("/getProject", project.getProject);
router.get("/getProjectbyuser", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), project.getProjectbyuser);
router.get('/getSingleProject/:id', project.getSingleProject)

// router.put('/updateProject/:id', upload.array('image', 10),isAuthenticated(["USER", "ADMIN","DRIVER","VENDOR"]),project.updateProject)


router.put('/updateProject/:id',
  isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]),
  upload.fields([
    { name: 'billOfQuentity', maxCount: 1 },
  ]),
  project.updateProject
);
router.delete('/deleteProject/:id', isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), project.deleteProject)


////order ////
router.post("/createOrder", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.createOrder);
router.get("/getrequestProductbyuser", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.getrequestProductbyuser);
router.get("/getvendororder", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.getvendororder);
router.post("/nearbyorderfordriver", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.nearbyorderfordriver);
router.post("/changeorderstatus", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.changeorderstatus);
router.get("/getOrderById/:id", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.getOrderById);
router.get("/acceptedorderfordriver", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.acceptedorderfordriver);
router.post("/acceptorderdriver/:id", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.acceptorderdriver);
router.get("/orderhistoryfordriver", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.orderhistoryfordriver);
router.get("/orderhistoryforvendor", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.orderhistoryforvendor);
router.get("/getordercount", isAuthenticated(["USER", "ADMIN", "DRIVER", "VENDOR"]), order.getordercount);


router.get("/getSetting", isAuthenticated(["ADMIN"]), Setting.getSetting);
router.post("/saveSetting", isAuthenticated(["ADMIN"]), Setting.saveSetting);

module.exports = router;
