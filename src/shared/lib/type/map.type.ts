import { ConditionType } from "./chapter.type";

export type MapType = {
  id: number;
  title: string;
  tmx: string;
  background?: string;
  defPos?: string;
  editor?: {
    url?: string;
  };
  points?: PointType[];
  spawns?: SpawnType[];
};

export type PointType = {
  id?: string;
  type: number;
  name: string;
  pos: string;
  mapId?: string;
  data: {
    chapter: string;
    stage: string;
  };
  condition?: ConditionType;
  editor?: {
    x?: number;
    y?: number;
  };
  actions?: {
    [key: string]: string[];
  };
};

export type SpawnType = {
  // группировка
  group:
    | "LONERS"
    | "BANDITS"
    | "MILITARY"
    | "LIBERTY"
    | "DUTY"
    | "MONOLITH"
    | "MERCENARIES"
    | "SCIENTISTS"
    | "CLEARSKY";
  // крутизна отряда
  strength: "WEAK" | "STALKER" | "MIDDLE" | "MASTER" | "STRONG";
  // кол-во нпс на точке
  n: string;
  // радиус спавна
  r: string;
  // позиция
  pos: string;
  title?: string;
  description?: string;
  data?: {
    [key: string]: string[];
  };
  actions?: {
    [key: string]: string[];
  };
  condition?: ConditionType;
};

export type mapApiType = {
  id: number;
  name: string;
  tmx: string;
  defaultPosition: {
    x: number;
    y: number;
  };
  title: string;
  background: string;
};

export const typePoints: [string, string][] = [
  ["0", "Метка квеста"],
  ["1", "Метка квеста с автозапуском"],
  ["2", "Скрытая метка квеста"],
  ["3", "Скрытая метка квеста с автозапуском"],
  ["4", "Торговец"],
  ["5", "Тайник"],
  ["6", "Дополнительный квест"],
  ["7", "Переход на другую локацию"],
];
