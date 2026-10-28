import { useState,useEffect } from "react";
import mockMenu from "../utils/mockMenu_616821";


const useRestaurantMenu=(resId)=>{
    

    const [resInfo,setResInfo]= useState(null);


    useEffect(() => {
    console.log("resId:", resId);
    setResInfo(mockMenu);
  }, [resId]);



    return resInfo;
};

export default useRestaurantMenu;