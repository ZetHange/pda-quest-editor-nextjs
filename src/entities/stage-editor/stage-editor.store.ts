import { create } from "zustand";

import { StageTransferType, StageType } from "@/shared/lib/type/chapter.type";
import { PointType } from "@/shared/lib/type/map.type";

export interface IStageTransfer {
  transfer: StageTransferType | undefined;
  stageIndex: number;
  transferIndex: number;
}

export interface IStageStore {
  stage: StageType | undefined;
  editStage: (stage: Partial<StageType>) => void;
  setStage: (stage: StageType) => void;

  point: PointType | undefined;
  editPoint: (point: Partial<PointType>) => void;
  setPoint: (point: PointType) => void;

  // transfer
  transfer: IStageTransfer | undefined;
  editTransfer: (transfer: Partial<StageTransferType>) => void;
  setTransfer: (transfer: IStageTransfer) => void;

  reset: () => void;
}

export const useStageStore = create<IStageStore>((set) => ({
  stage: undefined,
  editStage: (stage: Partial<StageType>) => {
    return set((state) => ({
      stage: { ...state.stage, ...(stage as StageType) },
    }));
  },
  setStage: (stage: StageType) => set({ stage }),

  point: undefined,
  editPoint: (point: Partial<PointType>) => {
    return set((state) => ({
      point: { ...state.point, ...(point as PointType) },
    }));
  },
  setPoint: (point: PointType) => set({ point }),

  transfer: undefined,
  editTransfer: (transfer: Partial<StageTransferType>) => {
    return set((state) => ({
      transfer: {
        ...(state.transfer as IStageTransfer),
        transfer: {
          ...(state.transfer?.transfer as StageTransferType),
          ...transfer,
        },
      },
    }));
  },
  setTransfer: (transfer: IStageTransfer) => set({ transfer }),

  reset: () => set({ stage: undefined, point: undefined, transfer: undefined }),
}));
