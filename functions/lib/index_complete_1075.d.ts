import * as functions from 'firebase-functions/v1';
export declare const onUserCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const onAppointmentConfirmed: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const onAppointmentCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const onClientRescheduleRequest: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const onVeeRescheduleRequest: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const onConfirmRescheduleRequest: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const onAppointmentCancelled: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const onAppointmentNoShow: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const onLateReschedule: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const processMailQueue: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const processMonthlyBilling: functions.CloudFunction<unknown>;
export declare const onMessageCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const onInvoiceCreated: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const sendDailyReminders: functions.CloudFunction<unknown>;
export declare const onHealthInfoUpdated: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const onServicePlanUpgrade: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const processScheduledDowngrades: functions.CloudFunction<unknown>;
//# sourceMappingURL=index_complete_1075.d.ts.map