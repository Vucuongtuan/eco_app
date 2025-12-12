import DateTime from "./DateTime";



export default function ArticleTitle({title,description,createdAt}: {title:string,description:string,createdAt:string}) {
    return (
        <header className="max-w-screen-2xl container mx-auto px-4 md:px-8 lg:px-16 lg:py-8 mt-6 text-center space-y-2">
            <h1 className=" text-3xl lg:text-4xl  xl:text-6xl font-bold">{title}</h1>
            <p className="text-base lg:text-xl  lg:container">{description}</p>
            <DateTime date={createdAt}/>
        </header>
    );
}