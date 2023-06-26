import { conditionType } from "@/store/types/types";

export type mapType = {
  id: string;
  title: string;
  tmx: string;
  background?: string;
  defPos?: string;
  editor?: {
    url?: string;
  };
  points?: pointType[];
  spawns?: spawnType[];
};

export type pointType = {
  id?: string;
  type: number;
  name: string;
  pos: string;
  data: {
    chapter: string;
    stage: string;
  };
  condition?: conditionType;
  editor?: {
    x?: number;
    y?: number;
  };
};

export type spawnType = {
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
  strength: "WEAK" | "MIDDLE" | "STRONG";
  // кол-во нпс на точке
  n: string;
  // радиус спавна
  r: string;
  // позиция
  pos: string;
  title?: string;
  description?: string;
  actions?: {
    [key: string]: string[];
  };
  condition?: {
    [key: string]: string[];
  };
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
  ["4", "Торговецб"],
  ["5", "Тайникб"],
  ["6", "Дополнительный квест"],
  ["7", "Переход на другую локацию"],
];
