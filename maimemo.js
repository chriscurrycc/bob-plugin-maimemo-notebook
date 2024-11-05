const apiEndpoint = "https://open.maimemo.com/open/api/v1";
const notepadIdFilePath = "$sandbox/notepad-id.txt";

function getHeader() {
  const token = $option.maimemoToken;
  return {
    "Content-Type": "application/json",
    Authorization: token.startsWith("Bearer") ? token : `Bearer ${token}`,
  };
}

function createNotepad(words) {
  const header = getHeader();
  const todayDate = new Date().toLocaleDateString("en-CA");

  return $http
    .request({
      method: "POST",
      url: `${apiEndpoint}/notepads`,
      header,
      body: {
        notepad: {
          status: "PUBLISHED",
          content: `# ${todayDate}\n${words.join("\n")}\n`,
          title: "Bob Plugin",
          brief: "Bob 插件录入词汇",
          tags: ["词典"],
        },
      },
    })
    .then((_resp) => {
      let resp = _resp.data;
      if (resp.success && resp.data.notepad) {
        notepadId = resp.data.notepad.id;
        $file.write({
          data: $data.fromUTF8(notepadId),
          path: notepadIdFilePath,
        });
        return `云词本创建成功，单词 ${words.join(", ")} 已添加`;
      } else {
        throw new Error("创建云词本失败，单词未能成功添加");
      }
    });
}

function addWordsToNotepad(notepadId, words) {
  const header = getHeader();
  const todayDate = new Date().toLocaleDateString("en-CA");

  return $http
    .request({
      method: "GET",
      url: `${apiEndpoint}/notepads/${notepadId}`,
      header,
    })
    .then((_resp) => {
      const resp = _resp.data;
      if (resp.success && resp.data.notepad) {
        const { status, content, title, brief, tags } = resp.data.notepad;
        const lines = content.split("\n").map((line) => line.trim());
        let targetLineIndex = lines.findIndex((line) =>
          line.startsWith(`# ${todayDate}`)
        );

        if (targetLineIndex === -1) {
          lines.unshift("");
          lines.unshift(`# ${todayDate}`);
          targetLineIndex = 0;
        }
        lines.splice(targetLineIndex + 1, 0, ...words);

        return {
          status,
          content: lines.join("\n"),
          title,
          brief,
          tags,
        };
      } else {
        throw new Error("添加单词到云词本失败（未找到云词本）");
      }
    })
    .then((notepad) => {
      return $http.request({
        method: "POST",
        url: `${apiEndpoint}/notepads/${notepadId}`,
        header,
        body: {
          notepad,
        },
      });
    })
    .then((_resp) => {
      const resp = _resp.data;
      if (resp?.success) {
        return `单词 ${words.join(", ")} 已添加到云词本`;
      } else {
        throw new Error("添加单词到云词本失败");
      }
    });
}

function addSentenceToWord(word, sentence, translation) {
  const header = getHeader();

  return $http
    .request({
      method: "GET",
      url: `${apiEndpoint}/vocabulary?spelling=${word}`,
      header,
    })
    .then((_resp) => {
      let resp = _resp.data;
      if (resp.success && resp.data.voc.id) {
        return resp.data.voc.id;
      } else {
        throw new Error("未找到单词");
      }
    })
    .then((wordId) => {
      return $http.request({
        method: "POST",
        url: `${apiEndpoint}/phrases`,
        header,
        body: {
          phrase: {
            voc_id: wordId,
            phrase: sentence,
            interpretation: translation,
            tags: ["词典"],
            origin: "Bob Plugin",
          },
        },
      });
    })
    .then((_resp) => {
      const resp = _resp.data;
      if (resp.success) {
        return `例句已添加到单词 ${word}`;
      } else {
        throw new Error(`添加例句到单词 ${word} 失败`);
      }
    });
}

module.exports = {
  createNotepad,
  addWordsToNotepad,
  addSentenceToWord,
  notepadIdFilePath,
};
