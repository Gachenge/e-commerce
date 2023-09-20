const express = require("express")
const mongoose = require("mongoose")
const app = express()
const port = 5000
const dotenv = require("dotenv")
const userRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const prodRoute = require("./routes/products")
const orderRoute = require("./routes/order")

dotenv.config();

mongoose.connect(
    process.env.MONGO_URI
)
    .then(() => console.log("DBConnection successful"))
    .catch((err) => {
        console.log(err)
})
app.use(express.json())

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute)
app.use("/api/products", prodRoute)
app.use("/api/orders", orderRoute)

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
