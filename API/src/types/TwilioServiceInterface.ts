export interface TwilioServiceInterface {
    startVerification(phoneNumber: string): Promise<any>;
    checkVerification(id: string, code: string, phoneNumber: string): Promise<any>;
}
