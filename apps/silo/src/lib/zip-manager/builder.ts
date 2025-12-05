import { Store } from "@/worker/base";
import type { StorageProvider } from "./storage-provider";
import { S3StorageProvider } from "./storage-provider";
import type { TZipManagerOptions } from "./types";
import { ZipManager } from "./zip-manager";

export function createZipManager(options: TZipManagerOptions): ZipManager {
  let storageProvider: StorageProvider;
  if (options.type === "s3") {
    if (!options.bucket || !options.s3Client) {
      throw new Error("Bucket and S3Client required for S3 storage");
    }
    storageProvider = new S3StorageProvider(options.s3Client, options.bucket);
  } else {
    throw new Error(`Unsupported storage type: ${(options as any).type}`);
  }

  const store = Store.getInstance();

  return new ZipManager(storageProvider, store);
}
