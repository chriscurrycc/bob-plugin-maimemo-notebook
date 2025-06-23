import {
  createNotepad,
  addSentenceToWord,
  addWordsToNotepad,
  notepadIdFilePath,
} from "./maimemo";
import { translateByBigModel } from "./translate";
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

  const wordNum = text.trim().split(/\s+/);
  const maybeSentence = wordNum.length > 2;
  const canAddSentence = _canAddSentence === "true";

  if (maybeSentence && !canAddSentence) {
    onCompletion({
      error: {
        type: BobTranslationErrorType.NotFound,
        message: "未检测到单词",
      },
    });
    return;
  }

  const paragraphs = text.split("\n").filter((line) => !!line.trim());
  const words = paragraphs[0]
    .split(",")
    .map((word) => word.trim())
    .filter((word) => !!word && word.split(/\s+/).length < 3);
  const sentence = paragraphs[1]?.trim();
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
  if (canAddSentence && sentence && bigModelApiKey) {
    translateByBigModel(sentence)
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
