// src/services/notification.service.ts
import {injectable, BindingScope} from '@loopback/core';
import * as admin from 'firebase-admin';
import path from 'path';

@injectable({scope: BindingScope.TRANSIENT})
export class NotificationService {
  constructor() {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      const serviceAccountPath = path.resolve(__dirname, '../../src/config/serviceAccountKey.json');
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async sendNotification(userToken: string, title: string, message: string) {
    const payload = {
      notification: {
        title: title,
        body: message,
      },
    };

    try {
      const response = await admin.messaging().sendToDevice(userToken, payload);
      return response;
    } catch (error) {
      throw new Error(`Error sending notification: ${error.message}`);
    }
  }
}
