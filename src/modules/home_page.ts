import { Module } from "../module";
import { getMangaFromUrl, getMangaIdFromUrl, Manga } from "../utils/manga";

function getElementUrl(element: HTMLElement) {
  const link = (
    element.tagName === "A" ? element : element.closest("a")
  ) as HTMLAnchorElement | null;
  return link?.href || null;
}

export class HomePage extends Module {
  name = "Home Page";
  urlMatch = [/^\/$/, /^\/manga\-list\/.*/];

  init() {
    this.initPreviews();
    this.filterNotifications();
    console.log("Home Page module initialized");
  }

  filterNotifications() {
    // To prevent page jerking, injected css hides the notification by default
    // and this function only adds the "important" class to the notification
    // if it is not something useless like "bookmark our website"

    const notification = document.querySelector(
      ".notification-header"
    ) as HTMLElement | null;
    if (!notification) return;

    const textElement = notification?.querySelector(
      ".notification-content-pc.text"
    );
    if (!textElement) return;

    let hide = false;

    if (
      textElement.textContent?.includes(
        "we highly recommend bookmarking our website"
      )
    ) {
      hide = true;
    }

    if (!hide) {
      notification.classList.add("important");
    }
  }

  initPreviews() {
    let loadedMangaId: string | null = null;
    const card = this.createCardStructure();
    document.body.appendChild(card);
    let hideTimer: NodeJS.Timeout | null = null;
    document.addEventListener("mousemove", (e) => {
      const element = e.target as HTMLElement;
      const url = getElementUrl(element);

      if (
        url &&
        new URL(url).pathname.startsWith("/manga/") &&
        !url.includes("/chapter-")
      ) {
        if (!loadedMangaId || loadedMangaId !== getMangaIdFromUrl(url)) {
          getMangaFromUrl(url).then((manga: Manga) => {
            this.updateCardContent(card, manga);
          });

          loadedMangaId = getMangaIdFromUrl(url);
        }
        card.style.display = "flex";
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
      } else {
        if (!hideTimer)
          hideTimer = setTimeout(() => {
            card.style.display = "none";
          }, 100);
      }

      card.style.left = `${e.pageX + 10}px`;
      card.style.right = "auto";

      if (e.clientY < window.innerHeight / 2) {
        card.style.bottom = "auto";
        card.style.top = `${e.pageY + 10}px`;
      } else {
        card.style.top = "auto";
        card.style.bottom = `${window.innerHeight - e.pageY + 10}px`;
      }
    });
  }

  createCardStructure() {
    const card = document.createElement("div");
    card.className = "manga-card";
    card.style.display = "none";

    const leftCol = document.createElement("div");
    leftCol.className = "left-col";
    card.appendChild(leftCol);

    const cover = document.createElement("img");
    cover.className = "cover";
    leftCol.appendChild(cover);

    const rightCol = document.createElement("div");
    rightCol.className = "right-col";
    card.appendChild(rightCol);

    const title = document.createElement("div");
    title.className = "title";
    rightCol.appendChild(title);

    const description = document.createElement("p");
    description.className = "description";
    rightCol.appendChild(description);

    console.log(card);

    return card;
  }

  updateCardContent(card: HTMLElement, manga: Manga) {
    const cover = card.querySelector(".cover") as HTMLImageElement;
    const title = card.querySelector(".title") as HTMLDivElement;
    const description = card.querySelector(
      ".description"
    ) as HTMLParagraphElement;
    cover.src = manga.cover;
    title.textContent = manga.title;
    description.textContent = manga.description;
  }

  destroy(): void {}
}
