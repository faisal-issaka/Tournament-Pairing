exports.successResponse = (res, msg) => {
  const data = {
    status: 1,
    message: msg,
  };
  return res.status(200).json(data);
};

exports.successResponseWithData = (res, message, data) => {
  const resData = {
    status: 1,
    success: true,
    message,
    data,
  };
  return res.status(200).json(resData);
};

exports.errorResponse = (res, msg) => {
  const data = {
    status: 0,
    message: msg,
  };
  return res.status(500).json(data);
};

exports.notFoundResponse = (res, msg) => {
  const data = {
    status: 0,
    message: msg,
  };
  return res.status(404).json(data);
};

exports.validationErrorWithData = (res, msg, data) => {
  const resData = {
    status: 0,
    message: msg,
    data,
  };
  return res.status(400).json(resData);
};

exports.validationErrorOnly = (res, msg) => {
  const resData = {
    status: 0,
    success: false,
    error: msg,
  };
  return res.status(400).json(resData);
};

exports.unauthorizedResponse = (res, msg) => {
  const data = {
    status: 0,
    message: msg,
  };
  return res.status(401).json(data);
};
