const app = require('./app');
const mongoose = require('mongoose');

app.listen(3000, () => {
    console.log("Server running. Use our API on port: 3000")
});

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Database connection successful');
    })
    .catch((err) => {
        console.error('Error connecting to the database:', err.message);
        process.exit(1);
    });
