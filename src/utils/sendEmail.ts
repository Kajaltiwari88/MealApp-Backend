const SibApiV3Sdk = require("sib-api-v3-sdk");

export const sendEmail = async (
  email: string,
  otp: string
) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;

  const apiKey =
    defaultClient.authentications["api-key"];

  apiKey.apiKey = process.env.BREVO_API_KEY as string;

  const apiInstance =
    new SibApiV3Sdk.TransactionalEmailsApi();

  await apiInstance.sendTransacEmail({
    sender: {
      name: process.env.BREVO_SENDER_NAME as string,
      email: process.env.BREVO_SENDER_EMAIL as string,
    },

    to: [
      {
        email,
      },
    ],

    subject: "Verify your account",

    htmlContent: `
      <h2>Your OTP is: ${otp}</h2>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  });
};
