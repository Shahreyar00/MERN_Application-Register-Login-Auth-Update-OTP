import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/route.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("tiny"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.disable("x-powered-by");


const PORT = process.env.PORT || 6001;
const connect = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to Database!");
    }catch(err){
        console.log(`${err}, did not connect!`);
    }
};

mongoose.set("strictQuery", true);
mongoose.connection.on("disconnected", () => {
    console.log("mongoDB disconnected!");
});

// Routes
app.use("/api",authRoutes);

app.listen(PORT, () => {
    connect();
    console.log(`Server is running on port: ${PORT}`);
});
