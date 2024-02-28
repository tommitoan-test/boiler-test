import { getToken } from "next-auth/jwt";

export default async (req, res) => {
  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    //fetch user data from token

    // The user is authenticated, proceed with your API route handler
    res.status(200).json({ message: "Protected data" });
  } else {
    // The user is not authenticated, respond with a 401 status code
    res.status(401).json({ message: "Unauthorized" });
  }
};
