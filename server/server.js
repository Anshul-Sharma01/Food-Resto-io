import app from "./app.js";
import connectionToDb from "./config/dbConnection.js";



const PORT = process.env.PORT || 3000;
app.listen(PORT, async() => {
    await connectionToDb();
    console.log(`Server is listening at http://localhost:${PORT}`);
})
