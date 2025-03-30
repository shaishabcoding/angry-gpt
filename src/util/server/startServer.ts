import colors from 'colors';
import { createServer } from 'http';
import app from '../../app';
import config from '../../config';
import { errorLogger, logger } from '../logger/logger';
import shutdownServer from './shutdownServer';
import connectDB from './connectDB';
import { AdminServices } from '../../app/modules/admin/Admin.service';
import killPort from 'kill-port';
import { PaymentServices } from '../../app/modules/payment/Payment.service';

const {
  server: { port, ip_address, href, name },
} = config;

/**
 * Starts the server
 *
 * This function creates a new HTTP server instance and connects to the database.
 * It also seeds the admin user if it doesn't exist in the database.
 */
export default async function startServer() {
  try {
    await killPort(port);

    await connectDB();
    await AdminServices.seed();

    const server = createServer(app).listen(port, ip_address, () => {
      logger.info(colors.yellow(`🚀 ${name} is running on ${href}`));
    });

    const stripe = PaymentServices.listener();

    ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException'].forEach(
      signal =>
        process.on(signal, (err?: Error) => {
          stripe?.kill();
          shutdownServer(server, signal, err);
        }),
    );

    return server;
  } catch (error) {
    errorLogger.error(colors.red('❌ Server startup failed!'), error);
    process.exit(1);
  }
}
