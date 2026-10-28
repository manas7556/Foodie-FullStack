import User from "./User";
import UserClass from "./UserClass";

const About =()=>{
    return(
        <div>
            <h1>About</h1>
            <h2>This is Namaste React series</h2>
            
            <UserClass name={"Manas(class)"} location = {"Jharsuguda"}/>
        </div>
    );
};

export default About;