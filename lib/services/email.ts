const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export async function sendDueDateReminder(
  email: string,
  orderDetails: {
    orderID: number;
    customerName: string;
    dueDate: Date;
    description: string;
    hoursUntilDue: number;
  }
) {
  // This function is kept for compatibility but doesn't send emails anymore
  return true;
} 