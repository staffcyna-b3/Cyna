import { ApiResponse } from "./ApiResponse";

export class SuccessResponse<T> implements ApiResponse<T> {
  success = true;
  message: string;
  data: T;

  constructor(message: string, data: T) {
    this.message = message;
    this.data = data;
  }
}
