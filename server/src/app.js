const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route')
const productRoutes = require('../src/routes/product.route')
// const orderRoutes = require('../src/routes/order.route')
// const paymentRoutes = require("../src/routes/payment.route")
// const analyticsRoutes = require('../src/routes/analytics.route')

const app = express();

app.use(cors())
app.use(express.json())

app.get("/", (req,res) => {
    res.send("EzyMart");
});
app.use("/api/auth",authRoutes)
app.use("/api/products",productRoutes)
// app.use("/api/orders", orderRoutes)
// app.use("/api/payment", paymentRoutes)
// app.use("api/analytics", analyticsRoutes)

module.exports = app