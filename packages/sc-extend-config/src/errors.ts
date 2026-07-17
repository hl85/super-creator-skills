/**
 * sc-extend-config 结构化错误
 */

export class MissingCredentialsError extends Error {
  readonly account: string | undefined;
  readonly triedSources: string[];
  readonly skippedSources: string[];

  constructor(
    message: string,
    context: {
      account?: string;
      triedSources?: string[];
      skippedSources?: string[];
    } = {},
  ) {
    super(message);
    this.name = "MissingCredentialsError";
    this.account = context.account;
    this.triedSources = context.triedSources ?? [];
    this.skippedSources = context.skippedSources ?? [];
  }
}

export class InvalidExtendFileError extends Error {
  readonly filePath: string;
  readonly line?: number;

  constructor(message: string, filePath: string, line?: number) {
    super(`${filePath}${line !== undefined ? `:${line}` : ""}: ${message}`);
    this.name = "InvalidExtendFileError";
    this.filePath = filePath;
    this.line = line;
  }
}

export class AmbiguousAccountError extends Error {
  readonly alias: string;
  readonly candidates: string[];

  constructor(alias: string, candidates: string[]) {
    super(
      `Multiple accounts match alias "${alias}": ${candidates.join(", ")}. ` +
        `Use --account <alias> with a unique value, or rename the conflicting accounts in EXTEND.md.`,
    );
    this.name = "AmbiguousAccountError";
    this.alias = alias;
    this.candidates = candidates;
  }
}
