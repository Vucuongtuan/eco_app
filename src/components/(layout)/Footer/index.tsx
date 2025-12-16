import type { Footer } from "@/payload-types";

import { FooterMenu } from "@/components/(layout)/Footer/menu";
import EmailSubscribeForm from "@/components/form/EmailSubscribeForm";
import { LogoIcon } from "@/components/icons/logo";
import { findGlobal } from "@/service/layout";
import { Lang } from "@/types";
import { Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
const { COMPANY_NAME, SITE_NAME } = process.env;

export async function Footer({ lang }: { lang: Lang }) {
  const footer = await findGlobal<Footer>(lang, "footer");
  if (!footer) return null;
  const menu = footer.navItems || [];
  const currentYear = new Date().getFullYear();

  const skeleton =
    "w-full h-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700";

  const name = COMPANY_NAME || SITE_NAME || "";

  return (
    <footer className="text-sm text-neutral-700">
      <div className="container max-w-screen-2xl  w-full mx-auto">
        <div className="flex w-full flex-col gap-6 border-t border-neutral-300 py-12 text-sm md:flex-row md:gap-12">
          {/* Menu */}
          <Suspense
            fallback={
              <div className="flex h-[188px] w-[200px] flex-col gap-2">
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
                <div className={skeleton} />
              </div>
            }
          >
            <FooterMenu menu={menu} />
          </Suspense>

          {/* Empty flex for alignment */}
          <div className="md:ml-auto flex w-full md:w-1/3 lg:w-1/4  gap-4 items-center  ">
            <EmailSubscribeForm />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-b border-neutral-300 py-6 text-sm">
        <div className="container mx-auto max-w-screen-2xl flex w-full flex-col items-center gap-1 md:flex-row md:gap-0">
          <p>&copy; All rights reserved. {currentYear}</p>
          <hr className="mx-4 hidden h-4 w-[1px] border-l border-neutral-400 md:inline-block" />
          <p>Designed in Vucuongtuan</p>
          <div className="md:ml-auto flex gap-3">
            <Link
              href="https://www.linkedin.com/in/vũ-tuấn-cường-b450b9313"
              target="_blank"
            >
              <div className="p-1 rounded-full bg-blue-600">
                <Linkedin className="text-white" size={20} />
              </div>
            </Link>
            <Link
              href="https://github.com/Vucuongtuan/payloadcms_eco_app"
              target="_blank"
            >
              <div className="p-1 rounded-full bg-black">
                <Github className="text-white" size={20} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Name Site */}
      <div className="w-full container max-w-screen-3xl mx-auto h-[120px] md:h-[250px] lg:h-[350px] xl:h-[400px] flex items-center justify-center relative">
        <LogoIcon className="w-full h-auto" fill />
      </div>
    </footer>
  );
}
