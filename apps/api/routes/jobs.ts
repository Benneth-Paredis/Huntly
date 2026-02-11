import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

router.use(authenticate);

router.post("/", async (req: AuthRequest, res: Response) => {
  const { company, position, status } = req.body;

  const job = await prisma.jobApplication.create({
    data: {
      company,
      position,
      status,
      userId: req.user!.userId,
    },
  });

  res.status(201).json(job);
});

router.get("/", async (req: AuthRequest, res: Response) => {
  const jobs = await prisma.jobApplication.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(jobs);
});

router.patch("/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { company, position, status } = req.body;

  const job = await prisma.jobApplication.findUnique({ where: { id } });

  if (!job || job.userId !== req.user!.userId) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const updated = await prisma.jobApplication.update({
    where: { id },
    data: {
      ...(company !== undefined && { company }),
      ...(position !== undefined && { position }),
      ...(status !== undefined && { status }),
    },
  });

  res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const job = await prisma.jobApplication.findUnique({ where: { id } });

  if (!job || job.userId !== req.user!.userId) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  await prisma.jobApplication.delete({ where: { id } });

  res.status(204).send();
});

export default router;
