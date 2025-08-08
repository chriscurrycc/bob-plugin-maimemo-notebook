import {
  createNotepad,
  addSentenceToWord,
  addWordsToNotepad,
  notepadIdFilePath,
} from "./maimemo";
import { translateByLLM } from "./translate";
import { parseMarkedInput } from "./analyze";
import { BobQuery, BobTranslationErrorType } from "./types";

export function supportLanguages() {
  return ["zh-Hans", "en"];
}

export function translate(query: BobQuery) {
  const { text, detectFrom, onCompletion } = query;
  const {
    maimemoToken,
    notepadId: _notepadId,
    canAddSentence: _canAddSentence,
    bigModelApiKey,
    openaiApiKey,
    markWordsEnabled,
    wordMarkerPrefix,
    wordMarkerSuffix,
    maxMarkedWordTokens,
    overrideCanAddSentenceWhenMarked,
    stripMarkersBeforeTranslate,
  } = $option;

  if (detectFrom !== "en") {
    onCompletion({
      error: {
        type: BobTranslationErrorType.UnSupportedLanguage,
        message: "墨墨云词本只支持添加英文单词",
      },
    });
    return;
  }

  const canAddSentence = _canAddSentence === "true";

  let words: string[] = [];
  let sentence = "";
  let usedMarkerMode = false;

  const enableMarker = (markWordsEnabled ?? "true") !== "false";
  if (enableMarker) {
    const parsed = parseMarkedInput(text, {
      prefix: (wordMarkerPrefix || ">>").trim() || ">>",
      suffix: (wordMarkerSuffix || "").trim(),
      maxTokens: Math.max(1, parseInt(maxMarkedWordTokens || "4", 10) || 4),
      stripMarkers: (stripMarkersBeforeTranslate ?? "true") !== "false",
    });
    if (parsed.words.length > 0) {
      words = parsed.words;
      sentence = parsed.cleanedSentence;
      usedMarkerMode = true;
    }
  }

  if (!usedMarkerMode) {
    const paragraphs = text.split("\n").filter((line) => !!line.trim());
    words = paragraphs[0]
      .split(/[,，]/)
      .map((word) => word.trim())
      .filter((word) => !!word && word.split(/\s+/).length <= 4);
    sentence = paragraphs[1]?.trim?.() || "";
  }
  let notepadId = _notepadId;

  if (!maimemoToken) {
    onCompletion({
      error: {
        type: BobTranslationErrorType.NoSecretKey,
        message: "墨墨开放 API Token 未配置",
      },
    });
    return;
  }

  if (words.length === 0) {
    onCompletion({
      error: {
        type: BobTranslationErrorType.NotFound,
        message: "未检测到单词",
      },
    });
    return;
  }

  // Create sample sentence for words
  let finished = false;
  let partMessage = "";
  let shouldAddSentence = canAddSentence;
  if (usedMarkerMode && (overrideCanAddSentenceWhenMarked ?? "true") !== "false") {
    shouldAddSentence = true;
  }

  if (shouldAddSentence) {
    if (!sentence) {
      partMessage = "例句创建失败（未检测到例句）";
      finished = true;
    } else if (!bigModelApiKey && !openaiApiKey) {
      partMessage = "例句创建失败（未配置大模型 API Key）";
      finished = true;
    } else {
      translateByLLM(sentence)
        .then((translation) => {
          const tasks = words.map((word) =>
            addSentenceToWord(word, sentence, translation)
          );
          Promise.allSettled(tasks).then((results) => {
            const hasAnySuccess = results.some(
              (task) => task.status === "fulfilled"
            );

            if (finished) {
              if (hasAnySuccess) {
                onCompletion({
                  result: {
                    toParagraphs: [
                      `${partMessage ? partMessage + "，" : ""}例句创建成功`,
                    ],
                  },
                });
              } else {
                const failReason = results.find(
                  (task) => task.status === "rejected"
                )?.reason;

                onCompletion({
                  error: {
                    type: BobTranslationErrorType.Network,
                    message: `${
                      partMessage ? partMessage + "，" : ""
                    }例句创建失败（${failReason}）`,
                  },
                });
              }
            } else {
              partMessage = `例句创建${hasAnySuccess ? "成功" : "失败"}`;
              finished = true;
            }
          });
        })
        .catch((error) => {
          const currentPartMessage = `例句创建失败（${error.message}）`;
          if (finished) {
            onCompletion({
              error: {
                type: BobTranslationErrorType.Network,
                message: `${
                  partMessage ? partMessage + "，" : ""
                }${currentPartMessage}`,
              },
            });
          } else {
            partMessage = currentPartMessage;
            finished = true;
          }
        });
    }
  } else {
    finished = true;
  }

  // Try to grab cached notepadId if user don't provide one
  if (!notepadId && $file.exists(notepadIdFilePath)) {
    notepadId = $file.read(notepadIdFilePath).toUTF8();
  }

  let addWordsTask = null;
  if (notepadId) {
    // Add words to existing notepad
    addWordsTask = addWordsToNotepad(notepadId, words);
  } else {
    // Create new notepad
    addWordsTask = createNotepad(words);
  }

  addWordsTask
    .then((result) => {
      if (finished) {
        onCompletion({
          result: {
            toParagraphs: [`${result}${partMessage ? "，" + partMessage : ""}`],
          },
        });
      } else {
        partMessage = result;
      }
    })
    .catch((error) => {
      if (finished) {
        onCompletion({
          error: {
            type: BobTranslationErrorType.Network,
            message: `${error.message}${partMessage ? "，" + partMessage : ""}`,
          },
        });
      } else {
        partMessage = error.message;
      }
    })
    .finally(() => {
      finished = true;
    });
}
