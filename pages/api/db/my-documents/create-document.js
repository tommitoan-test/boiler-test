import prisma from "@/lib/prismaClient";

export default async (req, res) => {
  if (req.method == "POST") {
    try {
      const myDocument = await prisma.myDocuments.create({ data: req.body });
      console.log(myDocument);
      res.status(201).json(myDocument);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
};
