import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { StatusCodes } from 'http-status-codes';
import ServerError from '../errors/ServerError';

const { host, port, user, pass, from } = config.email;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: config.server.node_env === 'production',
  auth: {
    user,
    pass,
  },
});

/**
 * Send email
 * @param {TEmailProps} values - Email values
 * @returns void
 */
export const sendEmail = async (values: TEmailProps) => {
  try {
    const { accepted } = await transporter.sendMail({
      from,
      ...values,
    });

    if (!accepted.length)
      throw new ServerError(StatusCodes.BAD_REQUEST, 'Mail not sent');

    logger.info(`Mail send successfully. On: ${accepted[0]}`);
  } catch (error: any) {
    errorLogger.error('Email send failed', error.message);
    throw new ServerError(StatusCodes.BAD_REQUEST, error.message);
  }
};

type TEmailProps = {
  to: string;
  subject: string;
  html: string;
};
