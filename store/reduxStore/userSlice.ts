import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IUser } from "../types/userType";

export interface ISettings {
  danyaMod?: boolean;
  showMiniMap?: boolean;
  onlyRenderVisibleElements?: boolean;
}

interface IInitialState {
  user: IUser;
  settings: ISettings;
}

const initialState: IInitialState = {
  user: {
    avatar: "",
    email: "",
    gang: "",
    id: "",
    lastLoginAt: "",
    login: "",
    name: "",
    nickname: "",
    pdaId: 0,
    registration: "",
    role: "",
    xp: 0,
  },
  settings: {
    danyaMod: false,
    showMiniMap: true,
    onlyRenderVisibleElements: false,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    setSettings: (state, action: PayloadAction<ISettings>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
  },
});

export const { setUser, setSettings } = userSlice.actions;

export default userSlice.reducer;
