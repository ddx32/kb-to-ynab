import "./style.css";
import iconv from "iconv-lite";
import { arrayBufferToBuffer } from "./arrayBufferToBuffer";
import getYnabCsv from "./getYnabCsv";

const dropZone = document.querySelector<HTMLDivElement>("#drop-zone")!;

function createDownload(textContents: string): void {
  const blob = new Blob([textContents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const filename = "kb-to-ynab-export.csv";
  const downloadLink =
    document.querySelector<HTMLAnchorElement>("#download-link");
  if (!downloadLink) {
    return;
  }

  downloadLink.download = filename;
  downloadLink.href = url;
  downloadLink.classList.remove("hidden");
}

document.addEventListener("dragover", function (event) {
  event.preventDefault();
});

dropZone.addEventListener("dragenter", (event: DragEvent) => {
  event.preventDefault();
  dropZone.classList.add("dragover-active");
});

dropZone.addEventListener("dragleave", (event: Event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover-active");
});

dropZone.addEventListener("drop", (event: DragEvent) => {
  event.preventDefault();

  dropZone.classList.remove("dragover-active");

  if (
    !event.dataTransfer ||
    !event.dataTransfer.items ||
    event.dataTransfer.items.length !== 1
  ) {
    return;
  }

  const item = event.dataTransfer.items[0];

  if (item.kind !== "file" || item.type !== "text/csv") {
    console.error("Error, go home");
    return;
  }

  const file = <File>item.getAsFile();

  file.arrayBuffer().then((arrayBuffer) => {
    const fileBuffer = arrayBufferToBuffer(arrayBuffer);
    const decodedString = iconv.decode(fileBuffer, "win1250");
    getYnabCsv(decodedString).then(createDownload);
  });
});
