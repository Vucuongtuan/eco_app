import { GoogleTagManager } from "@next/third-parties/google";


export default function GoogleTag() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!gtmId) return null;


  return (
    <>
      <GoogleTagManager gtmId={gtmId || 'abc123'} />
    </>
  );
}
     