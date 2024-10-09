import express from "express"
import morgan from "morgan"
import cookieParser from "cookie-parser"


import { config } from "dotenv";
config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(morgan("dev"));


// Router imports : 
import userRouter from "./routes/user.routes.js";
import restoRouter from "./routes/resto.routes.js";
import menuItemsRouter from "./routes/menuItems.routes.js";
import reviewRouter from "./routes/review.routes.js";


app.use("/api/v1/users", userRouter);
app.use("/api/v1/resto", restoRouter);
app.use("/api/v1/resto-menu", menuItemsRouter);
app.use("/api/v1/review", reviewRouter);


app.get("/", (req, res) => {
    res.send("Server started");
})


export default app;

