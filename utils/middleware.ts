import { Request, Response, NextFunction } from "express";
const logger = require("./logger");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

interface CustomRequest extends Request {
  token?: string | null;
  user?: any;
}

const tokenExtractor = (
  request: CustomRequest & Request,
  response: Response,
  next: NextFunction
): void => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
    return next();
  }
  request.token = null;
  return next();
};

const userExtractor = async (
  request: CustomRequest & Request,
  response: Response,
  next: NextFunction
) => {
  try {
    if (request.token) {
      const decodedToken = jwt.verify(request.token, process.env.SECRET);
      if (!decodedToken.id) {
        return response.status(401).json({ error: "token invalid" });
      }

      request.user = await User.findById(decodedToken.id);
      console.log(request.user);
      return next();
    }
    request.user = null;
    return next();
  } catch (error) {
    next(error);
  }
};

const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info("---------");
  logger.error(error.message);

  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({
      error: "token expired",
    });
  }

  next(error);
};

export default {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
};
