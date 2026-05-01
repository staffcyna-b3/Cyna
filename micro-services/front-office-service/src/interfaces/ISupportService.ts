export interface ISupportService {
  submit(data: { email: string; subject: string; message: string }): Promise<void>;
}
