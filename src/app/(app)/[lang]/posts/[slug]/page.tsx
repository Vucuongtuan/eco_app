import ArticleTitle from "@/components/Article/ArticleTItle";
import Share from "@/components/Article/Share";
import { Media } from "@/components/Media";
import { RichText } from "@/components/RichText";
import { findPostBySlug } from "@/service/posts";
import { Lang } from "@/types";
import { notFound } from "next/navigation";






export default async function PostDetails({
    params,
}:{params:Promise<{lang:string,slug:string}>}) {
    const {lang,slug} = await params;
    const post = await findPostBySlug({slug,lang:lang as Lang});
    
    if (!post) {
        return notFound();
    }
    return(
         <>
         {/* Hero Media */}
        <Media resource={post.image} imgSize={"large"} fClassName={'w-full h-full max-h-[40vh] min-h-[40vh] md:min-h-[800px] md:max-h-[60vh]  relative object-cover'} imgClassName="w-full h-full object-cover" fill/>
        
        {/* Article */}
        <article className="relative">
            <ArticleTitle title={post.title as string} description={post.description as string} createdAt={post.createdAt as string}/>
            
            <div className="hidden lg:block fixed top-1/2 right-8 -translate-y-1/2 z-10">
                <Share 
                    title={post.title as string} 
                    description={post.description as string}
                    slug={post.slug as string}
                />
            </div>

            <div className="container mx-auto py-8 post-content">
               {post.content && <RichText data={post.content} className="prose md:prose-md lg:prose-2xl mx-auto"/>}
            </div>

            <div className="lg:hidden container mx-auto px-4 pb-8">
                <Share 
                    title={post.title as string} 
                    description={post.description as string}
                    slug={post.slug as string}
                />
            </div>
        </article>
    </>
    );
}