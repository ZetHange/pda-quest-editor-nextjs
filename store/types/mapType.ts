export type mapType = {
  id: string;
  title: string;
  tmx: string;
  defPos?: string;
  editor?: {
    url?: string;
  };
  points?: pointType[];
  spawns?: spawnType[];
};

export type pointType = {
  id?: string;
  type: string;
  name: string;
  pos: string;
  data: {
    chapter: string;
    stage: string;
  };
  condition?: any;
  editor?: {
    x?: number;
    y?: number;
  };
};

export enum spawnGroup {
  LONERS = "LONERS",
  BANDITS = "BANDITS",
  MILITARY = "MILITARY",
  LIBERTY = "LIBERTY",
  DUTY = "DUTY",
  MONOLITH = "MONOLITH",
  MERCENARIES = "MERCENARIES",
  SCIENTISTS = "SCIENTISTS",
  CLEARSKY = "CLEARSKY",
}

export enum spawnStrength {
  WEAK = "WEAK",
  MIDDLE = "MIDDLE",
  STRONG = "STRONG",
}

export type spawnType = {
  group: spawnGroup;
  strength: spawnStrength;
  // кол-во нпс на точке
  n: string;
  // радиус спавна
  r: string;
  // позиция
  pos: string;
};
