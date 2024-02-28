import prisma from "@/lib/prismaClient";

export default async (req, res) => {
  if (req.method == "GET") {
    try {
      const myDocument = await prisma.myDocuments.findMany();
      res.status(200).json(myDocument);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
};
