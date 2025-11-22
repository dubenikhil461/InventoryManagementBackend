import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendemail } from "../utils/email.js";

const client = new MongoClient(process.env.MONGODB_URL);
const db = client.db();

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000"], // your frontend
  database: mongodbAdapter(db, {
    client,
  }),
  verification: {
    disableCleanup: false, // cleanup expired verification tokens
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "localhost",
      useSecureCookies: false, // set true in production
    },
  },
  user: {
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        if (user.email.includes("admin")) {
          throw new Error("Admin accounts can't be deleted");
        }
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verifyUrl = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`;
      await sendemail({
        to: user.email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
              <h2 style="text-align: center; color: #333;">Email Verification</h2>
              <p style="color: #555;">
                Hello, please verify your email address by clicking the button below:
              </p>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
                  Verify Email
                </a>
              </div>
              <p style="margin-top: 20px; color: #777; font-size: 12px; text-align: center;">
                If you did not sign up, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
      });
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 12,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      const resetUrl = `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`;
      await sendemail({
        to: user.email,
        subject: "Reset your password",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
            <h2 style="text-align: center; color: #333;">Password Reset</h2>
            <p style="color: #555;">
              You requested to reset your password. Click the button below to continue:
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">
                Reset Password
              </a>
            </div>
            <p style="margin-top: 20px; color: #777; font-size: 12px; text-align: center;">
              If you didn’t request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      });
    },
  },

  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //     redirectURI: "http://localhost:8080/api/auth/callback/google",
  //   },
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET,
  //     redirectURI: "http://localhost:8080/api/auth/callback/github",
  //   },
  // },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 20,
  },
});
