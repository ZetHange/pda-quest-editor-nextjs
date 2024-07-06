import { MapType } from "@/shared/lib/type/map.type";
import { create } from "zustand";

export interface IMapsStore {
    maps: MapType[];
    setMaps: (maps: MapType[]) => void;
    getMapsByStoryId: (storyId: number) => void;
    deleteMap: (mapId: number) => void;
}

export const useMapsStore = create<IMapsStore>((set, get) => ({
    maps: [],
    setMaps: (maps) => set(() => ({ maps: maps })),


    // get maps by story id from localStorage
    getMapsByStoryId: (storyId: number) => {
      let maps: MapType[] = [];
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(`story_${storyId}_maps_`)) {
          const map = JSON.parse(localStorage.getItem(key) as string);
          maps.push(map);
        }
      });
      maps.sort((a, b) => a.id - b.id); 
      
      set({ maps: maps })
    },

    deleteMap: (mapId: number) => {
      const maps = get().maps.filter((map) => map.id !== mapId);
      set({ maps: maps });
    }
}));

