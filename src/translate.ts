const bigModelApiEndpoint =
  "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const openaiApiEndpoint = "https://api.openai.com/v1/responses";

interface BigModelCompletionResponse {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
}

interface OpenAIResponse {
  output?: {
    content?: {
      text: string;
    }[];
  }[];
}

function getPrompt() {
  const detectFrom = "英语";
  const detectTo = "中文简体";
  const prompt =
    "你是一个翻译专家 : 专注于" +
    detectFrom +
    "到" +
    detectTo +
    "的翻译，请确保翻译结果的准确性和专业性，同时，请确保翻译结果的翻译质量，不要出现翻译错误，翻译时能够完美确保翻译结果的准确性和专业性，同时符合" +
    detectTo +
    "的表达和语法习惯。" +
    "你拥有如下能力:" +
    detectFrom +
    "到" +
    detectTo +
    "的专业翻译能力，理解并保持原意，熟悉" +
    detectTo +
    "表达习惯。" +
    "翻译时,请按照如下步骤: " +
    "1. 仔细阅读并理原文内容" +
    "2. 务必确保准确性和专业性" +
    "3. 校对翻译文本，确保符合" +
    detectTo +
    "表达习惯,并加以语法润色。" +
    "4. 请只输出最终翻译文本。";

  return prompt;
}

async function translateByOpenAI(sentence: string) {
  return $http
    .request<OpenAIResponse>({
      method: "POST",
      url: openaiApiEndpoint,
      header: {
        Authorization: `Bearer ${$option.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: {
        model: $option.openaiModel,
        instructions: getPrompt(),
        input: sentence,
      },
    })
    .then((_resp) => {
      const resp = _resp.data;
      const translation = resp.output?.[0]?.content?.[0]?.text;

      if (translation) {
        return translation;
      } else {
        throw new Error("例句翻译失败");
      }
    });
}

async function translateByBigModel(sentence: string) {
  return $http
    .request<BigModelCompletionResponse>({
      method: "POST",
      url: bigModelApiEndpoint,
      header: {
        Authorization: $option.bigModelApiKey!,
        "Content-Type": "application/json",
      },
      body: {
        model: $option.bigModelModel,
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: sentence,
          },
        ],
      },
    })
    .then((_resp) => {
      const resp = _resp.data;
      const translation = resp.choices?.[0]?.message?.content;

      if (translation) {
        return translation;
      } else {
        throw new Error("例句翻译失败");
      }
    });
}

export async function translateByLLM(sentence: string) {
  if ($option.openaiApiKey) {
    return translateByOpenAI(sentence);
  } else {
    return translateByBigModel(sentence);
  }
}
