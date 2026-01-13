import { Schema } from "effect";

export class MessageParseError extends Schema.TaggedError<MessageParseError>()("MessageParseError", {
  message: Schema.NonEmptyTrimmedString,
  cause: Schema.optional(Schema.Unknown),
}) {}
