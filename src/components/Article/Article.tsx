import { Post } from "@/payload-types";
import { Media } from "../Media";
import { RichText } from "../RichText";
import ArticleTitle from "./ArticleTItle";
import Share from "./Share";

export default function Article({ post }: { post: Post }) {
  return (
    <>
      <Media
        resource={post.image}
        imgSize={"large"}
        fClassName={
          "w-full h-full max-h-[40vh] min-h-[40vh] md:min-h-[800px] md:max-h-[60vh]  relative object-cover"
        }
        imgClassName="w-full h-full object-cover"
        fill
      />

      {/* Article */}
      <article className="relative">
        <ArticleTitle
          title={post.title as string}
          description={post.description as string}
          createdAt={post.createdAt as string}
        />

        {/* Share Button - Sticky on desktop */}
        <div className="hidden lg:block fixed top-1/2 right-8 -translate-y-1/2 z-10">
          <Share
            title={post.title as string}
            description={post.description as string}
            slug={post.slug as string}
          />
        </div>

        <div className="container mx-auto py-8 post-content">
          {post.content && (
            <RichText
              data={post.content}
              className="prose md:prose-md lg:prose-2xl mx-auto"
            />
          )}
        </div>

        {/* Share Button - Bottom on mobile */}
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
