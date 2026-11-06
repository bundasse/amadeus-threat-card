import JSZip from "jszip";
import FileSaver from "file-saver";
import { toPng, toJpeg, getFontEmbedCSS } from "html-to-image";

export const CARD_WIDTH = 591;
export const CARD_HEIGHT = 887;

/**
 * dataURL -> Blob 변환
 */
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * 카드 DOM 1개를 이미지 Blob 으로 변환
 * @param {HTMLElement} el 캡처할 카드 엘리먼트
 * @param {{format?: "png"|"jpg", pixelRatio?: number, quality?: number, fontEmbedCSS?: string}} options
 */
export async function captureCardBlob(el, options = {}) {
  const { format = "png", pixelRatio = 2, quality = 0.95, fontEmbedCSS } = options;

  const shared = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    pixelRatio,
    backgroundColor: "#ffffff", // JPG 는 투명도가 없으므로 필수
    fontEmbedCSS, // 미리 계산한 폰트 CSS 재사용 (성능 핵심)
  };

  const dataUrl =
    format === "jpg"
      ? await toJpeg(el, { ...shared, quality })
      : await toPng(el, shared);

  return dataUrlToBlob(dataUrl);
}

/**
 * 카드 엘리먼트 여러 개를 PNG/JPG 로 만들어 ZIP 으로 저장
 * @param {NodeList|HTMLElement[]} elements 캡처할 카드 엘리먼트 목록
 * @param {{
 *   fileName?: string, format?: "png"|"jpg", pixelRatio?: number, quality?: number,
 *   onProgress?: (done: number, total: number) => void,
 *   shouldCancel?: () => boolean
 * }} options
 */
export async function downloadCardsZip(elements, options = {}) {
  const {
    fileName = `cards_${Date.now()}`,
    format = "png",
    pixelRatio = 2,
    quality = 0.95,
    onProgress,
    shouldCancel,
  } = options;

  const list = Array.from(elements || []);
  if (!list.length) {
    throw new Error("저장할 카드가 없습니다.");
  }

  // 웹폰트 로딩 완료 대기 (한글이 기본 폰트로 깨지는 것 방지)
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // 폰트 임베딩 CSS 를 한 번만 계산해서 모든 카드에 재사용
  let fontEmbedCSS;
  try {
    fontEmbedCSS = await getFontEmbedCSS(list[0]);
  } catch (e) {
    // 폰트 임베딩 실패 시 라이브러리가 카드마다 직접 처리하도록 둔다
    console.warn("[cardExport] 폰트 임베딩 실패:", e);
  }

  const zip = new JSZip();
  const total = list.length;

  for (let i = 0; i < total; i += 1) {
    if (shouldCancel && shouldCancel()) {
      throw new Error("CANCELED");
    }

    const blob = await captureCardBlob(list[i], { format, pixelRatio, quality, fontEmbedCSS });
    const name = `card_${String(i + 1).padStart(3, "0")}.${format}`;
    zip.file(name, blob);

    if (onProgress) {
      onProgress(i + 1, total);
    }

    // 진행률 UI 가 갱신되도록 브라우저에 제어권 양보
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // 이미지 파일은 이미 압축되어 있으므로 STORE 가 훨씬 빠르다
  const zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
  FileSaver.saveAs(zipBlob, `${fileName}.zip`);
}

/**
 * 카드 엘리먼트들을 인쇄 (카드 1장 = 1페이지)
 * 현재 페이지의 스타일시트를 그대로 복사해 iframe 에서 인쇄하므로
 * Tailwind / 카드 폰트 스타일이 그대로 유지된다.
 * @param {NodeList|HTMLElement[]} elements 인쇄할 카드 엘리먼트 목록
 */
export async function printCards(elements) {
  const list = Array.from(elements || []);
  if (!list.length) {
    throw new Error("인쇄할 카드가 없습니다.");
  }

  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
  });
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  doc.open();
  doc.write("<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>");
  doc.close();

  // 현재 문서의 스타일시트(Tailwind, @font-face 포함) 복사
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    const clone = node.cloneNode(true);
    if (clone.tagName === "LINK" && node.getAttribute("href")) {
      // about:blank 문서에서도 상대 경로 CSS 가 로드되도록 절대 URL 로 변환
      clone.href = new URL(node.getAttribute("href"), document.baseURI).href;
    }
    doc.head.appendChild(clone);
  });

  const pageStyle = doc.createElement("style");
  pageStyle.textContent = `
    @page { size: A4 portrait; margin: 10mm; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .print-item {
      width: ${CARD_WIDTH}px;
      height: ${CARD_HEIGHT}px;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .print-item:last-child { page-break-after: auto; break-after: auto; }
  `;
  doc.head.appendChild(pageStyle);

  list.forEach((el) => {
    const wrap = doc.createElement("div");
    wrap.className = "print-item";
    wrap.appendChild(el.cloneNode(true));
    doc.body.appendChild(wrap);
  });

  // 인쇄용 문서의 폰트/이미지 로딩 대기
  try {
    await doc.fonts.ready;
  } catch (e) {
    // fonts API 미지원 브라우저는 무시
  }
  await new Promise((resolve) => setTimeout(resolve, 150));
  await Promise.all(
    Array.from(doc.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          })
    )
  );

  const cleanup = () => iframe.remove();
  iframe.contentWindow.addEventListener("afterprint", cleanup);

  iframe.contentWindow.focus();
  iframe.contentWindow.print();

  // afterprint 가 발생하지 않는 브라우저 대비
  setTimeout(cleanup, 60000);
}
