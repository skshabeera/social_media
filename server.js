const express=require("express");
const connectDB =require('./config/db');
// const bodyParser=require("body-parser")
const app = express();
connectDB();
// init middleware
app.use(express.json({ extended:false }));
// app.use(bodyParser.json())
// app.use(bodyParser.json({ type: 'application/*+json' }));

app.get(`/`,(req,res)=>res.send("API running"));
app.get(`/hello`,(req,res)=>res.send("hello world"));
// app.post(`/hai`,(req,res)=>{
//     console.log(req.body)
//     res.send("hello")
// });
// Define Routes
app.use("/api/user",require("./routes/api/user"));
app.use("/api/auth",require("./routes/api/auth"));
app.use("/api/profile",require("./routes/api/profile"));
app.use("/api/posts",require("./routes/api/posts"));


const PORT=process.env.PORT || 5000
app.listen(PORT,()=> console.log(`server started on port${PORT}`))
