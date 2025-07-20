const cron = require('node-cron');
const Notification = require('../models/Notification');

const startCronJobs = () => {
  // Schedule to run every day at midnight (0 0 * * *)
  // For testing, you might want to set it to run more frequently, e.g., every minute (* * * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running cron job: Deleting old normal priority notifications...');
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    try {
      const result = await Notification.deleteMany({
        priority: 'High',
        createdAt: { $lt: twoDaysAgo },
      });
      console.log(`Deleted ${result.deletedCount} normal priority notifications.`);
    } catch (error) {
      console.error('Error deleting old notifications:', error);
    }
  });
};

module.exports = startCronJobs;
