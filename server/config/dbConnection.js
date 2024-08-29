import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const connectionToDb = async() => {
    try{
        const { connection } = await mongoose.connect(process.env.MONGO_URI || `mongodb://localhost:27017/Food-Resto-io`) ;

        if(connection){
            console.log(`Connected to MongoDb : ${connection.host}`);
        }

    }catch(err){
        console.log(`Error occurred while connection to the database : ${err}`)
        process.exit(1);
    }
}

export default connectionToDb;






