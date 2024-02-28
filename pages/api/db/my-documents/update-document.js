import prisma from "@/lib/prismaClient";

export default async (req, res) => {
  if (req.method == "PUT") {
    try {
      const updatedTable = await prisma.myDocuments.update({
        where: { id: req.body.id },
        data: req.body,
      });
      res.status(200).json(updatedTable);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
};
