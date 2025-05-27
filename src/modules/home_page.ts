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
    let visible = false;

    const card = this.createCardStructure();
    document.body.appendChild(card);
    let hideTimer: NodeJS.Timeout | null = null;
    let showTimer: NodeJS.Timeout | null = null;
    let mangaLoaded = false;
    let thresholdPassed = false;
    let currentUrl: string | null = null;
    let currentMouseEvent: MouseEvent | null = null; // Store current mouse position

    const updateCardPosition = (e: MouseEvent) => {
      card.style.left = `${e.pageX + 10}px`;
      card.style.right = "auto";

      if (e.clientY < window.innerHeight / 2) {
        card.style.bottom = "auto";
        card.style.top = `${e.pageY + 10}px`;
      } else {
        card.style.top = "auto";
        card.style.bottom = `${window.innerHeight - e.pageY + 10}px`;
      }
    };

    const tryShowCard = () => {
      if (mangaLoaded && thresholdPassed && !visible && currentMouseEvent) {
        card.style.display = "flex";
        visible = true;
        updateCardPosition(currentMouseEvent); // Position it at current mouse location
      }
    };

    document.addEventListener("mousemove", (e) => {
      currentMouseEvent = e; // Always store current mouse position

      const element = e.target as HTMLElement;
      const url = getElementUrl(element);

      if (
        url &&
        new URL(url).pathname.startsWith("/manga/") &&
        !url.includes("/chapter-")
      ) {
        // Clear hide timer if we're back on a manga link
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }

        // Only start loading/timing if this is a new URL or we're not already processing
        if (url !== currentUrl) {
          // Reset states for new URL
          mangaLoaded = false;
          thresholdPassed = false;
          currentUrl = url;

          // Clear any existing show timer
          if (showTimer) {
            clearTimeout(showTimer);
          }

          // Start loading manga immediately
          if (!loadedMangaId || loadedMangaId !== getMangaIdFromUrl(url)) {
            getMangaFromUrl(url).then((manga: Manga) => {
              // Only update if we're still on the same URL
              if (currentUrl === url) {
                this.updateCardContent(card, manga);
                loadedMangaId = getMangaIdFromUrl(url);
                mangaLoaded = true;
                tryShowCard();
              }
            });
          } else {
            // Manga already loaded for this URL
            mangaLoaded = true;
          }

          // Start threshold timer
          showTimer = setTimeout(() => {
            if (currentUrl === url) {
              thresholdPassed = true;
              tryShowCard();
            }
            showTimer = null;
          }, 500); // 300ms threshold delay
        }
      } else {
        // Clear show timer and reset states if we leave the manga link
        if (showTimer) {
          clearTimeout(showTimer);
          showTimer = null;
        }

        mangaLoaded = false;
        thresholdPassed = false;
        currentUrl = null;

        // Hide if currently visible
        if (visible && !hideTimer) {
          hideTimer = setTimeout(() => {
            card.style.display = "none";
            visible = false;
          }, 100);
        }
      }

      // Update position if card is visible
      if (visible) {
        updateCardPosition(e);
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
