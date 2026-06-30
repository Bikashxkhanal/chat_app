
type cookieSameSite = "none" | "strict" | "lax";

const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions: {
  secure: boolean;
  httpOnly: boolean;
  sameSite: cookieSameSite;
} = {
  secure: isProduction,
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
};
