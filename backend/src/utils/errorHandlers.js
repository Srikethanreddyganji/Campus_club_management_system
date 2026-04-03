export function notFoundHandler(req, res, next) {
	return res.status(404).json({
	  success: false,
	  message: "Route not found",
	});
  }
  
  export function errorHandler(
	err,
	req,
	res,
	next
  ) {
	const statusCode = err.status || 500;
  
	return res.status(statusCode).json({
	  success: false,
	  message:
		err.message || "Internal server error",
	  details:
		process.env.NODE_ENV === "production"
		  ? undefined
		  : err.stack,
	});
  }