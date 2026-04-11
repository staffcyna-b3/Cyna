import { ApiResponse } from "./ApiResponse";

export class ErrorResponse implements ApiResponse {
  success = false;
  message: string;
  errors?: any;

  constructor(message: string, errors?: any) {
    this.message = message;
    this.errors = errors;
  }
}
