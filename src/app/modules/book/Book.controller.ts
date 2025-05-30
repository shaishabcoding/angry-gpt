import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../util/server/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { BookServices } from './Book.service';
import { imagesUploadRollback } from '../../middlewares/imageUploader';

export const BookController = {
  create: catchAsync(async (req, res) => {
    const data = await BookServices.create(req.body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Book created successfully',
      data,
    });
  }, imagesUploadRollback),

  list: catchAsync(async (req, res) => {
    const { books, meta } = await BookServices.list(req.query);

    serveResponse(res, {
      message: 'Books fetched successfully',
      meta,
      data: books,
    });
  }),

  retrieve: catchAsync(async (req, res) => {
    const data = await BookServices.retrieve(req.params.bookId);

    serveResponse(res, {
      message: 'Book retrieved successfully',
      data,
    });
  }),

  update: catchAsync(async (req, res) => {
    const data = await BookServices.update(req.params.bookId, req.body);

    serveResponse(res, {
      message: 'Book updated successfully',
      data,
    });
  }, imagesUploadRollback),

  delete: catchAsync(async (req, res) => {
    const data = await BookServices.delete(req.params.bookId);

    serveResponse(res, {
      message: 'Book deleted successfully',
      data,
    });
  }),
};
