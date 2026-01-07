/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { FC } from "react";
import { useState, useCallback } from "react";
import { observer } from "mobx-react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
// plane imports
import { Button } from "@plane/propel/button";
import { IconButton } from "@plane/propel/icon-button";
import { cn } from "@plane/utils";
// hooks
import { useInstanceManagement } from "@/plane-admin/hooks/store/use-instance-management";
// components
import { LicenseCardWrapper } from "./license-card-wrapper";
import { InstanceDetailsSection } from "./instance-details";

type TLicenseFileFormProps = {
  onSuccess: () => void;
};

export const LicenseFileSection: FC<TLicenseFileFormProps> = observer(function LicenseFileSection(
  props: TLicenseFileFormProps
) {
  const { onSuccess } = props;
  // hooks
  const { activateUsingLicenseFile } = useInstanceManagement();
  // states
  const [activationLoader, setActivationLoader] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  // derived
  const hasError = Boolean(error);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(undefined);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Validate file type
      if (!file.name.endsWith(".json")) {
        setError("Please upload a valid license file (.json)");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setError(undefined);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      const errorMessage = "Please select a license file";
      setError(errorMessage);
      return;
    }

    try {
      setActivationLoader(true);
      await activateUsingLicenseFile(selectedFile);
      onSuccess();
      setSelectedFile(null);
    } catch (error: any) {
      const errorMessage =
        error?.error ?? "Your license file is invalid or already in use. For any queries contact support@plane.so";
      setError(errorMessage);
    } finally {
      setActivationLoader(false);
    }
  };

  return (
    <LicenseCardWrapper
      description={
        <>
          <p>If you possess an enterprise plan, please upload your license file to activate it here.</p>
          <p>This activation will apply to all workspaces within this instance.</p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {!selectedFile ? (
            <div
              {...getRootProps()}
              className={cn(
                "rounded-xl p-4 text-center cursor-pointer transition-colors border border-dashed border-strong bg-layer-2"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-2 text-secondary text-body-xs-medium">
                <Upload className="size-4" />
                <p>
                  {isDragActive
                    ? "Drop the license file here"
                    : "Drag & drop or click to browse. Supports .json files."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={cn("bg-layer-2 border border-subtle-1 rounded-xl p-3", hasError && "border-danger-strong")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="size-5 text-custom-text-300" />
                    <p className="text-sm font-medium text-custom-text-200">{selectedFile.name}</p>
                  </div>
                  <IconButton type="button" variant="error-outline" size="sm" onClick={removeFile} icon={X} />
                </div>
              </div>
              {hasError && <div className="text-caption-sm-medium text-danger-secondary">{error}</div>}
            </>
          )}
        </div>
        <div className="flex flex-col overflow-y-auto vertical-scrollbar scrollbar-xs">
          <div className="flex-shrink-0 border-t border-subtle pt-4">
            <InstanceDetailsSection />
          </div>
        </div>
        <div className="flex">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={activationLoader}
            disabled={!selectedFile || activationLoader}
          >
            {activationLoader ? "Activating" : "Activate"}
          </Button>
        </div>
      </form>
    </LicenseCardWrapper>
  );
});
