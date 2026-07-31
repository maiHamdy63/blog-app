const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const app = express();

const userRouter = require("./routers/user");
const authRouter = require("./routers/auth");
const postRouter = require("./routers/post");
const groupRouter = require("./routers/group");

const errorHandler = require("./middleware/error");
const notFoundHandler = require("./middleware/not-found");

const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const User = require("./model/user");

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 200,
  message: { message: "too many request ,please try again later" },
});
app.use(limiter);

app.use(authRouter);
app.use(userRouter);
app.use(postRouter);
app.use(groupRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(process.env.PORT || 3000, async () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB Connected!");
  const superAdmin = await User.findOne({
    email: process.env.SUPERADMIN_EMAIL,
  });
  if (!superAdmin) {
    await User.create({
      name: process.env.SUPERADMIN_NAME,
      email: process.env.SUPERADMIN_EMAIL,
      password: process.env.SUPERADMIN_PASSWORD,
      role: "superAdmin",
    });
  }
});
