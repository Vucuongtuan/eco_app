import Script from "next/script";
import React from "react";

export const BingUET: React.FC = () => {
  if (process.env.NODE_ENV !== "production") return null;
  const id = process.env.NEXT_PUBLIC_BING_UET_ID;
  if (!id) return null;

  return (
    <>
      <Script
        id="bing-uet"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${id}"};o.q=o.q||[],w[u].push(o)},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||f()},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","https://bat.bing.com/bat.js","uetq");`,
        }}
      />
      <noscript>
        <img
          src={`https://bat.bing.com/action/0?ti=${id}&Ver=2`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          alt=""
        />
      </noscript>
    </>
  );
};
