
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan'); 
const cors = require('cors'); 
const swaggerRoutes = require("./src/routes/swaggerRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const userRoutes = require("./src/routes/userRoutes");
const { syncModels } = require("./src/helpers/modelsSyncing");
const cron = require("node-cron");
const { checkAndSendReminders } = require('./src/helpers/pushNotification');
const { getTimeZone } = require('./src/helpers/timezoneHelpers');
const cookieParser = require("cookie-parser");



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://demo-frontend-kmdj.vercel.app','http://localhost:3000', "https://brainsflow-admin-panel-smoky.vercel.app","http://192.168.100.71:3000"],  
  credentials: true,  
}));                      
app.use(bodyParser.json());    
app.use(express.urlencoded({ extended: true }));       
app.use(morgan('dev'));  
app.use(cookieParser());

app.use("/swagger",swaggerRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

app.get("/api/test", (request, response) => {
  console.log('Raw headers:', request.headers); // Check if cookie exists
  console.log('Parsed cookies:', request.cookies);    // Should show the token
  res.send('Check server logs');
})


cron.schedule('* * * * *', () => {
  checkAndSendReminders();
}, {
  timezone: getTimeZone()
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' }); 
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(process.env.SERVER_PORT, async () => {
  await syncModels();
  console.log(`Server is running on http://localhost:${process.env.SERVER_PORT}`);
});
