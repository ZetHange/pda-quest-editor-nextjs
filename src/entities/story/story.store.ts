import { create } from "zustand";
import { type StoryType } from "@/shared/lib/type/story.type";

export interface IStoryStore {
  stories: StoryType[];
  setStories: (stories: StoryType[]) => void;
  editStory: StoryType | null;
  setEditStory: (story: Partial<StoryType>) => void;
  uploadConfig: IConfigExport;
  setUploadConfig: (config: Partial<IConfigExport>) => void;
}

export interface IConfigExport {
  id: number;
  type: "PUBLIC" | "PRIVATE" | "COMMUNITY";
  toStore: boolean;
  message: string;
}

export const useStoryStore = create<IStoryStore>((set) => ({
  stories: [],
  setStories: (stories) => set(() => ({ stories: stories })),
  editStory: null,
  setEditStory: (story) => {
    return set((state) => ({
      editStory: { ...state.editStory, ...(story as Required<typeof story>) },
    }));
  },
  
  // todo
  uploadConfig: {
    id: 0,
    type: "PUBLIC",
    toStore: false,
    message: "",
  },
  setUploadConfig: (config) => {
    return set((state) => ({
      uploadConfig: {
        ...state.uploadConfig,
        ...(config as IConfigExport),
      },
    }));
  },
}));
