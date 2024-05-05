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
      // sendCombinedData(socket);

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

    res.render("book-slot", { error: null });
  } catch (error) {
    res.status(500).send(error);
  }
};

const sendCombinedData = async (socket) => {
  const sensorData = testSensorData.split(",");

  try {
    // Fetch booking status from the database
    const bookings = await Booking.find({});

    const bookingStatus = {};
    bookings.forEach((booking) => {
      bookingStatus[booking.slotId] = booking.status;
    });

    // Combine sensor data with booking status
    const combinedData = {
      sensorData: sensorData,
      bookingStatus: bookingStatus
    };

    // Send the combined data to the frontend
    socket.emit("combinedData", combinedData);
  } catch (err) {
    console.error("Error fetching booking data:", err);
  }
};
