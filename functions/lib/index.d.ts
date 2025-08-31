import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
export declare const db: admin.firestore.Firestore;
export declare const storage: import("firebase-admin/lib/storage/storage").Storage;
export declare const sendWelcomeEmail: functions.HttpsFunction & functions.Runnable<any>;
export declare const sendAppointmentConfirmation: functions.HttpsFunction & functions.Runnable<any>;
export declare const sendInvoiceEmail: functions.HttpsFunction & functions.Runnable<any>;
export declare const api: functions.HttpsFunction;
export declare const onAppointmentCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const onInvoiceCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
//# sourceMappingURL=index.d.ts.map