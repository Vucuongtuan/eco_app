




export default function DateTime({date}: {date:string}) {
    const formattedDate = new Date(date).toLocaleDateString();
    return (
        <time className="text-base lg:text-xl">{formattedDate}</time>
    );
}