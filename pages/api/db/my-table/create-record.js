import prisma from "@/lib/prismaClient";

export default async (req, res) => {
  if (req.method == "POST") {
    try {
      const newTable = await prisma.myTable.create({ data: req.body });
      res.status(201).json(newTable);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
};
