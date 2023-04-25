import express from "express";
import { resolve } from "path";
import prisma from "../main";
import { Coordinates, IHw, IHwStatistic } from "./interfaces";

const hwRouter = express.Router();

hwRouter.post("/createHwInfo", async (req, res) => {
  const body: IHw = req.body;

  if (!body.hwName) {
    console.log("hwName not given!");
    return res.status(401).json({ error: "hwName not given!" });
  }

  if (!body.os) {
    console.log("os not given!");
    return res.status(401).json({ error: "os not given!" });
  }

  try {
    const hwSearched = await prisma.hwInfos.findFirst({
      where: {
        hwName: body.hwName,
        os: body.os,
        cpu: body.cpu,
      },
    });

    if (hwSearched != null) {
      return res.status(208).json({ hwSearched, message: "Already exist" });
    }

    const hwName = await prisma.hwInfos.create({
      data: {
        hwName: body.hwName,
        os: body.os,
        cpu: body.cpu,
        gpu: body.gpu?.toString(),
      },
    });

    console.log(hwName);

    res.json(hwName);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ err, message: "Error while creating a row in hwInfo" });
  }
});

hwRouter.post("/createHwStatistics", async (req, res) => {
  const body: IHwStatistic = req.body;

  if (!body.hwInfoId) {
    console.log("hwInfoId not given!");
    return res.status(401).json({ error: "hwInfoId not given!" });
  }

  if (!body.cpuUsage) {
    console.log("cpuUsage not given!");
    return res.status(401).json({ error: "cpuUsage not given!" });
  }

  if (!body.cpuTemperature) {
    console.log("cpuTemperature not given!");
    return res.status(401).json({ error: "cpuTemperature not given!" });
  }

  try {
    let parsedProgramName: string | null = null;

    if (body.programInUse) {
      const programName = await prisma.programNames.findUnique({
        where: {
          name: body.programInUse,
        },
      });

      if (!programName) {
        const newProgramName = await prisma.programNames.create({
          data: {
            name: body.programInUse,
          },
        });

        parsedProgramName = newProgramName.name;
      } else {
        parsedProgramName = programName.name;
      }
    }

    const hwStatistics = await prisma.hwStatistics.create({
      data: {
        hwInfoId: body.hwInfoId,
        cpuUsage: body.cpuUsage,
        cpuTemperature: body.cpuTemperature,
        gpuUsage: body.gpuUsage,
        programName: parsedProgramName,
      },
    });

    console.log(hwStatistics);

    res.json(hwStatistics);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      err,
      message: "Error while creating a row in hwStatistics",
    });
  }
});

hwRouter.get("/allHwInfo", async (_req, res) => {
  try {
    const allHwInfo = await prisma.hwInfos.findMany();

    return res.json(allHwInfo);
  } catch (err) {
    res.status(500).json(err);
  }
});

hwRouter.get("/allHwInfoIds", async (_req, res) => {
  try {
    const allHwInfo = await prisma.hwInfos.findMany({
      select: {
        hwName: true,
        hwInfoId: true,
      },
    });

    return res.json(allHwInfo);
  } catch (err) {
    res.status(500).json(err);
  }
});

hwRouter.get("/allHwStatistics", async (_req, res) => {
  try {
    const allHwStatistics = await prisma.hwStatistics.findMany();

    return res.json(allHwStatistics);
  } catch (err) {
    res.status(500).json(err);
  }
});

hwRouter.get("/all", async (_req, res) => {
  try {
    const allHwStatistics = await prisma.hwInfos.findMany({
      include: {
        HwStatistics: true,
      },
    });

    return res.json(allHwStatistics);
  } catch (err) {
    res.status(500).json(err);
  }
});

hwRouter.get("/hwInfo/:hwInfoId", async (req, res) => {
  const hwInfoId = parseInt(req.params["hwInfoId"]);
  try {
    const hwInfos = await prisma.hwInfos.findFirst({
      where: {
        hwInfoId: hwInfoId,
      },
    });

    if (!hwInfos) {
      console.log("hwInfos doesn't exist!");
      return res.status(401).json({ error: "hwInfos doesn't exist!" });
    }

    return res.json(hwInfos);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

hwRouter.get("/allStatistics/:hwInfoId", async (req, res) => {
  const hwInfoId = parseInt(req.params["hwInfoId"]);
  try {
    const allHwStatistics = await prisma.hwStatistics.findMany({
      where: {
        hwInfoId: hwInfoId,
      },
      select: {
        cpuTemperature: true,
        createdAt: true,
      },
    });

    let parsedData: Coordinates = { x: [], y: [] };

    allHwStatistics.forEach((element) => {
      parsedData.y.push(element.cpuTemperature);
      parsedData.x.push(element.createdAt);
    });

    return res.json(parsedData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

hwRouter.get("/lastTempCpu/:hwInfoId", async (req, res) => {
  const hwInfoId = parseInt(req.params["hwInfoId"]);
  try {
    const allHwStatistics = await prisma.hwStatistics.findFirst({
      where: {
        hwInfoId: hwInfoId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!allHwStatistics) {
      return res.status(404).json("CPU temperature not found");
    }

    return res.json(allHwStatistics?.cpuTemperature);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

hwRouter.get("/lastUsageCpu/:hwInfoId", async (req, res) => {
  const hwInfoId = parseInt(req.params["hwInfoId"]);
  try {
    const allHwStatistics = await prisma.hwStatistics.findFirst({
      where: {
        hwInfoId: hwInfoId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!allHwStatistics) {
      return res.status(404).json("CPU usage not found");
    }

    return res.json(allHwStatistics?.cpuUsage);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

hwRouter.get("/home", async (_req: express.Request, res: express.Response) => {
  res.sendFile(resolve("./home.html"));
});

export default hwRouter;
