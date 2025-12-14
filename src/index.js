const app = require('./app');
const MQTTService = require('./services/MQTTService');

const PORT = process.env.PORT || 3333;

// Inicializa o serviço MQTT
MQTTService.setup();

app.listen(PORT);