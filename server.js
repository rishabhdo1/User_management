const app= require('./app');
require("dotenv").config();


const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
    res.send("<h1>Welcome to Backend</h1>");
  });
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});