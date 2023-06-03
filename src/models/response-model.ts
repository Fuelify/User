class ResponseModel {
    statusCode: number;
    status: string;
    data: object;
    message: string;
    timestamp: number;
  
    constructor(statusCode: number, status: string, data: object, message: string) {
      this.statusCode = statusCode;
      this.status = status;
      this.data = data;
      this.message = message;
      this.timestamp = Date.now();
    }
  
    json() {
      return {
        statusCode: this.statusCode,
        status: this.status,
        data: this.data,
        message: this.message,
        timestamp: this.timestamp,
      };
    }
  }
  
  export default ResponseModel;
  