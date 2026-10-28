import { render,act } from "@testing-library/react";
import Body from "../Body";
import Mock_Data from "../mocks/mockResListData.json";
import { BrowserRouter } from "react-router-dom";
import "@testing-library/jest-dom";

global.fetch = jest.fn(() =>{
  return Promise.resolve({
    json:()=>{
         return Promise.resolve(Mock_Data);
    }
  })
});

it("should render the body component", async ()=>{

    await act(async ()=>
         render(
    <BrowserRouter>
    <Body/>
    </BrowserRouter>));

const searchBtn= screen.getByRole("button",{name:"Search"});

expected(searchBtn).toBeInTheDocument();


});