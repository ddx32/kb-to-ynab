// import "./style.css";
import iconv from "iconv-lite";
import { arrayBufferToBuffer } from "./arrayBufferToBuffer";
import getYnabCsv from "./getYnabCsv";

const fileInput = document.querySelector<HTMLDivElement>("#csv-file-input")!;

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
}

fileInput.addEventListener("change", (event: Event) => {
  if (!event || !event.target || !event.target) {
    return;
  }

  const inputElement = event.target as HTMLInputElement;
  const fileList = inputElement.files as FileList;
  if (fileList.length !== 1) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", (event: ProgressEvent<FileReader>) => {
    if (!event.target) {
      return;
    }

    const arrayBuffer = <ArrayBuffer>event.target.result;

    const fileBuffer = arrayBufferToBuffer(arrayBuffer);
    const decodedString = iconv.decode(fileBuffer, "win1250");
    getYnabCsv(decodedString).then(createDownload);
  });
  reader.readAsArrayBuffer(fileList[0]);
});
