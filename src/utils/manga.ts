import { db } from "./database";

export function sanitizeDescription(description: string): string {
    const regexp = /You are reading .+, one of the most popular .+ covering in .+ genres, written by.+a top manga site to offering for free\. .+ has \d* translated chapters and translations of other chapters are in progress. Lets enjoy. If you want to get the updates about latest chapters, lets create an account and add .+ to your bookmark. (.+)/;
    const match = description.match(regexp);
    if (match && match[1]) {
        description = match[1];
    } else {
        console.log("No match found in the description. Returning original description.");
        console.log("Original description:", description);
    }

    return description.trim();
}

export type Manga = {
    cover: string;
    id: string;
    title: string;
    description: string;
}

export function getMangaIdFromUrl(url: string): string {
    const match = url.match(/\/manga\/([^/]+)/);
    if (!match) {
        throw new Error(`Invalid manga URL: ${url}`);
    }
    return match[1];
}

export async function getMangaById(id: string): Promise<Manga> {
    const url = `https://www.natomanga.com/manga/${id}`;
    const result = await db.mangas.get(id);
    if (result) {
        console.log("Manga found in cache:", result);
        return result;
    }

    const manga = await fetchManga(url);
    console.log("Refetched manga:", manga);
    const record = {
        id: manga.id,
        cover: manga.cover,
        title: manga.title,
        description: manga.description,
        cachedAt: new Date()
    }
    await db.mangas.put(record);
        console.log("Manga cached:", record);

    return manga;
}

export async function getMangaFromUrl(url: string): Promise<Manga> {
    const id = getMangaIdFromUrl(url);
    return getMangaById(id);
}

export async function fetchManga(url: string): Promise<Manga> {
    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error(`Failed to fetch manga from ${url}: ${resp.statusText}`);
    }
    const text = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    const title = doc.querySelector(".manga-info-text li h1")?.textContent?.trim() || "";
    if (!title) {
        throw new Error("Manga title not found");
    }
    
    const cover = doc.querySelector(".manga-info-pic img")?.getAttribute("src") || "";
    if (!cover) {
        throw new Error("Manga cover not found");
    }

    const descriptionElement = doc.querySelector("#contentBox")
    if (!descriptionElement) {
        throw new Error("Description element not found on the manga page.");
    }
    const textNode = descriptionElement.lastChild;
    const description = sanitizeDescription(textNode!.textContent?.replaceAll("  ", "").replaceAll("\n", " ") ?? "");

    return {
        cover,
        title,
        id: getMangaIdFromUrl(url),
        description
    }
}