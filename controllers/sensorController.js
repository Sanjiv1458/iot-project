import mqtt from "mqtt";
import Booking from '../models/booking.js';

const mqtt_server = "broker.hivemq.com";
const mqtt_port = 1883;
const mqtt_topic = "PARKING_SYSTEM_DATA";

const mqttClient = mqtt.connect(`mqtt://${mqtt_server}:${mqtt_port}`);

// Function to generate test sensor data
const generateTestSensorData = () => {
  const sensorStatus = [1, 0, 1, 1, 0, 1];
  return sensorStatus.join(",");
};

// Use this line to simulate MQTT data for testing
const testSensorData = generateTestSensorData();

export const getIndex = (io) => (req, res) => {
  try {
    io.on("connection", (socket) => {
      console.log("WebSocket connected");
      // mqttClient.subscribe(mqtt_topic);
      socket.emit("sensorData", testSensorData);

      // mqttClient.on("message", function (topic, message) {
      //   if (topic === mqtt_topic) {
      //     const payload = message.toString();
      //     socket.emit("sensorData", payload);
      //   }
      // });
      // handle WebSocket disconnections
      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    });

    res.render("sensor");
  } catch (error) {
    res.status(500).send(error);
  }
};


// import Booking from '../models/booking.js';
// await Booking.find({ status: "Booked" }, { slotId: 1, _id: 0 }, function (err, bookings) {
//   if (err) {
//     res.status(500).send(err.message);
//   } else {
//     const bookedSlotIds = bookings.map((booking) => booking.slotId);
//     for (let i = 0; i < bookedSlotIds.length; i++) {
//       sensorData[bookedSlotIds[i] - 1] = 3;
//     }
//   }
// });
// socket.emit("sensorData", sensorData);