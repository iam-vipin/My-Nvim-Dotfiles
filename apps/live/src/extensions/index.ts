import { Database } from "./database";
import { Logger } from "./logger";
import { Redis } from "./redis";
import { TitleSyncExtension } from "./title-sync";

export const getExtensions = () => [new Logger(), new Database(), new Redis(), new TitleSyncExtension()];
