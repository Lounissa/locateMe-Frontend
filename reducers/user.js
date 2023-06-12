import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: { nickname: '', places: [] },
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addNickname: (state, action) => {
      state.value.nickname = action.payload;
    },
    addPlace: (state, action) => {
      state.value.places.push(action.payload);
    },
    removePlace: (state, action) => {
      state.value.places = state.value.places.filter(
        (el) => el.name != action.payload
      );
    },
    importPlaces: (state, action) => {
      state.value.places = action.payload;
    },
  },
});

export const { addNickname, addPlace, removePlace, importPlaces } =
  userSlice.actions;
export default userSlice.reducer;
