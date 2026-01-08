import { Schema } from "effect";

export const UrlString = Schema.String.pipe(
  Schema.filter((s) => URL.canParse(s), { message: () => "Must be a valid URL" })
);

export const Base64String = Schema.String;

export const HTMLContent = Schema.String;

export const NonEmptyHTMLContent = Schema.String.pipe(
  Schema.filter((html) => html.trim().length > 0, { message: () => "HTML content cannot be empty" })
);

export const AuditFields = Schema.Struct({
  created_at: Schema.optional(Schema.String),
  updated_at: Schema.optional(Schema.String),
});
