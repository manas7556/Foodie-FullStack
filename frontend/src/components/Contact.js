const Contact =() =>{
    return(
        <div>
            <h1 className="font-bold text-3xl">
                Contact Us
            </h1>
            <form>
                <input type="text" className="border black p-2 m-2" placeholder="name"/>
                <input type="text" className="border black p-2 m-2" placeholder="message"/>
                <button>Submit</button>
            </form>
        </div>
    );
};

export default Contact;