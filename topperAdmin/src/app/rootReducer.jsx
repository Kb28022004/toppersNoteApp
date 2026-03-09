import { combineReducers } from "@reduxjs/toolkit";
import { adminApi } from "../feature/api/adminApi";


const rootReducer=combineReducers({
   
    [adminApi.reducerPath]:adminApi.reducer,
 
})

export default rootReducer