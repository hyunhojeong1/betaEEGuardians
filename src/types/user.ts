export interface UserDoc {
  uid: string;
  role: "customer" | "staff";
  verificationCode: string;
  createdAt: Date;
  updatedAt: Date;
}
