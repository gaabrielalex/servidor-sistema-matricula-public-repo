const app = require('../../server');

app.get('/', (req, res) => {
    return res.status(200).json({
        message: 'API is running'
    });
});

//Functions
function defaultInternalError(res, err) {
    return res.status(500).json({
        error: 'Internal Server Error: ' + err
    });
}

module.exports = defaultInternalError;