import { Post } from "@/payload-types";
import { Media } from "../Media";





export default function ArticleContent({post}: {post: Post}) {
    return (
        <article className=" relative">
           {/* Hero Image */}
           <Media resource={post.image} imgSize={"large"} fClassName={'w-full max-h-screen  object-cover'}/>
        </article>
       
    );
}