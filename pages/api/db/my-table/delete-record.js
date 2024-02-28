import prisma from "@/lib/prismaClient";

export default async (req, res) => {
  if (req.method == "DELETE") {
    try {
      const deletedTable = await prisma.myTable.delete({
        where: { id: req.body.id },
      });
      res.status(200).json(deletedTable);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }
};
