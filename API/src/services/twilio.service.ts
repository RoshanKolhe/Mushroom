import { Twilio } from 'twilio';
import { TwilioServiceInterface } from '../types/TwilioServiceInterface';

export class TwilioService implements TwilioServiceInterface {
    private twilioClient: Twilio;
    private accountSid: string;
    private authToken: string;
    private verificationSid: string;

    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
        this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
        this.verificationSid = process.env.TWILIO_VERIFICATION_SID || '';
        this.twilioClient = new Twilio(this.accountSid, this.authToken);
    }

    async startVerification(phoneNumber: string): Promise<any> {
        try {
            const verification = await this.twilioClient.verify.services(this.verificationSid)
                .verifications
                .create({ to: phoneNumber, channel: 'sms' });
            return { sid: verification.sid };
        } catch (error) {
            throw new Error(`Verification failed to start: ${error.message}`);
        }
    }

    async checkVerification(id: string, code: string, phoneNumber: string): Promise<any> {
        try {
            const verificationCheck = await this.twilioClient.verify.services(this.verificationSid)
                .verificationChecks
                .create({ to: phoneNumber, code: code });
            if (verificationCheck.status === 'approved') {
                return { sid: verificationCheck.sid };
            }
            throw new Error('Verification check failed: Invalid code.');
        } catch (error) {
            throw new Error(`Verification check failed: ${error.message}`);
        }
    }
}
