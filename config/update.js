import Booking from '../models/booking.js';

const updateBookingStatus = async (booking) => {
  try {
    if (booking.status !== 'Available' && new Date() > booking.endTime) {
      booking.status = 'Available';
      await booking.save();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
};

export default (io) => {
  io.on('connection', async (socket) => {
    console.log('A client has connected!');

    const emitBookingStatusUpdates = async () => {
      try {
        const bookings = await Booking.find();

        const updatePromises = bookings.map(updateBookingStatus);
        const updatedBookings = await Promise.all(updatePromises);

        const updatedBookingsData = bookings.filter((booking, index) => updatedBookings[index]);
        if (updatedBookingsData.length > 0) {
          io.emit('bookingStatusUpdate', updatedBookingsData);
        }
      } catch (error) {
        console.error('Error fetching or updating bookings:', error);
      }
    };

    const intervalId = setInterval(emitBookingStatusUpdates, 1000);

    socket.on('disconnect', () => {
      console.log('A client has disconnected!');
      clearInterval(intervalId);
    });
  });
};
