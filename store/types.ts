export type stageType = {
  id: number;
};

export function exampleChapter(id: string) {
  return {
    id: Number(id),
    stages: [
      {
        id: 0,
        type_stage: 0,
        background_url: "//",
        title: "Привет-с",
        message: "",
        type_message: 0,
        texts: [
          {
            text: "У тебя крутые яйца",
            condition: {},
          },
        ],
        transfers: [
          {
            text: "У тебя тоже",
            stage_id: "1",
            condition: {},
          },
        ],
        actions: {},
      },
    ],
  };
}
