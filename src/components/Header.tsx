import { ReactNode, useCallback } from "react";
import classNames from "clsx";
import { AppWindowIcon } from "lucide-react";
import { TabInfo } from "../core/types";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";

export default function Header({
  tab,
  toolbar,
  subHeader,
}: {
  tab: TabInfo;
  toolbar?: ReactNode;
  subHeader?: ReactNode;
}) {
  const openTab = useCallback(async () => {
    try {
      const tabInstance = await chrome.tabs.get(tab.id).catch(() => null);

      const setActive = (tabId: number) =>
        chrome.tabs.update(tabId, { active: true });

      if (tabInstance) {
        await setActive(tab.id);
      } else {
        const matched = await chrome.tabs.query({ url: tab.url });

        if (matched.length > 0) {
          await setActive(matched[0].id!);
        } else {
          await chrome.tabs.create({
            url: tab.url,
            active: true,
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [tab]);

  return (
    <header className="sticky top-0 w-full z-50">
      <nav
        className={classNames(
          "h-16 container max-w-3xl px-4 bg-white",
          "flex items-center",
          "min-w-0"
        )}
      >
        <Avatar
          className={classNames(
            "mr-4 h-10 w-auto p-1",
            "rounded-sm border border-border",
            "bg-muted/75 text-foreground"
          )}
        >
          <AvatarImage src={tab.favIconUrl} alt="" />
          <AvatarFallback className="rounded-none bg-transparent">
            <AppWindowIcon className="h-full w-auto" />
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center justify-end w-full min-w-0">
          <div className="truncate mr-auto text-base font-semibold leading-snug">
            {tab.title}

            <div className="flex items-center justify-end max-w-[16rem] min-w-0">
              <button
                type="button"
                className={classNames(
                  "text-xs font-normal border-none bg-none hover:underline",
                  "truncate mr-auto"
                )}
                onClick={() => openTab()}
              >
                {formatURL(tab.url)}
              </button>
            </div>
          </div>

          {toolbar}
        </div>
      </nav>

      <Separator />

      {subHeader}
    </header>
  );
}

function formatURL(url: string) {
  url = url.replace(/^(?:(ht|f)tp(s?)\:\/\/)?/, "").replace("www.", "");
  if (url.endsWith("/")) url = url.substring(0, url.length - 1);

  return url;
}
