interface PluginOption {
  maimemoToken?: string;
  bigModelModel: string;
  bigModelApiKey?: string;
  canAddSentence: string;
  notepadId?: string;
}

interface BobTranslationResult {
  result: {
    toParagraphs: string[];
  };
}

interface BobTranslationError {
  error: {
    type: BobTranslationErrorType;
    message?: string;
  };
}

interface BobResponseJSONData<T = unknown> {
  data: T;
}

interface BobDataObject {
  fromUTF8(value: string): BobDataObject;
  toUTF8(): string;
}

export enum BobTranslationErrorType {
  NoSecretKey = "secretKey",
  NotFound = "notFound",
  Network = "network",
  UnSupportedLanguage = "unsupportedLanguage",
}

type FuncOnCompletion = (
  result: BobTranslationResult | BobTranslationError
) => void;

export interface BobQuery {
  text: string;
  detectFrom: string;
  onCompletion: FuncOnCompletion;
}

declare global {
  const $option: PluginOption;
  const $log: {
    info: (message: any) => void;
    error: (message: any) => void;
  };
  const $file: {
    read: (path: string) => BobDataObject;
    write: (param: { data: BobDataObject; path: string }) => void;
    exists: (path: string) => boolean;
  };
  const $data: BobDataObject;
  const $http: {
    request: <T>(options: {
      method: "GET" | "POST";
      url: string;
      header: Record<string, string>;
      body?: any;
    }) => Promise<BobResponseJSONData<T>>;
  };
}

// 确保文件被视为模块
export {};
