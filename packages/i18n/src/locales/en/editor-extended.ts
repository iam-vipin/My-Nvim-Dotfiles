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

export default {
  attachmentComponent: {
    uploader: {
      drag_and_drop: "Drop files here or click to upload",
    },
    errors: {
      file_too_large: {
        title: "File too large.",
        description: "Maximum size per file is {maxFileSize}MB",
      },
      unsupported_file_type: {
        title: "Unsupported file type.",
        description: "See supported formats",
      },
      default: {
        title: "Upload failed.",
        description: "Something went wrong. Please try again.",
      },
    },
    upgrade: {
      description: "Upgrade your plan to view this attachment.",
    },
    aria: {
      click_to_upload: "Click to upload attachment",
    },
  },
  externalEmbedComponent: {
    block_menu: {
      convert_to_embed: "Convert to Embed",
      convert_to_link: "Convert to Link",
      convert_to_richcard: "Convert to Rich Card",
    },
    placeholder: {
      insert_embed: "Insert your preferred embed link here, such as YouTube video, Figma design, etc.",
      link: "Enter or paste a link",
    },
    input_modal: {
      embed: "Embed",
      works_with_links: "Works with YouTube, Figma, Google Docs and more",
    },
    error: {
      not_valid_link: "Please enter a valid URL.",
    },
  },
};
