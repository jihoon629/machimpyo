// src/features/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from './features/user/userSlice';
// import yourSlice from './yourSlice';

const store = configureStore({
  reducer: {
    // yourReducer: yourSlice
    user: userReducer,
  },
});

export default store;
