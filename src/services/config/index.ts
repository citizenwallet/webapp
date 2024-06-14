import { Config } from "@citizenwallet/sdk";
import fs from "fs";
import path from "path";

export const getConfig = (): Config => {
  return JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "./config.json"), "utf-8")
  );
};
