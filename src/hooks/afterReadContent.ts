import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

export const afterReadContent = async (props: any) => {
  const isMobile = await props.req.headers.get("isMobile");
  if (isMobile === "true") {
    const convertHTML = convertLexicalToHTML({ data: props.value });
    return convertHTML;
  }
  return props.value;
};
