/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars, no-console */
import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import colors from 'colors';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import config from '../../config';
import ServerError from '../../errors/ServerError';
import handleZodError from '../../errors/handleZodError';
import handleValidationError from '../../errors/handleValidationError';
import handleMongooseDuplicateError from '../../errors/handleMongooseDuplicateError';
import { errorLogger } from '../../util/logger/logger';
import { TErrorHandler, TErrorMessage } from '../../types/errors.types';

const defaultError: TErrorHandler = {
  statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  message: 'Something went wrong',
  errorMessages: [],
};

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (config.server.node_env === 'development') {
    console.log(colors.red('🚨 globalErrorHandler ~~ '), error);
  } else {
    errorLogger.error(colors.red('🚨 globalErrorHandler ~~ '), error);
  }

  const { statusCode, message, errorMessages } = formatError(error);

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.server.node_env !== 'production' ? error.stack : undefined,
  });
};

export default globalErrorHandler;

const formatError = (error: any): TErrorHandler => {
  if (error instanceof ZodError) return handleZodError(error);
  if (error instanceof mongoose.Error.ValidationError)
    return handleValidationError(error);
  if (error.code === 11000) return handleMongooseDuplicateError(error);
  if (error instanceof ServerError)
    return {
      statusCode: error.statusCode,
      message: error.message,
      errorMessages: createErrorMessage(error.message),
    };
  if (error instanceof Error)
    return {
      ...defaultError,
      message: error.message,
      errorMessages: createErrorMessage(error.message),
    };

  return defaultError;
};

const createErrorMessage = (message: string): TErrorMessage[] => [
  { path: '', message },
];
